import { MessageSquareOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
	DevScreeningQuestionnaireResource,
	ScreeningQuestionResource,
} from "@/api/generated/models";
import { ScreeningQuestionTypeEnum } from "@/api/generated/models";
import { useShowDevScreeningQuestionnaire } from "@/api/generated/screening-questionnaire/screening-questionnaire";
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
import {
	findAnswer,
	getOptionText,
	getOrderedQuestions,
	getQuestionText,
} from "@/types/screening-questionnaire";
import { formatDateTime } from "@/utils/formatter";

interface QuestionnaireAnswersModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Preenchimento já carregado, usado no lado da empresa. */
	devQuestionnaire?: DevScreeningQuestionnaireResource;
	/**
	 * Id do preenchimento. Informado no lado do desenvolvedor, que busca as
	 * próprias respostas no endpoint de leitura em vez de recebê-las prontas.
	 */
	devQuestionnaireId?: string;
	/** Nome exibido no cabeçalho, o do candidato na visão da empresa. */
	candidateName?: string;
}

/** Respostas enviadas pelo desenvolvedor, somente leitura. */
export default function QuestionnaireAnswersModal({
	open,
	onOpenChange,
	devQuestionnaire,
	devQuestionnaireId,
	candidateName,
}: QuestionnaireAnswersModalProps) {
	const { t, i18n } = useTranslation();

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const { data: fetchedResponse, isLoading } = useShowDevScreeningQuestionnaire(
		devQuestionnaireId ?? "",
		{ query: { enabled: open && !!devQuestionnaireId } },
	);

	const filled = fetchedResponse?.data ?? devQuestionnaire;

	const answers = filled?.answers ?? [];

	// A empresa recebe o preenchimento sem o formulário completo, então as
	// perguntas vêm das próprias respostas quando o questionário não veio junto
	const questions: ScreeningQuestionResource[] = filled?.questionnaire
		? getOrderedQuestions(filled.questionnaire)
		: answers
				.map((answer) => answer.question)
				.filter((question): question is ScreeningQuestionResource => !!question)
				.sort(
					(question, nextQuestion) =>
						Number(question.order) - Number(nextQuestion.order),
				);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{t("screening_questionnaire.answers.title")}
					</DialogTitle>
					<DialogDescription>
						{candidateName
							? t("screening_questionnaire.answers.description_company", {
									name: candidateName,
								})
							: t("screening_questionnaire.answers.description_dev")}
					</DialogDescription>
				</DialogHeader>
				{filled?.submitted_at && (
					<p className="text-sm text-muted-foreground">
						{t("screening_questionnaire.answers.submitted_at")}:{" "}
						{formatDateTime(filled.submitted_at, {
							locale: dateLocale,
							fallback: "—",
						})}
					</p>
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
								{t("screening_questionnaire.answers.empty_title")}
							</EmptyTitle>
							<EmptyDescription>
								{t("screening_questionnaire.answers.empty_description")}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="flex flex-col gap-3">
						{questions.map((question, index) => {
							const answer = findAnswer(answers, question.id);

							const isEssay = question.type === ScreeningQuestionTypeEnum.essay;

							const selectedOptions = answer?.options ?? [];

							const wasAnswered = isEssay
								? !!answer?.response
								: selectedOptions.length > 0;

							return (
								<div
									key={question.id}
									className="flex flex-col gap-2 rounded-md border p-4"
								>
									<div className="flex flex-row flex-wrap items-center gap-2">
										<Badge variant={"secondary"}>{index + 1}</Badge>
										<Badge variant={"outline"}>
											{t(`enum.screening_question_type.${question.type}`)}
										</Badge>
									</div>
									<p className="font-medium whitespace-pre-line">
										{getQuestionText(question, i18n.language)}
									</p>
									{!wasAnswered ? (
										<p className="text-sm text-muted-foreground">
											{t("screening_questionnaire.answers.not_answered")}
										</p>
									) : isEssay ? (
										<p className="text-sm whitespace-pre-line">
											{answer?.response}
										</p>
									) : (
										<div className="flex flex-row flex-wrap gap-2">
											{selectedOptions.map((option) => (
												<Badge
													key={option.id}
													className="bg-accent text-accent-foreground"
												>
													{getOptionText(option, i18n.language)}
												</Badge>
											))}
										</div>
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
