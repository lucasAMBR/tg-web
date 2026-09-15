import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Briefcase, ExternalLink, Eye, PencilLine, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DevJobVacancyResource } from "@/api/generated/models";
import InterviewNegotiation from "@/components/interview/interview-negotiation";
import AnswerQuestionnaireModal from "@/components/screening-questionnaire/answer-questionnaire-modal";
import QuestionnaireAnswersModal from "@/components/screening-questionnaire/questionnaire-answers-modal";
import ScreeningStatusBadge from "@/components/screening-questionnaire/screening-status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getInterview } from "@/types/dev-job-vacancy-interview";
import {
	getPortfolioSolicitation,
	portfolioWasSent,
} from "@/types/portfolio-solicitation";
import {
	getScreeningQuestionnaire,
	screeningWasAnswered,
} from "@/types/screening-questionnaire";
import { formatDateTime } from "@/utils/formatter";

interface MyApplyCardProps {
	apply: DevJobVacancyResource;
}

/** Solicitação de portfólio, exibida enquanto a candidatura está nessa etapa. */
function PortfolioSolicitationBlock({ apply }: MyApplyCardProps) {
	const { t, i18n } = useTranslation();

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const solicitation = getPortfolioSolicitation(apply);

	if (!solicitation) return null;

	const wasSent = portfolioWasSent(solicitation);

	return (
		<div className="flex flex-col gap-2 border-t pt-3">
			<div className="flex flex-row flex-wrap items-center gap-2">
				<Badge
					variant={wasSent ? "default" : "secondary"}
					className={wasSent ? "bg-emerald-500 text-white" : undefined}
				>
					{t(
						`enum.portfolio_solicitation.status.${solicitation.status ?? "pending"}`,
					)}
				</Badge>
				{solicitation.type && (
					<Badge variant={"outline"}>
						{t(`enum.portfolio_solicitation.type.${solicitation.type}`)}
					</Badge>
				)}
				{solicitation.due_date && !wasSent && (
					<span className="text-sm text-muted-foreground">
						{t("my_applies.portfolio.due_date")}:{" "}
						{formatDateTime(solicitation.due_date, {
							locale: dateLocale,
							pattern: "dd/MM/yyyy",
							fallback: "—",
						})}
					</span>
				)}
			</div>
			{wasSent ? (
				<a
					href={solicitation.portfolio_url ?? undefined}
					target="_blank"
					rel="noreferrer"
					className="flex w-fit items-center gap-1 text-sm text-primary break-all"
				>
					<ExternalLink className="size-3.5 shrink-0" />
					{solicitation.portfolio_url}
				</a>
			) : (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-muted-foreground">
						{t("my_applies.portfolio.send_description")}
					</p>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Input
							type="url"
							placeholder={t("my_applies.portfolio.url_placeholder")}
							className="sm:flex-1"
						/>
						<Button variant={"accent"} className="w-fit">
							<Upload />
							{t("my_applies.portfolio.send")}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

/** Questionário de triagem enviado pela empresa, na etapa correspondente. */
function ScreeningQuestionnaireBlock({ apply }: MyApplyCardProps) {
	const { t, i18n } = useTranslation();

	const [answerModalIsOpen, setAnswerModalIsOpen] = useState(false);
	const [answersModalIsOpen, setAnswersModalIsOpen] = useState(false);

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const devQuestionnaire = getScreeningQuestionnaire(apply);

	if (!devQuestionnaire) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_applies.screening.not_received")}
			</p>
		);
	}

	const wasAnswered = screeningWasAnswered(devQuestionnaire);

	return (
		<div className="flex flex-col gap-2 border-t pt-3">
			<div className="flex flex-row flex-wrap items-center gap-2">
				<ScreeningStatusBadge devQuestionnaire={devQuestionnaire} />
				{!wasAnswered && devQuestionnaire.due_date && (
					<span className="text-sm text-muted-foreground">
						{t("my_applies.screening.due_date")}:{" "}
						{formatDateTime(devQuestionnaire.due_date, {
							locale: dateLocale,
							pattern: "dd/MM/yyyy",
							fallback: "—",
						})}
					</span>
				)}
			</div>
			<p className="text-sm text-muted-foreground">
				{t(
					wasAnswered
						? "my_applies.screening.answered_description"
						: "my_applies.screening.pending_description",
				)}
			</p>
			{wasAnswered ? (
				<Button
					variant={"secondary"}
					className="w-fit"
					onClick={() => setAnswersModalIsOpen(true)}
				>
					<Eye />
					{t("my_applies.screening.view_answers")}
				</Button>
			) : (
				<Button
					variant={"accent"}
					className="w-fit"
					onClick={() => setAnswerModalIsOpen(true)}
				>
					<PencilLine />
					{t("my_applies.screening.answer")}
				</Button>
			)}
			<AnswerQuestionnaireModal
				open={answerModalIsOpen}
				onOpenChange={setAnswerModalIsOpen}
				devQuestionnaireId={devQuestionnaire.id}
			/>
			<QuestionnaireAnswersModal
				open={answersModalIsOpen}
				onOpenChange={setAnswersModalIsOpen}
				devQuestionnaireId={devQuestionnaire.id}
			/>
		</div>
	);
}

/** Negociação de horário e call da entrevista, na etapa correspondente. */
function InterviewBlock({ apply }: MyApplyCardProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const interview = getInterview(apply);

	if (!interview) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("interview.not_created")}
			</p>
		);
	}

	return (
		<InterviewNegotiation
			interview={interview}
			party="dev"
			counterpartName={apply.vacancy?.profile?.name}
			// A entrevista vem junto da candidatura, então a listagem inteira é refeita
			onUpdated={() =>
				queryClient.invalidateQueries({ queryKey: ["/dev-vacancy/my-applies"] })
			}
		/>
	);
}

