import { useNavigate } from "@tanstack/react-router";
import { ClipboardList, Eye, FileQuestion } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import {
	type DevJobVacancyResource,
	SelectionProcessStageEnum,
} from "@/api/generated/models";
import { useShowScreeningQuestionnaire } from "@/api/generated/screening-questionnaire/screening-questionnaire";
import QuestionnaireAnswersModal from "@/components/screening-questionnaire/questionnaire-answers-modal";
import ScreeningStatusBadge from "@/components/screening-questionnaire/screening-status-badge";
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
	getScreeningQuestionnaire,
	screeningWasAnswered,
} from "@/types/screening-questionnaire";
import { formatDateTime } from "@/utils/formatter";
import StepAppliesList from "./step-applies-list";
import type { SelectionProcessStepProps } from "./step-props";
import StepResultsList from "./step-results-list";
import { getStepStatus } from "./step-status";

const STAGE = SelectionProcessStageEnum.screening_questions;

/** Preenchimento do candidato, exibido dentro do card da candidatura. */
function ApplyScreeningQuestionnaire({
	apply,
}: {
	apply: DevJobVacancyResource;
}) {
	const { t, i18n } = useTranslation();

	const [answersModalIsOpen, setAnswersModalIsOpen] = useState(false);

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const devQuestionnaire = getScreeningQuestionnaire(apply);

	if (!devQuestionnaire) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_vacancies.selection_process.screening_questions.not_sent")}
			</p>
		);
	}

	const wasAnswered = screeningWasAnswered(devQuestionnaire);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: impede que os controles do questionário naveguem para o perfil do candidato
		<div
			className="flex flex-col gap-2 border-t pt-3"
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
		>
			<div className="flex flex-row flex-wrap items-center gap-2">
				<ScreeningStatusBadge devQuestionnaire={devQuestionnaire} />
				<span className="text-sm text-muted-foreground">
					{wasAnswered
						? `${t("screening_questionnaire.answers.submitted_at")}: ${formatDateTime(
								devQuestionnaire.submitted_at,
								{ locale: dateLocale, fallback: "—" },
							)}`
						: `${t("my_applies.screening.due_date")}: ${formatDateTime(
								devQuestionnaire.due_date,
								{
									locale: dateLocale,
									pattern: "dd/MM/yyyy",
									fallback: "—",
								},
							)}`}
				</span>
			</div>
			{wasAnswered ? (
				<Button
					variant={"secondary"}
					className="w-fit"
					onClick={() => setAnswersModalIsOpen(true)}
				>
					<Eye />
					{t("my_vacancies.selection_process.screening_questions.view_answers")}
				</Button>
			) : (
				<p className="text-sm text-muted-foreground">
					{t(
						"my_vacancies.selection_process.screening_questions.awaiting_answers",
					)}
				</p>
			)}
			<QuestionnaireAnswersModal
				open={answersModalIsOpen}
				onOpenChange={setAnswersModalIsOpen}
				devQuestionnaire={devQuestionnaire}
				candidateName={apply.profile?.name}
			/>
		</div>
	);
}

export default function ScreeningQuestionsStep({
	vacancyId,
}: SelectionProcessStepProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	// Vaga sem questionário responde 404, que aqui significa "ainda não cadastrado"
	const { data: questionnaireResponse, isLoading } =
		useShowScreeningQuestionnaire(vacancyId, { query: { retry: false } });

	const questionnaire = questionnaireResponse?.data;

	const status = getStepStatus(STAGE, vacancy?.data);

	const goToQuestionnaire = () =>
		navigate({
			to: "/my-vacancies/$id/screening-questionnaire",
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

	// A etapa fica travada até a empresa cadastrar o formulário da vaga
	if (!questionnaire) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<FileQuestion />
					</EmptyMedia>
					<EmptyTitle>
						{t(
							"my_vacancies.selection_process.screening_questions.missing_title",
						)}
					</EmptyTitle>
					<EmptyDescription>
						{t(
							status === "awaiting"
								? "my_vacancies.selection_process.screening_questions.missing_blocking_description"
								: "my_vacancies.selection_process.screening_questions.missing_description",
						)}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={goToQuestionnaire}>
						<ClipboardList />
						{t(
							"my_vacancies.selection_process.screening_questions.create_questionnaire",
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
						<ClipboardList />
					</EmptyMedia>
					<EmptyTitle>
						{t("my_vacancies.selection_process.upcoming_title")}
					</EmptyTitle>
					<EmptyDescription>
						{t("my_vacancies.selection_process.upcoming_description")}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant={"secondary"} onClick={goToQuestionnaire}>
						<ClipboardList />
						{t(
							"my_vacancies.selection_process.screening_questions.manage_questionnaire",
						)}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-row flex-wrap justify-end">
				<Button variant={"secondary"} onClick={goToQuestionnaire}>
					<ClipboardList />
					{t(
						"my_vacancies.selection_process.screening_questions.manage_questionnaire",
					)}
				</Button>
			</div>
			<StepAppliesList
				vacancyId={vacancyId}
				processStep={STAGE}
				renderApplyExtra={(apply) => (
					<ApplyScreeningQuestionnaire apply={apply} />
				)}
			/>
		</div>
	);
}
