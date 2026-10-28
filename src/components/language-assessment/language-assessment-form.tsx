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
import { getIndexStepAppliesQueryKey } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { getShowJobVacancyQueryKey } from "@/api/generated/job-vacancy/job-vacancy";
import {
	getShowLanguageAssessmentQueryKey,
	useStoreLanguageAssessment,
	useUpdateLanguageAssessment,
} from "@/api/generated/language-assessment/language-assessment";
import type { LanguageAssessmentResource } from "@/api/generated/models";
import { LanguageAssessmentQuestionTypeEnum } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
	emptyQuestion,
	type ILanguageAssessmentSchema,
	LanguageAssessmentSchema,
	sumWeights,
	toPassingScore,
} from "@/schemas/language-assessment/LanguageAssessmentSchema";
import {
	getExpectedAnswers,
	getOrderedOptions,
	getOrderedQuestions,
	getPassingScore,
	getQuestionType,
	getQuestionWeight,
	optionIsCorrect,
} from "@/types/language-assessment";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	apiDateOnly,
	formatDateOnly,
	parseLocalDateFromIso,
} from "@/utils/date-only";
import { onError } from "@/utils/on-error";

/**
 * Erro de uma lista do formulário. O resolver guarda em `root` o erro de uma
 * lista que já tem itens, e no próprio campo o de uma lista vazia.
 */
function listError(error: unknown): { message?: string } | undefined {
	if (!error || typeof error !== "object") return undefined;

	const { root, message } = error as {
		root?: { message?: string };
		message?: string;
	};

	return root ?? (message ? { message } : undefined);
}

/** Valores do formulário a partir da prova salva, na ordem definida pela empresa. */
function toFormValues(
	assessment: LanguageAssessmentResource,
): ILanguageAssessmentSchema {
	return {
		title: assessment.title,
		description: assessment.description ?? "",
		language: assessment.language,
		passing_score: getPassingScore(assessment)?.toString() ?? "",
		due_date: apiDateOnly(assessment.due_date),
		questions: getOrderedQuestions(assessment).map((question) => ({
			id: question.id,
			question: question.question,
			type: getQuestionType(question),
			weight: getQuestionWeight(question),
			options: getOrderedOptions(question).map((option) => ({
				id: option.id,
				option: option.option,
				is_correct: optionIsCorrect(option),
			})),
			expected_answers: getExpectedAnswers(question).map((value) => ({
				value,
			})),
		})),
	};
}

