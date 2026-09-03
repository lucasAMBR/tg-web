import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getIndexStepAppliesQueryKey } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import {
	type DevJobVacancyResource,
	SelectionProcessStageEnum,
} from "@/api/generated/models";
import InterviewNegotiation from "@/components/interview/interview-negotiation";
import { getInterview } from "@/types/dev-job-vacancy-interview";
import StepAppliesList from "./step-applies-list";
import type { SelectionProcessStepProps } from "./step-props";
import StepResultsList from "./step-results-list";
import { getStepStatus } from "./step-status";
import StepUpcomingEmpty from "./step-upcoming-empty";

const STAGE = SelectionProcessStageEnum.interview;

function ApplyInterview({
	apply,
	onUpdated,
}: {
	apply: DevJobVacancyResource;
	onUpdated: () => void;
}) {
	const { t } = useTranslation();

	const interview = getInterview(apply);

	if (!interview) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("interview.not_created")}
			</p>
		);
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: impede que os controles da entrevista naveguem para o perfil do candidato
		<div
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
		>
			<InterviewNegotiation
				interview={interview}
				party="company"
				counterpartName={apply.profile?.name}
				onUpdated={onUpdated}
			/>
		</div>
	);
}

export default function InterviewStep({
	vacancyId,
}: SelectionProcessStepProps) {
	const queryClient = useQueryClient();

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	const status = getStepStatus(STAGE, vacancy?.data);

	// A entrevista vem junto da candidatura, então a listagem inteira é refeita
	const refreshApplies = () =>
		queryClient.invalidateQueries({
			queryKey: getIndexStepAppliesQueryKey(vacancyId),
		});

	if (status === "upcoming") {
		return <StepUpcomingEmpty />;
	}

	if (status === "done") {
		return <StepResultsList vacancyId={vacancyId} processStep={STAGE} />;
	}

	return (
		<StepAppliesList
			vacancyId={vacancyId}
			processStep={STAGE}
			renderApplyExtra={(apply) => (
				<ApplyInterview apply={apply} onUpdated={refreshApplies} />
			)}
		/>
	);
}
