import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
	ChevronDown,
	ChevronDownIcon,
	ChevronUp,
	ListPlus,
	Plus,
	XIcon,
} from "lucide-react";
import type { Control, UseFormReturn } from "react-hook-form";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ScreeningQuestionnaireResource } from "@/api/generated/models";
import { ScreeningQuestionTypeEnum } from "@/api/generated/models";
import {
	getShowScreeningQuestionnaireQueryKey,
	useStoreScreeningQuestionnaire,
	useUpdateScreeningQuestionnaire,
} from "@/api/generated/screening-questionnaire/screening-questionnaire";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
	emptyQuestion,
	type IScreeningQuestionnaireSchema,
	ScreeningQuestionnaireSchema,
} from "@/schemas/screening-questionnaire/ScreeningQuestionnaireSchema";
import {
	getOrderedOptions,
	getOrderedQuestions,
} from "@/types/screening-questionnaire";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { formatDateOnly, parseLocalDateFromIso } from "@/utils/date-only";
import { onError } from "@/utils/on-error";

interface QuestionCardProps {
	index: number;
	total: number;
	form: UseFormReturn<IScreeningQuestionnaireSchema>;
	onRemove: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

/** Uma pergunta do questionário, com as alternativas quando o tipo pede. */
function QuestionCard({
	index,
	total,
	form,
	onRemove,
	onMoveUp,
	onMoveDown,
}: QuestionCardProps) {
	const { t } = useTranslation();

	const control = form.control as Control<IScreeningQuestionnaireSchema>;

	const {
		fields: options,
		append: appendOption,
		remove: removeOption,
	} = useFieldArray({ control, name: `questions.${index}.options` });

	const type = useWatch({ control, name: `questions.${index}.type` });

	const isEssay = type === ScreeningQuestionTypeEnum.essay;

	// A troca de tipo precisa manter a pergunta válida para a API
	const changeType = (nextType: ScreeningQuestionTypeEnum) => {
		form.setValue(`questions.${index}.type`, nextType);

		if (nextType === ScreeningQuestionTypeEnum.essay) {
			form.setValue(`questions.${index}.options`, []);
			return;
		}

		if (options.length === 0) {
			form.setValue(`questions.${index}.options`, [
				{ option: "" },
				{ option: "" },
			]);
		}
	};

	const optionsError = form.formState.errors.questions?.[index]?.options;

	return (
		<Card className="flex flex-col gap-4 p-4">
			<div className="flex flex-row items-center gap-2">
				<Badge variant={"secondary"}>{index + 1}</Badge>
				<div className="flex flex-1 flex-row justify-end gap-1">
					<Button
						type="button"
						size={"icon"}
						variant={"ghost"}
						disabled={index === 0}
						onClick={onMoveUp}
						aria-label={t("screening_questionnaire.form.move_up")}
					>
						<ChevronUp />
					</Button>
					<Button
						type="button"
						size={"icon"}
						variant={"ghost"}
						disabled={index === total - 1}
						onClick={onMoveDown}
						aria-label={t("screening_questionnaire.form.move_down")}
					>
						<ChevronDown />
					</Button>
					<Button
						type="button"
						size={"icon"}
						variant={"ghost"}
						disabled={total === 1}
						onClick={onRemove}
						aria-label={t("general.remove")}
					>
						<XIcon />
					</Button>
				</div>
			</div>
			<Controller
				control={control}
				name={`questions.${index}.question`}
				render={({ field, fieldState }) => (
					<Field>
						<FieldLabel>
							{t("screening_questionnaire.form.question")}
						</FieldLabel>
						<Textarea
							{...field}
							placeholder={t(
								"screening_questionnaire.form.question_placeholder",
							)}
							aria-invalid={fieldState.invalid}
						/>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
				<Field className="flex-1">
					<FieldLabel>{t("screening_questionnaire.form.type")}</FieldLabel>
					<Select
						value={type}
						onValueChange={(value) =>
							changeType(value as ScreeningQuestionTypeEnum)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.values(ScreeningQuestionTypeEnum).map((questionType) => (
								<SelectItem key={questionType} value={questionType}>
									{t(`enum.screening_question_type.${questionType}`)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<Controller
					control={control}
					name={`questions.${index}.is_required`}
					render={({ field }) => (
						<div className="flex flex-row items-center gap-2 sm:pb-2">
							<Switch
								id={`question-required-${index}`}
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
							<FieldLabel htmlFor={`question-required-${index}`}>
								{t("screening_questionnaire.form.is_required")}
							</FieldLabel>
						</div>
					)}
				/>
			</div>
			{!isEssay && (
				<Field>
					<FieldLabel>{t("screening_questionnaire.form.options")}</FieldLabel>
					<div className="flex flex-col gap-2">
						{options.map((option, optionIndex) => (
							<Controller
								key={option.id}
								control={control}
								name={`questions.${index}.options.${optionIndex}.option`}
								render={({ field, fieldState }) => (
									<div className="flex flex-col gap-1">
										<div className="flex flex-row items-center gap-2">
											<Input
												{...field}
												placeholder={t(
													"screening_questionnaire.form.option_placeholder",
												)}
												aria-invalid={fieldState.invalid}
											/>
											<Button
												type="button"
												size={"icon"}
												variant={"ghost"}
												onClick={() => removeOption(optionIndex)}
												aria-label={t("general.remove")}
											>
												<XIcon />
											</Button>
										</div>
										<FieldError errors={[fieldState.error]} />
									</div>
								)}
							/>
						))}
					</div>
					<Button
						type="button"
						size={"sm"}
						variant={"secondary"}
						className="w-fit"
						onClick={() => appendOption({ option: "" })}
					>
						<Plus />
						{t("screening_questionnaire.form.add_option")}
					</Button>
					{/* O erro do array de alternativas não pertence a nenhum campo */}
					<FieldError errors={[optionsError as { message?: string }]} />
				</Field>
			)}
		</Card>
	);
}

interface QuestionnaireFormProps {
	vacancyId: string;
	/** Ausente no cadastro, presente na edição do questionário já criado. */
	questionnaire?: ScreeningQuestionnaireResource;
	onSaved: () => void;
	onCancel: () => void;
}

export default function QuestionnaireForm({
	vacancyId,
	questionnaire,
	onSaved,
	onCancel,
}: QuestionnaireFormProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const isUpdate = !!questionnaire;

	const form = useForm<IScreeningQuestionnaireSchema>({
		resolver: zodResolver(ScreeningQuestionnaireSchema),
		defaultValues: questionnaire
			? {
					title: questionnaire.title,
					description: questionnaire.description ?? "",
					due_date: "",
					questions: getOrderedQuestions(questionnaire).map((question) => ({
						id: question.id,
						question: question.question,
						// O contrato gerado tipa `type` como string, mas o valor é do enum
						type: question.type as ScreeningQuestionTypeEnum,
						is_required: question.is_required,
						options: getOrderedOptions(question).map((option) => ({
							id: option.id,
							option: option.option,
						})),
					})),
				}
			: {
					title: "",
					description: "",
					due_date: "",
					questions: [emptyQuestion()],
				},
	});

	const {
		fields: questions,
		append: appendQuestion,
		remove: removeQuestion,
		swap: swapQuestions,
	} = useFieldArray({ control: form.control, name: "questions" });

	const { mutateAsync: createQuestionnaire, isPending: isCreating } =
		useStoreScreeningQuestionnaire();

	const { mutateAsync: updateQuestionnaire, isPending: isUpdating } =
		useUpdateScreeningQuestionnaire();

	const isPending = isCreating || isUpdating;

	const submit = async (data: IScreeningQuestionnaireSchema) => {
		// A ordem é a posição na lista, tanto das perguntas quanto das alternativas
		const questionsPayload = data.questions.map((question, index) => ({
			id: question.id,
			question: question.question,
			type: question.type,
			is_required: question.is_required,
			order: index + 1,
			options:
				question.type === ScreeningQuestionTypeEnum.essay
					? undefined
					: question.options.map((option, optionIndex) => ({
							id: option.id,
							option: option.option,
							order: optionIndex + 1,
						})),
		}));

		try {
			if (questionnaire) {
				await updateQuestionnaire({
					id: questionnaire.id,
					data: {
						title: data.title,
						description: data.description || undefined,
						questions: questionsPayload,
					},
				});

				CustomToaster.successToast(
					t("toast.success.screening_questionnaire_updated"),
				);
			} else {
				await createQuestionnaire({
					jobVacancyId: vacancyId,
					data: {
						title: data.title,
						description: data.description || undefined,
						due_date: data.due_date || undefined,
						questions: questionsPayload,
					},
				});

				CustomToaster.successToast(
					t("toast.success.screening_questionnaire_created"),
				);
			}

			queryClient.invalidateQueries({
				queryKey: getShowScreeningQuestionnaireQueryKey(vacancyId),
			});

			onSaved();
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-6">
			<div className="flex flex-col gap-4">
				<Controller
					control={form.control}
					name="title"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>{t("screening_questionnaire.form.title")}</FieldLabel>
							<Input
								{...field}
								placeholder={t(
									"screening_questionnaire.form.title_placeholder",
								)}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="description"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>
								{t("screening_questionnaire.form.description")}
							</FieldLabel>
							<Textarea
								{...field}
								placeholder={t(
									"screening_questionnaire.form.description_placeholder",
								)}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				{/* A API só aceita o prazo no cadastro, junto com o envio aos candidatos */}
				{!isUpdate && (
					<Controller
						control={form.control}
						name="due_date"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>
									{t("screening_questionnaire.form.due_date")}
								</FieldLabel>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant={"outline"}
											className={cn(
												"w-full justify-between text-left font-normal sm:w-72",
												!field.value && "text-muted-foreground",
											)}
										>
											{field.value ||
												t("screening_questionnaire.form.due_date_placeholder")}
											<ChevronDownIcon className="h-4 w-4 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={parseLocalDateFromIso(field.value ?? "")}
											onSelect={(date) =>
												field.onChange(date ? formatDateOnly(date) : "")
											}
											// A API exige uma data futura (`after:today`)
											disabled={(date) =>
												date <= new Date(new Date().toDateString())
											}
										/>
									</PopoverContent>
								</Popover>
								<p className="text-sm text-muted-foreground">
									{t("screening_questionnaire.form.due_date_description")}
								</p>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
				)}
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex flex-row flex-wrap items-center justify-between gap-2">
					<h3 className="text-lg font-bold">
						{t("screening_questionnaire.form.questions")}
					</h3>
					<Button
						type="button"
						variant={"secondary"}
						onClick={() => appendQuestion(emptyQuestion())}
					>
						<ListPlus />
						{t("screening_questionnaire.form.add_question")}
					</Button>
				</div>
				{questions.map((question, index) => (
					<QuestionCard
						key={question.id}
						index={index}
						total={questions.length}
						form={form}
						onRemove={() => removeQuestion(index)}
						onMoveUp={() => swapQuestions(index, index - 1)}
						onMoveDown={() => swapQuestions(index, index + 1)}
					/>
				))}
				<FieldError
					errors={[
						form.formState.errors.questions?.root as { message?: string },
					]}
				/>
			</div>
			<div className="flex flex-row flex-wrap justify-end gap-2">
				<Button type="button" variant={"secondary"} onClick={onCancel}>
					{t("general.cancel")}
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? <Spinner /> : t("general.save")}
				</Button>
			</div>
		</form>
	);
}
