import {
	Circle,
	CircleCheck,
	CircleDot,
	CircleX,
	MessageSquareOff,
	Square,
	SquareCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShowDevLanguageAssessment } from "@/api/generated/language-assessment/language-assessment";
import type {
	DevLanguageAssessmentResource,
	LanguageAssessmentQuestionResource,
} from "@/api/generated/models";
import { LanguageAssessmentQuestionTypeEnum } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
	answerIsCorrect,
	findAnswer,
	getEarnedScore,
	getExpectedAnswers,
	getOrderedOptions,
	getOrderedQuestions,
	getQuestionType,
	getQuestionWeight,
	optionIsCorrect,
	sortByOrder,
} from "@/types/language-assessment";
import { formatDateTime } from "@/utils/formatter";
import AssessmentScore from "./assessment-score";

interface LanguageAssessmentResultModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Prova já carregada com as respostas, usada no lado da empresa. */
	devAssessment?: DevLanguageAssessmentResource;
	/**
	 * Id da prova. Informado no lado do desenvolvedor, que busca a própria correção
	 * no endpoint de leitura — depois da entrega ele já vem com o gabarito.
	 */
	devAssessmentId?: string;
	/** Nome exibido no cabeçalho, o do candidato na visão da empresa. */
	candidateName?: string;
}

/** Respostas entregues, corrigidas pergunta a pergunta, somente leitura. */
export default function LanguageAssessmentResultModal({
	open,
	onOpenChange,
	devAssessment,
	devAssessmentId,
	candidateName,
}: LanguageAssessmentResultModalProps) {
	const { t, i18n } = useTranslation();

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const { data: fetchedResponse, isLoading } = useShowDevLanguageAssessment(
		devAssessmentId ?? "",
		{ query: { enabled: open && !!devAssessmentId } },
	);

	const graded = fetchedResponse?.data ?? devAssessment;

	const answers = graded?.answers ?? [];

	// Sem a prova completa, as perguntas vêm das próprias respostas
	const questions: LanguageAssessmentQuestionResource[] = graded?.assessment
		? getOrderedQuestions(graded.assessment)
		: sortByOrder(
				answers
					.map((answer) => answer.question)
					.filter(
						(question): question is LanguageAssessmentQuestionResource =>
							!!question,
					),
			);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("language_assessment.answers.title")}</DialogTitle>
					<DialogDescription>
						{candidateName
							? t("language_assessment.answers.description_company", {
									name: candidateName,
								})
							: t("language_assessment.answers.description_dev")}
					</DialogDescription>
				</DialogHeader>
				{graded && (
					<div className="flex flex-col gap-1">
						<AssessmentScore devAssessment={graded} />
						{graded.submitted_at && (
							<p className="text-sm text-muted-foreground">
								{t("language_assessment.answers.submitted_at")}:{" "}
								{formatDateTime(graded.submitted_at, {
									locale: dateLocale,
									fallback: "—",
								})}
							</p>
						)}
					</div>
				)}
				{isLoading ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
					</div>
				) : questions.length === 0 ? (
					<Empty className="border">
						<EmptyHeader>
							<EmptyMedia variant={"icon"}>
								<MessageSquareOff />
							</EmptyMedia>
							<EmptyTitle>
								{t("language_assessment.answers.empty_title")}
							</EmptyTitle>
							<EmptyDescription>
								{t("language_assessment.answers.empty_description")}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="flex flex-col gap-3">
						{questions.map((question, index) => {
							const answer = findAnswer(answers, question.id);

							const type = getQuestionType(question);

							const isText = type === LanguageAssessmentQuestionTypeEnum.text;
							const isMultipleChoice =
								type === LanguageAssessmentQuestionTypeEnum.multiple_choice;

							const isCorrect = answerIsCorrect(answer);

							const selectedIds = new Set(
								(answer?.options ?? []).map((option) => option.id),
							);

							// Sem a prova completa a pergunta chega sem as alternativas, então
							// sobram as que o candidato marcou
							const questionOptions = getOrderedOptions(question);
							const options =
								questionOptions.length > 0
									? questionOptions
									: (answer?.options ?? []);

							const wasAnswered = isText
								? !!answer?.response
								: selectedIds.size > 0;

							return (
								<div
									key={question.id}
									className={cn(
										"flex flex-col gap-2 rounded-md border p-4",
										isCorrect
											? "border-emerald-500/50"
											: "border-destructive/40",
									)}
								>
									<div className="flex flex-row flex-wrap items-center gap-2">
										<Badge variant={"secondary"}>{index + 1}</Badge>
										<Badge variant={"outline"}>
											{t(`enum.language_assessment_question.type.${type}`)}
										</Badge>
										{isCorrect ? (
											<Badge className="bg-emerald-500 text-white">
												<CircleCheck />
												{t("language_assessment.answers.correct")}
											</Badge>
										) : (
											<Badge variant={"destructive"}>
												<CircleX />
												{t("language_assessment.answers.wrong")}
											</Badge>
										)}
										<span className="text-sm text-muted-foreground">
											{t("language_assessment.answers.earned", {
												earned: getEarnedScore(answer),
												weight: getQuestionWeight(question),
											})}
										</span>
									</div>
									<p className="font-medium whitespace-pre-line">
										{question.question}
									</p>
									{!wasAnswered && (
										<p className="text-sm text-muted-foreground">
											{t("language_assessment.answers.not_answered")}
										</p>
									)}
									{isText ? (
										<>
											{wasAnswered && (
												<p
													className={cn(
														"text-sm whitespace-pre-line",
														isCorrect
															? "text-emerald-600 dark:text-emerald-400"
															: "text-destructive",
													)}
												>
													{answer?.response}
												</p>
											)}
											<div className="flex flex-col gap-1">
												<p className="text-sm text-muted-foreground">
													{t("language_assessment.expected_answers")}
												</p>
												<div className="flex flex-row flex-wrap gap-2">
													{getExpectedAnswers(question).map((expected) => (
														<Badge
															key={expected}
															className="bg-emerald-500 text-white"
														>
															{expected}
														</Badge>
													))}
												</div>
											</div>
										</>
									) : (
										<ul className="flex flex-col gap-1">
											{options.map((option) => {
												const isSelected = selectedIds.has(option.id);
												const isRight = optionIsCorrect(option);

												const Marker = isMultipleChoice
													? isSelected
														? SquareCheck
														: Square
													: isSelected
														? CircleDot
														: Circle;

												return (
													<li
														key={option.id}
														className={cn(
															"flex flex-row flex-wrap items-center gap-2 text-sm",
															isRight
																? "font-medium text-emerald-600 dark:text-emerald-400"
																: isSelected
																	? "text-destructive"
																	: "text-muted-foreground",
														)}
													>
														<Marker className="size-4 shrink-0" />
														{option.option}
														{isRight && (
															<Badge variant={"outline"}>
																{t("language_assessment.answers.answer_key")}
															</Badge>
														)}
													</li>
												);
											})}
										</ul>
									)}
								</div>
							);
						})}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
