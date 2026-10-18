import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Languages, TriangleAlert, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	getShowDevLanguageAssessmentQueryKey,
	useAnswerDevLanguageAssessment,
	useShowDevLanguageAssessment,
} from "@/api/generated/language-assessment/language-assessment";
import { LanguageAssessmentQuestionTypeEnum } from "@/api/generated/models";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
	AnswerLanguageAssessmentSchema,
	buildAnswerDefaultValues,
	countBlankAnswers,
	type IAnswerLanguageAssessmentSchema,
	toAnswerPayload,
} from "@/schemas/language-assessment/AnswerLanguageAssessmentSchema";
import {
	getMaxScore,
	getOrderedOptions,
	getOrderedQuestions,
	getPassingScore,
	getQuestionType,
	getQuestionWeight,
} from "@/types/language-assessment";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

interface AnswerLanguageAssessmentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Id da prova do candidato (`language_assessment.id` da candidatura). */
	devAssessmentId: string;
}

/**
 * Prova respondida pelo desenvolvedor. Antes da entrega a API não manda o
 * gabarito, então nada aqui pode depender de `is_correct`/`expected_answers`.
 */
export default function AnswerLanguageAssessmentModal({
	open,
	onOpenChange,
	devAssessmentId,
}: AnswerLanguageAssessmentModalProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	/** Respostas aguardando a confirmação, já que a prova só pode ser entregue uma vez. */
	const [pendingAnswers, setPendingAnswers] =
		useState<IAnswerLanguageAssessmentSchema | null>(null);

	// As perguntas não vêm na listagem de candidaturas, então são buscadas aqui
	const { data: devAssessmentResponse, isLoading } =
		useShowDevLanguageAssessment(devAssessmentId, {
			query: { enabled: open },
		});

	const assessment = devAssessmentResponse?.data.assessment;

	const questions = getOrderedQuestions(assessment);

	const passingScore = getPassingScore(assessment);

	const hasMultipleChoice = questions.some(
		(question) =>
			getQuestionType(question) ===
			LanguageAssessmentQuestionTypeEnum.multiple_choice,
	);

	const form = useForm<IAnswerLanguageAssessmentSchema>({
		resolver: zodResolver(AnswerLanguageAssessmentSchema),
		defaultValues: { answers: [] },
	});

	const { reset } = form;

	// O formulário só existe depois que as perguntas chegam da API
	useEffect(() => {
		if (!open) return;

		reset(buildAnswerDefaultValues(assessment));
	}, [open, assessment, reset]);

	const { mutateAsync: answerAssessment, isPending } =
		useAnswerDevLanguageAssessment();

	const submit = async () => {
		if (!pendingAnswers) return;

		try {
			await answerAssessment({
				id: devAssessmentId,
				data: { answers: toAnswerPayload(pendingAnswers, questions) },
			});

			CustomToaster.successToast(
				t("toast.success.language_assessment_answered"),
			);

			queryClient.invalidateQueries({
				queryKey: getShowDevLanguageAssessmentQueryKey(devAssessmentId),
			});
			// A prova vem junto da candidatura, então a listagem é refeita — e agora
			// com a nota e o gabarito
			queryClient.invalidateQueries({ queryKey: ["/dev-vacancy/my-applies"] });

			setPendingAnswers(null);
			onOpenChange(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	const blankCount = pendingAnswers
		? countBlankAnswers(pendingAnswers, questions)
		: 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{assessment?.title || t("my_applies.language_assessment.answer")}
					</DialogTitle>
					<DialogDescription className="whitespace-pre-line">
						{assessment?.description ||
							t("my_applies.language_assessment.answer_description")}
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
						onSubmit={form.handleSubmit((data) => setPendingAnswers(data))}
					>
						{assessment && (
							<div className="flex flex-row flex-wrap gap-2">
								<Badge variant={"outline"}>
									<Languages />
									{t("my_applies.language_assessment.language")}:{" "}
									{assessment.language}
								</Badge>
								<Badge variant={"outline"}>
									<Trophy />
									{t("my_applies.language_assessment.max_score")}:{" "}
									{getMaxScore(assessment)}
								</Badge>
								{passingScore !== undefined && (
									<Badge className="bg-accent text-accent-foreground">
										{t("my_applies.language_assessment.passing_score")}:{" "}
										{passingScore}
									</Badge>
								)}
							</div>
						)}
						<Alert>
							<TriangleAlert />
							<AlertTitle>
								{t("my_applies.language_assessment.single_submit_warning")}
							</AlertTitle>
							{hasMultipleChoice && (
								<AlertDescription>
									{t("my_applies.language_assessment.all_or_nothing_warning")}
								</AlertDescription>
							)}
						</Alert>
						{questions.map((question, index) => {
							const type = getQuestionType(question);

							return (
								<div
									key={question.id}
									className="flex flex-col gap-3 rounded-md border p-4"
								>
									<div className="flex flex-row flex-wrap items-center gap-2">
										<Badge variant={"secondary"}>{index + 1}</Badge>
										<Badge variant={"outline"}>
											{t(`enum.language_assessment_question.type.${type}`)}
										</Badge>
										<Badge className="bg-accent text-accent-foreground">
											{t("language_assessment.points", {
												count: getQuestionWeight(question),
											})}
										</Badge>
									</div>
									<p className="font-medium whitespace-pre-line">
										{question.question}
									</p>
									{type === LanguageAssessmentQuestionTypeEnum.text ? (
										<Controller
											control={form.control}
											name={`answers.${index}.response`}
											render={({ field, fieldState }) => (
												<Field>
													<Input
														{...field}
														maxLength={1000}
														placeholder={t(
															"my_applies.language_assessment.response_placeholder",
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
													{type ===
													LanguageAssessmentQuestionTypeEnum.single_choice ? (
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
																		{option.option}
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
																		{option.option}
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
							);
						})}
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
								{t("my_applies.language_assessment.submit")}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
			<AlertDialog
				open={!!pendingAnswers}
				onOpenChange={(isOpen) => {
					if (!isOpen) setPendingAnswers(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("my_applies.language_assessment.confirm_title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("my_applies.language_assessment.confirm_description")}
							{blankCount > 0 &&
								` ${t("my_applies.language_assessment.blank_questions", {
									count: blankCount,
								})}`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setPendingAnswers(null)}>
							{t("general.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								// Evita que o dialog feche antes da resposta da API
								event.preventDefault();
								submit();
							}}
							disabled={isPending}
						>
							{isPending ? (
								<Spinner />
							) : (
								t("my_applies.language_assessment.submit")
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Dialog>
	);
}