interface QuestionCardProps {
	index: number;
	total: number;
	form: UseFormReturn<ILanguageAssessmentSchema>;
	onRemove: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

/** Uma pergunta da prova, com o gabarito no formato que o tipo pede. */
function QuestionCard({
	index,
	total,
	form,
	onRemove,
	onMoveUp,
	onMoveDown,
}: QuestionCardProps) {
	const { t } = useTranslation();

	const control = form.control as Control<ILanguageAssessmentSchema>;

	const {
		fields: options,
		append: appendOption,
		remove: removeOption,
	} = useFieldArray({ control, name: `questions.${index}.options` });

	const {
		fields: expectedAnswers,
		append: appendExpectedAnswer,
		remove: removeExpectedAnswer,
	} = useFieldArray({ control, name: `questions.${index}.expected_answers` });

	const type = useWatch({ control, name: `questions.${index}.type` });

	const optionValues = useWatch({
		control,
		name: `questions.${index}.options`,
	});

	const isText = type === LanguageAssessmentQuestionTypeEnum.text;
	const isSingleChoice =
		type === LanguageAssessmentQuestionTypeEnum.single_choice;

	const correctIndex = (optionValues ?? []).findIndex(
		(option) => option.is_correct,
	);

	const questionErrors = form.formState.errors.questions?.[index];

	// Depois do primeiro envio o gabarito é revalidado a cada mudança, para o erro
	// da lista sumir assim que for corrigido
	const revalidate = () => {
		if (form.formState.isSubmitted) {
			form.trigger(`questions.${index}`);
		}
	};

	// A troca de tipo precisa manter a pergunta válida para a API
	const changeType = (nextType: LanguageAssessmentQuestionTypeEnum) => {
		form.setValue(`questions.${index}.type`, nextType);

		if (nextType === LanguageAssessmentQuestionTypeEnum.text) {
			form.setValue(`questions.${index}.options`, []);

			if (expectedAnswers.length === 0) {
				form.setValue(`questions.${index}.expected_answers`, [{ value: "" }]);
			}

			revalidate();
			return;
		}

		form.setValue(`questions.${index}.expected_answers`, []);

		if (options.length === 0) {
			form.setValue(`questions.${index}.options`, [
				{ option: "", is_correct: false },
				{ option: "", is_correct: false },
			]);
		} else if (nextType === LanguageAssessmentQuestionTypeEnum.single_choice) {
			// A escolha única aceita só uma alternativa certa: fica a primeira marcada
			form.setValue(
				`questions.${index}.options`,
				(optionValues ?? []).map((option, optionIndex) => ({
					...option,
					is_correct: optionIndex === correctIndex,
				})),
			);
		}

		revalidate();
	};

	const markSingleCorrect = (nextCorrectIndex: number) => {
		options.forEach((_, optionIndex) => {
			form.setValue(
				`questions.${index}.options.${optionIndex}.is_correct`,
				optionIndex === nextCorrectIndex,
			);
		});

		revalidate();
	};

	const optionRows = options.map((option, optionIndex) => (
		<Controller
			key={option.id}
			control={control}
			name={`questions.${index}.options.${optionIndex}.option`}
			render={({ field, fieldState }) => (
				<div className="flex flex-col gap-1">
					<div className="flex flex-row items-center gap-2">
						{isSingleChoice ? (
							<RadioGroupItem
								value={String(optionIndex)}
								aria-label={t("language_assessment.form.mark_correct")}
							/>
						) : (
							<Controller
								control={control}
								name={`questions.${index}.options.${optionIndex}.is_correct`}
								render={({ field: correctField }) => (
									<Checkbox
										checked={correctField.value}
										onCheckedChange={(checked) => {
											correctField.onChange(checked === true);
											revalidate();
										}}
										aria-label={t("language_assessment.form.mark_correct")}
									/>
								)}
							/>
						)}
						<Input
							{...field}
							placeholder={t("language_assessment.form.option_placeholder")}
							aria-invalid={fieldState.invalid}
							className={cn(
								optionValues?.[optionIndex]?.is_correct &&
									"border-emerald-500 focus-visible:border-emerald-500",
							)}
						/>
						<Button
							type="button"
							size={"icon"}
							variant={"ghost"}
							onClick={() => {
								removeOption(optionIndex);
								revalidate();
							}}
							aria-label={t("general.remove")}
						>
							<XIcon />
						</Button>
					</div>
					<FieldError errors={[fieldState.error]} />
				</div>
			)}
		/>
	));

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
						aria-label={t("language_assessment.form.move_up")}
					>
						<ChevronUp />
					</Button>
					<Button
						type="button"
						size={"icon"}
						variant={"ghost"}
						disabled={index === total - 1}
						onClick={onMoveDown}
						aria-label={t("language_assessment.form.move_down")}
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
						<FieldLabel>{t("language_assessment.form.question")}</FieldLabel>
						<Textarea
							{...field}
							placeholder={t("language_assessment.form.question_placeholder")}
							aria-invalid={fieldState.invalid}
						/>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
				<Field className="flex-1">
					<FieldLabel>{t("language_assessment.form.type")}</FieldLabel>
					<Select
						value={type}
						onValueChange={(value) =>
							changeType(value as LanguageAssessmentQuestionTypeEnum)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.values(LanguageAssessmentQuestionTypeEnum).map(
								(questionType) => (
									<SelectItem key={questionType} value={questionType}>
										{t(
											`enum.language_assessment_question.type.${questionType}`,
										)}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</Field>
				<Controller
					control={control}
					name={`questions.${index}.weight`}
					render={({ field, fieldState }) => (
						<Field className="sm:w-32">
							<FieldLabel>{t("language_assessment.form.weight")}</FieldLabel>
							<Input
								{...field}
								type="number"
								min={1}
								max={100}
								step={1}
								value={field.value ?? ""}
								onChange={(event) => field.onChange(event.target.value)}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
			</div>
			{isText ? (
				<Field>
					<FieldLabel>
						{t("language_assessment.form.expected_answers")}
					</FieldLabel>
					<p className="text-sm text-muted-foreground">
						{t("language_assessment.form.expected_answers_description")}
					</p>
					<div className="flex flex-col gap-2">
						{expectedAnswers.map((expectedAnswer, expectedIndex) => (
							<Controller
								key={expectedAnswer.id}
								control={control}
								name={`questions.${index}.expected_answers.${expectedIndex}.value`}
								render={({ field, fieldState }) => (
									<div className="flex flex-col gap-1">
										<div className="flex flex-row items-center gap-2">
											<Input
												{...field}
												placeholder={t(
													"language_assessment.form.expected_answer_placeholder",
												)}
												aria-invalid={fieldState.invalid}
											/>
											<Button
												type="button"
												size={"icon"}
												variant={"ghost"}
												onClick={() => {
													removeExpectedAnswer(expectedIndex);
													revalidate();
												}}
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
						onClick={() => {
							appendExpectedAnswer({ value: "" });
							revalidate();
						}}
					>
						<Plus />
						{t("language_assessment.form.add_expected_answer")}
					</Button>
					<FieldError errors={[listError(questionErrors?.expected_answers)]} />
				</Field>
			) : (
				<Field>
					<FieldLabel>{t("language_assessment.form.options")}</FieldLabel>
					<p className="text-sm text-muted-foreground">
						{t(
							isSingleChoice
								? "language_assessment.form.options_single_description"
								: "language_assessment.form.options_multiple_description",
						)}
					</p>
					{isSingleChoice ? (
						<RadioGroup
							value={correctIndex >= 0 ? String(correctIndex) : ""}
							onValueChange={(value) => markSingleCorrect(Number(value))}
							className="flex flex-col gap-2"
						>
							{optionRows}
						</RadioGroup>
					) : (
						<div className="flex flex-col gap-2">{optionRows}</div>
					)}
					<Button
						type="button"
						size={"sm"}
						variant={"secondary"}
						className="w-fit"
						onClick={() => {
							appendOption({ option: "", is_correct: false });
							revalidate();
						}}
					>
						<Plus />
						{t("language_assessment.form.add_option")}
					</Button>
					<FieldError errors={[listError(questionErrors?.options)]} />
				</Field>
			)}
		</Card>
	);
}

interface LanguageAssessmentFormProps {
	vacancyId: string;
	/** Ausente no cadastro, presente na edição da prova já criada. */
	assessment?: LanguageAssessmentResource;
	onSaved: () => void;
	onCancel: () => void;
}

export default function LanguageAssessmentForm({
	vacancyId,
	assessment,
	onSaved,
	onCancel,
}: LanguageAssessmentFormProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const form = useForm<ILanguageAssessmentSchema>({
		resolver: zodResolver(LanguageAssessmentSchema),
		defaultValues: assessment
			? toFormValues(assessment)
			: {
					title: "",
					description: "",
					language: "",
					passing_score: "",
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

	// A nota de corte não pode passar da soma dos pesos, então ela fica à vista
	const questionValues = useWatch({ control: form.control, name: "questions" });

	const maxScore = sumWeights(questionValues ?? []);

	const { mutateAsync: createAssessment, isPending: isCreating } =
		useStoreLanguageAssessment();

	const { mutateAsync: updateAssessment, isPending: isUpdating } =
		useUpdateLanguageAssessment();

	const isPending = isCreating || isUpdating;

	const submit = async (data: ILanguageAssessmentSchema) => {
		// A ordem é a posição na lista, tanto das perguntas quanto das alternativas
		const questionsPayload = data.questions.map((question, index) => {
			const isText = question.type === LanguageAssessmentQuestionTypeEnum.text;

			return {
				id: question.id,
				question: question.question,
				type: question.type,
				weight: question.weight,
				order: index + 1,
				expected_answers: isText
					? question.expected_answers.map((expected) => expected.value)
					: undefined,
				options: isText
					? undefined
					: question.options.map((option, optionIndex) => ({
							id: option.id,
							option: option.option,
							is_correct: option.is_correct,
							order: optionIndex + 1,
						})),
			};
		});

		const payload = {
			title: data.title,
			description: data.description || null,
			language: data.language,
			// `null` explícito tira a nota de corte de uma prova que já tinha
			passing_score: toPassingScore(data.passing_score),
			due_date: data.due_date,
			questions: questionsPayload,
		};

		try {
			if (assessment) {
				await updateAssessment({ id: assessment.id, data: payload });

				CustomToaster.successToast(
					t("toast.success.language_assessment_updated"),
				);
			} else {
				await createAssessment({ jobVacancyId: vacancyId, data: payload });

				CustomToaster.successToast(
					t("toast.success.language_assessment_created"),
				);
			}

			// O cadastro tira a vaga de `awaiting_language_assessment` e envia a prova
			queryClient.invalidateQueries({
				queryKey: getShowLanguageAssessmentQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({
				queryKey: getShowJobVacancyQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({
				queryKey: getIndexStepAppliesQueryKey(vacancyId),
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
							<FieldLabel>{t("language_assessment.form.title")}</FieldLabel>
							<Input
								{...field}
								placeholder={t("language_assessment.form.title_placeholder")}
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
								{t("language_assessment.form.description")}
							</FieldLabel>
							<Textarea
								{...field}
								placeholder={t(
									"language_assessment.form.description_placeholder",
								)}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="language"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>{t("language_assessment.form.language")}</FieldLabel>
							<Input
								{...field}
								className="sm:w-72"
								placeholder={t("language_assessment.form.language_placeholder")}
								aria-invalid={fieldState.invalid}
							/>
							<p className="text-sm text-muted-foreground">
								{t("language_assessment.form.language_description")}
							</p>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="passing_score"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>
								{t("language_assessment.form.passing_score")}
							</FieldLabel>
							<div className="flex flex-row flex-wrap items-center gap-3">
								<Input
									{...field}
									type="number"
									min={1}
									max={maxScore || undefined}
									step={1}
									className="sm:w-72"
									placeholder={t(
										"language_assessment.form.passing_score_placeholder",
									)}
									aria-invalid={fieldState.invalid}
								/>
								<Badge className="bg-accent text-accent-foreground">
									{t("language_assessment.form.max_score", {
										count: maxScore,
									})}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{t("language_assessment.form.passing_score_description")}
							</p>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="due_date"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>{t("language_assessment.form.due_date")}</FieldLabel>
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
											t("language_assessment.form.due_date_placeholder")}
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
								{t("language_assessment.form.due_date_description")}
							</p>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex flex-row flex-wrap items-center justify-between gap-2">
					<h3 className="text-lg font-bold">
						{t("language_assessment.form.questions")}
					</h3>
					<Button
						type="button"
						variant={"secondary"}
						onClick={() => appendQuestion(emptyQuestion())}
					>
						<ListPlus />
						{t("language_assessment.form.add_question")}
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
				<FieldError errors={[listError(form.formState.errors.questions)]} />
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
