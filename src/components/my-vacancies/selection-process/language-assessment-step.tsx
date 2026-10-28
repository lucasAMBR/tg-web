import { useNavigate } from "@tanstack/react-router";
import { Eye, FileQuestion, Languages } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import { useShowLanguageAssessment } from "@/api/generated/language-assessment/language-assessment";
import {
	type DevJobVacancyResource,
	SelectionProcessStageEnum,
} from "@/api/generated/models";
import AssessmentScore from "@/components/language-assessment/assessment-score";
import AssessmentStatusBadge from "@/components/language-assessment/assessment-status-badge";
import LanguageAssessmentResultModal from "@/components/language-assessment/language-assessment-result-modal";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
	assessmentWasAnswered,
	getLanguageAssessment,
} from "@/types/language-assessment";
import { apiDateOnly, formatIsoDateOnlyBr } from "@/utils/date-only";
import { formatDateTime } from "@/utils/formatter";
import StepAppliesList from "./step-applies-list";
import type { SelectionProcessStepProps } from "./step-props";
import StepResultsList from "./step-results-list";
import { getStepStatus } from "./step-status";

const STAGE = SelectionProcessStageEnum.language_assessment;

/** Resultado da prova do candidato, exibido dentro do card da candidatura. */
function ApplyLanguageAssessment({ apply }: { apply: DevJobVacancyResource }) {
	const { t, i18n } = useTranslation();

	const [resultModalIsOpen, setResultModalIsOpen] = useState(false);

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const devAssessment = getLanguageAssessment(apply);

	if (!devAssessment) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_vacancies.selection_process.language_assessment.not_sent")}
			</p>
		);
	}

	const wasAnswered = assessmentWasAnswered(devAssessment);

	// A correção pergunta a pergunta só existe quando a API manda as respostas junto
	const hasAnswers = (devAssessment.answers ?? []).length > 0;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: impede que os controles da prova naveguem para o perfil do candidato
		<div
			className="flex flex-col gap-2 border-t pt-3"
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
		>
			<div className="flex flex-row flex-wrap items-center gap-2">
				<AssessmentStatusBadge devAssessment={devAssessment} />
				<span className="text-sm text-muted-foreground">
					{wasAnswered
						? `${t("my_vacancies.selection_process.language_assessment.submitted_at")}: ${formatDateTime(
								devAssessment.submitted_at,
								{ locale: dateLocale, fallback: "—" },
							)}`
						: `${t("my_applies.language_assessment.due_date")}: ${
								formatIsoDateOnlyBr(apiDateOnly(devAssessment.due_date)) || "—"
							}`}
				</span>
			</div>
			{wasAnswered ? (
				<>
					<AssessmentScore devAssessment={devAssessment} />
					{hasAnswers && (
						<Button
							variant={"secondary"}
							className="w-fit"
							onClick={() => setResultModalIsOpen(true)}
						>
							<Eye />
							{t(
								"my_vacancies.selection_process.language_assessment.view_answers",
							)}
						</Button>
					)}
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					{t(
						"my_vacancies.selection_process.language_assessment.awaiting_answers",
					)}
				</p>
			)}
			{hasAnswers && (
				<LanguageAssessmentResultModal
					open={resultModalIsOpen}
					onOpenChange={setResultModalIsOpen}
					devAssessment={devAssessment}
					candidateName={apply.profile?.name}
				/>
			)}
		</div>
	);
}

export default function LanguageAssessmentStep({
	vacancyId,
}: SelectionProcessStepProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	// Vaga sem prova responde 404, que aqui significa "ainda não cadastrada"
	const { data: assessmentResponse, isLoading } = useShowLanguageAssessment(
		vacancyId,
		{ query: { retry: false } },
	);

	const assessment = assessmentResponse?.data;

	const status = getStepStatus(STAGE, vacancy?.data);

	const goToAssessment = () =>
		navigate({
			to: "/my-vacancies/$id/language-assessment",
			params: { id: vacancyId },
		});

	if (status === "done") {
		return <StepResultsList vacancyId={vacancyId} processStep={STAGE} />;
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	// A etapa fica travada até a empresa cadastrar a prova da vaga
	if (!assessment) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<FileQuestion />
					</EmptyMedia>
					<EmptyTitle>
						{t(
							"my_vacancies.selection_process.language_assessment.missing_title",
						)}
					</EmptyTitle>
					<EmptyDescription>
						{t(
							status === "awaiting"
								? "my_vacancies.selection_process.language_assessment.missing_blocking_description"
								: "my_vacancies.selection_process.language_assessment.missing_description",
						)}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={goToAssessment}>
						<Languages />
						{t(
							"my_vacancies.selection_process.language_assessment.create_assessment",
						)}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	if (status === "upcoming" || status === "awaiting") {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<Languages />
					</EmptyMedia>
					<EmptyTitle>
						{t("my_vacancies.selection_process.upcoming_title")}
					</EmptyTitle>
					<EmptyDescription>
						{t("my_vacancies.selection_process.upcoming_description")}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant={"secondary"} onClick={goToAssessment}>
						<Languages />
						{t(
							"my_vacancies.selection_process.language_assessment.manage_assessment",
						)}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-row flex-wrap justify-end">
				<Button variant={"secondary"} onClick={goToAssessment}>
					<Languages />
					{t(
						"my_vacancies.selection_process.language_assessment.manage_assessment",
					)}
				</Button>
			</div>
			<StepAppliesList
				vacancyId={vacancyId}
				processStep={STAGE}
				renderApplyExtra={(apply) => <ApplyLanguageAssessment apply={apply} />}
			/>
		</div>
	);
}
