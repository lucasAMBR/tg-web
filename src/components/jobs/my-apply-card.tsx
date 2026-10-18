import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Briefcase, ExternalLink, Eye, PencilLine, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DevJobVacancyResource } from "@/api/generated/models";
import { useShowDevTechnicalChallenge } from "@/api/generated/technical-challenge/technical-challenge";
import AnswerLanguageAssessmentModal from "@/components/language-assessment/answer-language-assessment-modal";
import AssessmentScore from "@/components/language-assessment/assessment-score";
import AssessmentStatusBadge from "@/components/language-assessment/assessment-status-badge";
import LanguageAssessmentResultModal from "@/components/language-assessment/language-assessment-result-modal";
import LiveCodingExercise from "@/components/live-coding/live-coding-exercise";
import {
	INTERVIEW_CALL,
	LIVE_CODING_CALL,
} from "@/components/scheduled-call/call-kinds";
import CallNegotiation from "@/components/scheduled-call/call-negotiation";
import AnswerQuestionnaireModal from "@/components/screening-questionnaire/answer-questionnaire-modal";
import QuestionnaireAnswersModal from "@/components/screening-questionnaire/questionnaire-answers-modal";
import ScreeningStatusBadge from "@/components/screening-questionnaire/screening-status-badge";
import ChallengeFileLink from "@/components/technical-challenge/challenge-file-link";
import ChallengeStatusBadge from "@/components/technical-challenge/challenge-status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getInterview } from "@/types/dev-job-vacancy-interview";
import {
	getLiveCoding,
	liveCodingHasExercise,
} from "@/types/dev-job-vacancy-live-coding";
import {
	assessmentWasAnswered,
	getLanguageAssessment,
} from "@/types/language-assessment";
import {
	getPortfolioSolicitation,
	portfolioWasSent,
} from "@/types/portfolio-solicitation";
import {
	getScreeningQuestionnaire,
	screeningWasAnswered,
} from "@/types/screening-questionnaire";
import {
	acceptsZipSubmission,
	challengeWasDelivered,
	getChallengeDescription,
	getChallengeRules,
	getChallengeTitle,
	getDevTechnicalChallenge,
	getGuideDocument,
	getSubmissionFile,
} from "@/types/technical-challenge";
import { apiDateOnly, formatIsoDateOnlyBr } from "@/utils/date-only";
import { formatDateTime } from "@/utils/formatter";
import SubmitTechnicalChallengeModal from "./submit-technical-challenge-modal";

interface MyApplyCardProps {
	apply: DevJobVacancyResource;
}

/** Os dados de cada etapa vêm junto da candidatura, então a listagem é refeita. */
const MY_APPLIES_QUERY_KEY = ["/dev-vacancy/my-applies"];

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
		<CallNegotiation
			call={interview}
			kind={INTERVIEW_CALL}
			party="dev"
			counterpartName={apply.vacancy?.profile?.name}
			onUpdated={() =>
				queryClient.invalidateQueries({ queryKey: MY_APPLIES_QUERY_KEY })
			}
		/>
	);
}

/** Desafio técnico enviado pela empresa, na etapa correspondente. */
function TechnicalChallengeBlock({ apply }: MyApplyCardProps) {
	const { t, i18n } = useTranslation();

	const [submitModalIsOpen, setSubmitModalIsOpen] = useState(false);

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const devChallenge = getDevTechnicalChallenge(apply);

	// A candidatura traz só a entrega: o enunciado, as regras e o guia vêm do
	// endpoint de leitura do dev
	const { data: devChallengeResponse } = useShowDevTechnicalChallenge(
		devChallenge?.id ?? "",
		{ query: { enabled: !!devChallenge } },
	);

	if (!devChallenge) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_applies.technical_challenge.not_received")}
			</p>
		);
	}

	const challenge =
		devChallengeResponse?.data.challenge ?? devChallenge.challenge;

	const wasDelivered = challengeWasDelivered(devChallenge);

	const guideDocument = getGuideDocument(challenge);

	const submissionFile = getSubmissionFile(devChallenge);

	const rules = challenge ? getChallengeRules(challenge, i18n.language) : "";

	return (
		<div className="flex flex-col gap-3 border-t pt-3">
			<div className="flex flex-row flex-wrap items-center gap-2">
				<ChallengeStatusBadge devChallenge={devChallenge} />
				<span className="text-sm text-muted-foreground">
					{wasDelivered
						? `${t("my_applies.technical_challenge.submitted_at")}: ${formatDateTime(
								devChallenge.submitted_at,
								{ locale: dateLocale, fallback: "—" },
							)}`
						: `${t("my_applies.technical_challenge.due_date")}: ${formatDateTime(
								devChallenge.due_date,
								{ locale: dateLocale, pattern: "dd/MM/yyyy", fallback: "—" },
							)}`}
				</span>
			</div>
			{challenge && (
				<div className="flex flex-col gap-2">
					<p className="font-medium">
						{getChallengeTitle(challenge, i18n.language)}
					</p>
					<p className="text-sm text-muted-foreground whitespace-pre-line">
						{getChallengeDescription(challenge, i18n.language)}
					</p>
					{rules && (
						<div className="flex flex-col gap-1">
							<p className="text-sm font-medium">
								{t("technical_challenge.form.rules")}
							</p>
							<p className="text-sm text-muted-foreground whitespace-pre-line">
								{rules}
							</p>
						</div>
					)}
					{guideDocument && (
						<ChallengeFileLink
							file={guideDocument}
							label={t("my_applies.technical_challenge.download_guide")}
						/>
					)}
				</div>
			)}
			{wasDelivered ? (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-muted-foreground">
						{t("my_applies.technical_challenge.delivered_description")}
					</p>
					{devChallenge.repository_url && (
						<a
							href={devChallenge.repository_url}
							target="_blank"
							rel="noreferrer"
							className="flex w-fit items-center gap-1 text-sm text-primary break-all"
						>
							<ExternalLink className="size-3.5 shrink-0" />
							{devChallenge.repository_url}
						</a>
					)}
					{submissionFile && (
						<ChallengeFileLink
							file={submissionFile}
							label={t("my_applies.technical_challenge.view_submission")}
						/>
					)}
				</div>
			) : (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-muted-foreground">
						{t("my_applies.technical_challenge.pending_description")}
					</p>
					<Button
						variant={"accent"}
						className="w-fit"
						onClick={() => setSubmitModalIsOpen(true)}
					>
						<Upload />
						{t("my_applies.technical_challenge.submit")}
					</Button>
				</div>
			)}
			<SubmitTechnicalChallengeModal
				open={submitModalIsOpen}
				onOpenChange={setSubmitModalIsOpen}
				devChallengeId={devChallenge.id}
				acceptsZip={acceptsZipSubmission(challenge)}
			/>
		</div>
	);
}

