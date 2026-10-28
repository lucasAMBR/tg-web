import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScreeningQuestionTypeEnum } from "@/api/generated/models";
import {
	getShowDevScreeningQuestionnaireQueryKey,
	useAnswerDevScreeningQuestionnaire,
	useShowDevScreeningQuestionnaire,
} from "@/api/generated/screening-questionnaire/screening-questionnaire";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
	buildAnswerDefaultValues,
	buildAnswerScreeningQuestionnaireSchema,
	type IAnswerScreeningQuestionnaireSchema,
	toAnswerPayload,
} from "@/schemas/screening-questionnaire/AnswerScreeningQuestionnaireSchema";
import {
	getOptionText,
	getOrderedOptions,
	getOrderedQuestions,
	getQuestionnaireDescription,
	getQuestionText,
} from "@/types/screening-questionnaire";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

interface AnswerQuestionnaireModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Id do preenchimento (`screening_questionnaire.id` da candidatura). */
	devQuestionnaireId: string;
}

/** Formulário de resposta do desenvolvedor, com uma pergunta por bloco. */
export default function AnswerQuestionnaireModal({
	open,
	onOpenChange,
	devQuestionnaireId,
}: AnswerQuestionnaireModalProps) {
	const { t, i18n } = useTranslation();

	const queryClient = useQueryClient();

	// As perguntas não vêm na listagem de candidaturas, então são buscadas aqui
	const { data: devQuestionnaireResponse, isLoading } =
		useShowDevScreeningQuestionnaire(devQuestionnaireId, {
			query: { enabled: open },
		});

	const devQuestionnaire = devQuestionnaireResponse?.data;

	const questionnaire = devQuestionnaire?.questionnaire;

	const questions = getOrderedQuestions(questionnaire);

	const form = useForm<IAnswerScreeningQuestionnaireSchema>({
		resolver: zodResolver(buildAnswerScreeningQuestionnaireSchema(questions)),
		defaultValues: { answers: [] },
	});

	const { reset } = form;

	// O formulário só existe depois que as perguntas chegam da API
	useEffect(() => {
		if (!open) return;

		reset(buildAnswerDefaultValues(questionnaire));
	}, [open, questionnaire, reset]);

	const { mutateAsync: answerQuestionnaire, isPending } =
		useAnswerDevScreeningQuestionnaire();

	const submit = async (data: IAnswerScreeningQuestionnaireSchema) => {
		try {
			await answerQuestionnaire({
				id: devQuestionnaireId,
				data: { answers: toAnswerPayload(data, questions) },
			});

			CustomToaster.successToast(
				t("toast.success.screening_questionnaire_answered"),
			);

			queryClient.invalidateQueries({
				queryKey: getShowDevScreeningQuestionnaireQueryKey(devQuestionnaireId),
			});
			// O preenchimento vem junto da candidatura, então a listagem é refeita
			queryClient.invalidateQueries({ queryKey: ["/dev-vacancy/my-applies"] });

			onOpenChange(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	const description = questionnaire
		? getQuestionnaireDescription(questionnaire, i18n.language)
		: "";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("my_applies.screening.answer")}</DialogTitle>
					<DialogDescription>
						{description || t("my_applies.screening.answer_description")}
					</DialogDescription>
				</DialogHeader>
				{isLoading ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
					</div>
				) : (
					<form
						className="flex flex-col gap-4"
						onSubmit={form.handleSubmit(submit)}
					>
						{questions.map((question, index) => (
							<div
								key={question.id}
								className="flex flex-col gap-3 rounded-md border p-4"
							>
								<div className="flex flex-row flex-wrap items-center gap-2">
									<Badge variant={"secondary"}>{index + 1}</Badge>
									{question.is_required && (
										<Badge className="bg-accent text-accent-foreground">
											{t("screening_questionnaire.required")}
										</Badge>
									)}
								</div>
								<p className="font-medium whitespace-pre-line">
									{getQuestionText(question, i18n.language)}
								</p>
								{question.type === ScreeningQuestionTypeEnum.essay ? (
									<Controller
										control={form.control}
										name={`answers.${index}.response`}
										render={({ field, fieldState }) => (
											<Field>
												<Textarea
													{...field}
													placeholder={t(
														"my_applies.screening.response_placeholder",
													)}
													aria-invalid={fieldState.invalid}
												/>
												<FieldError errors={[fieldState.error]} />
											</Field>
										)}
									/>
								) : (
									<Controller
										control={form.control}
										name={`answers.${index}.option_ids`}
										render={({ field, fieldState }) => (
											<Field>
												{question.type ===
												ScreeningQuestionTypeEnum.single_choice ? (
													<RadioGroup
														value={field.value[0] ?? ""}
														onValueChange={(value) => field.onChange([value])}
														className="flex flex-col gap-2"
													>
														{getOrderedOptions(question).map((option) => (
															<div
																key={option.id}
																className="flex flex-row items-center gap-2"
															>
																<RadioGroupItem
																	id={`option-${option.id}`}
																	value={option.id}
																/>
																<Label htmlFor={`option-${option.id}`}>
																	{getOptionText(option, i18n.language)}
																</Label>
															</div>
														))}
													</RadioGroup>
												) : (
													<div className="flex flex-col gap-2">
														{getOrderedOptions(question).map((option) => (
															<div
																key={option.id}
																className="flex flex-row items-center gap-2"
															>
																<Checkbox
																	id={`option-${option.id}`}
																	checked={field.value.includes(option.id)}
																	onCheckedChange={(checked) =>
																		field.onChange(
																			checked === true
																				? [...field.value, option.id]
																				: field.value.filter(
																						(optionId) =>
																							optionId !== option.id,
																					),
																		)
																	}
																/>
																<Label htmlFor={`option-${option.id}`}>
																	{getOptionText(option, i18n.language)}
																</Label>
															</div>
														))}
													</div>
												)}
												<FieldError errors={[fieldState.error]} />
											</Field>
										)}
									/>
								)}
							</div>
						))}
						<DialogFooter>
							<Button
								type="button"
								variant={"secondary"}
								onClick={() => onOpenChange(false)}
							>
								{t("general.cancel")}
							</Button>
							<Button
								type="submit"
								disabled={isPending || questions.length === 0}
							>
								{isPending ? <Spinner /> : t("my_applies.screening.submit")}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