export default function MyApplyCard({ apply }: MyApplyCardProps) {
	const { t, i18n } = useTranslation();

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const vacancy = apply.vacancy;
	const company = vacancy?.profile;

	const isInProgress = apply.status === "in_progress";

	// A etapa só é relevante enquanto a candidatura continua no processo
	const showPortfolioSolicitation =
		isInProgress && apply.process_step === "portfolio_review";

	const showScreeningQuestionnaire =
		isInProgress && apply.process_step === "screening_questions";

	const showInterview = isInProgress && apply.process_step === "interview";

	const statusVariant =
		apply.status === "approved"
			? "default"
			: apply.status === "rejected"
				? "destructive"
				: "secondary";

	return (
		<Card className="w-full flex flex-col gap-4 p-4">
			<div className="flex flex-row items-center gap-4">
				<Avatar className="size-14">
					{company?.profile_pic && (
						<AvatarImage
							src={company.profile_pic}
							alt={company.name}
							className="object-cover"
						/>
					)}
					<AvatarFallback className="bg-primary text-primary-foreground">
						<Briefcase className="size-7" />
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex flex-1 flex-col gap-1">
					{vacancy ? (
						<Link
							to="/vacancies/$id"
							params={{ id: vacancy.id }}
							className="font-medium hover:text-primary"
						>
							{vacancy.title}
						</Link>
					) : (
						<p className="font-medium">—</p>
					)}
					{company?.name && (
						<p className="text-sm text-muted-foreground">{company.name}</p>
					)}
					<div className="flex flex-row flex-wrap gap-2">
						<Badge
							variant={statusVariant}
							className={
								apply.status === "approved"
									? "bg-emerald-500 text-white"
									: undefined
							}
						>
							{t(`enum.dev_job_vacancy_status.${apply.status}`)}
						</Badge>
						<Badge variant={"outline"}>
							{t("my_vacancies.current_step")}:{" "}
							{t(`enum.selection_process_stage.${apply.process_step}`)}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						{t("my_vacancies.applies.table.applied_at")}:{" "}
						{formatDateTime(apply.applied_at, {
							locale: dateLocale,
							fallback: "—",
						})}
					</p>
				</div>
			</div>
			{apply.feedback && (
				<div className="flex flex-col gap-1 border-t pt-3">
					<p className="text-sm font-medium">{t("my_applies.feedback")}</p>
					<p className="text-sm text-muted-foreground whitespace-pre-line">
						{apply.feedback}
					</p>
				</div>
			)}
			{showPortfolioSolicitation && (
				<PortfolioSolicitationBlock apply={apply} />
			)}
			{showScreeningQuestionnaire && (
				<ScreeningQuestionnaireBlock apply={apply} />
			)}
			{showInterview && <InterviewBlock apply={apply} />}
		</Card>
	);
}