/** Exercício, negociação de horário e call do live coding, na etapa correspondente. */
function LiveCodingBlock({ apply }: MyApplyCardProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const liveCoding = getLiveCoding(apply);

	// Na espera o registro existe, mas não há nada que o dev possa fazer ainda
	if (
		apply.process_step === "awaiting_live_coding" ||
		(liveCoding && !liveCodingHasExercise(liveCoding))
	) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_applies.live_coding.awaiting_exercise")}
			</p>
		);
	}

	if (!liveCoding) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_applies.live_coding.not_received")}
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<LiveCodingExercise liveCoding={liveCoding} party="dev" />
			<CallNegotiation
				call={liveCoding}
				kind={LIVE_CODING_CALL}
				party="dev"
				counterpartName={apply.vacancy?.profile?.name}
				onUpdated={() =>
					queryClient.invalidateQueries({ queryKey: MY_APPLIES_QUERY_KEY })
				}
			/>
		</div>
	);
}

/** Prova de idioma enviada pela empresa, na etapa correspondente. */
function LanguageAssessmentBlock({ apply }: MyApplyCardProps) {
	const { t, i18n } = useTranslation();

	const [answerModalIsOpen, setAnswerModalIsOpen] = useState(false);
	const [resultModalIsOpen, setResultModalIsOpen] = useState(false);

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const devAssessment = getLanguageAssessment(apply);

	// `awaiting_language_assessment` ainda não gera prova: a empresa não a cadastrou
	if (!devAssessment) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t(
					apply.process_step === "awaiting_language_assessment"
						? "my_applies.language_assessment.awaiting_assessment"
						: "my_applies.language_assessment.not_received",
				)}
			</p>
		);
	}

	const wasAnswered = assessmentWasAnswered(devAssessment);

	return (
		<div className="flex flex-col gap-2 border-t pt-3">
			<div className="flex flex-row flex-wrap items-center gap-2">
				<AssessmentStatusBadge devAssessment={devAssessment} />
				<span className="text-sm text-muted-foreground">
					{wasAnswered
						? `${t("my_applies.language_assessment.submitted_at")}: ${formatDateTime(
								devAssessment.submitted_at,
								{ locale: dateLocale, fallback: "—" },
							)}`
						: `${t("my_applies.language_assessment.due_date")}: ${
								formatIsoDateOnlyBr(apiDateOnly(devAssessment.due_date)) || "—"
							}`}
				</span>
			</div>
			<p className="text-sm text-muted-foreground">
				{t(
					wasAnswered
						? "my_applies.language_assessment.answered_description"
						: "my_applies.language_assessment.pending_description",
				)}
			</p>
			{wasAnswered ? (
				<>
					<AssessmentScore devAssessment={devAssessment} />
					<Button
						variant={"secondary"}
						className="w-fit"
						onClick={() => setResultModalIsOpen(true)}
					>
						<Eye />
						{t("my_applies.language_assessment.view_answers")}
					</Button>
				</>
			) : (
				<Button
					variant={"accent"}
					className="w-fit"
					onClick={() => setAnswerModalIsOpen(true)}
				>
					<PencilLine />
					{t("my_applies.language_assessment.answer")}
				</Button>
			)}
			<AnswerLanguageAssessmentModal
				open={answerModalIsOpen}
				onOpenChange={setAnswerModalIsOpen}
				devAssessmentId={devAssessment.id}
			/>
			<LanguageAssessmentResultModal
				open={resultModalIsOpen}
				onOpenChange={setResultModalIsOpen}
				devAssessmentId={devAssessment.id}
			/>
		</div>
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

	// `awaiting_technical_challenge` ainda não gera entrega: o bloco só avisa disso
	const showTechnicalChallenge =
		isInProgress &&
		(apply.process_step === "technical_challenge" ||
			apply.process_step === "awaiting_technical_challenge");

	// Na espera o bloco só avisa que a empresa ainda prepara o exercício
	const showLiveCoding =
		isInProgress &&
		(apply.process_step === "live_coding" ||
			apply.process_step === "awaiting_live_coding");

	const showLanguageAssessment =
		isInProgress &&
		(apply.process_step === "language_assessment" ||
			apply.process_step === "awaiting_language_assessment");

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
			{showTechnicalChallenge && <TechnicalChallengeBlock apply={apply} />}
			{showLiveCoding && <LiveCodingBlock apply={apply} />}
			{showLanguageAssessment && <LanguageAssessmentBlock apply={apply} />}
		</Card>
	);
}
