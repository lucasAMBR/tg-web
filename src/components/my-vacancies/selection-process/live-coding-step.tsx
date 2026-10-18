import { useQueryClient } from "@tanstack/react-query";
import { Hourglass, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	getIndexStepAppliesQueryKey,
	useIndexStepApplies,
} from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import {
	type DevJobVacancyResource,
	SelectionProcessStageEnum,
} from "@/api/generated/models";
import LiveCodingExercise from "@/components/live-coding/live-coding-exercise";
import { LIVE_CODING_CALL } from "@/components/scheduled-call/call-kinds";
import CallNegotiation from "@/components/scheduled-call/call-negotiation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
	countMissingExercises,
	getLiveCoding,
} from "@/types/dev-job-vacancy-live-coding";
import StepAppliesList from "./step-applies-list";
import StepApplyCard from "./step-apply-card";
import type { SelectionProcessStepProps } from "./step-props";
import StepResultsList from "./step-results-list";
import { getStepStatus } from "./step-status";
import StepUpcomingEmpty from "./step-upcoming-empty";

const STAGE = SelectionProcessStageEnum.live_coding;

interface ApplyLiveCodingProps {
	apply: DevJobVacancyResource;
	/** Na espera só o exercício importa: a negociação fica para quando a etapa começar. */
	showNegotiation: boolean;
	onUpdated: () => void;
}

/** Exercício e negociação do live coding, exibidos dentro do card da candidatura. */
function ApplyLiveCoding({
	apply,
	showNegotiation,
	onUpdated,
}: ApplyLiveCodingProps) {
	const { t } = useTranslation();

	const liveCoding = getLiveCoding(apply);

	if (!liveCoding) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_vacancies.selection_process.live_coding.not_created")}
			</p>
		);
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: impede que os controles do live coding naveguem para o perfil do candidato
		<div
			className="flex flex-col gap-3"
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
		>
			<LiveCodingExercise liveCoding={liveCoding} party="company" />
			{showNegotiation && (
				<CallNegotiation
					call={liveCoding}
					kind={LIVE_CODING_CALL}
					party="company"
					counterpartName={apply.profile?.name}
					onUpdated={onUpdated}
				/>
			)}
		</div>
	);
}

/**
 * Espera pelos exercícios. Os registros de live coding já existem, mas a etapa
 * só começa quando todos tiverem o enunciado publicado — e enquanto isso a API
 * não deixa avançar ninguém, então não há seleção de candidatos aqui.
 */
function AwaitingExercisesList({
	vacancyId,
	onUpdated,
}: {
	vacancyId: string;
	onUpdated: () => void;
}) {
	const { t } = useTranslation();

	const { data: applies, isLoading } = useIndexStepApplies(vacancyId, {
		process_step: SelectionProcessStageEnum.awaiting_live_coding,
	});

	const applyList = applies?.data ?? [];

	const missingCount = countMissingExercises(applyList);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	if (applyList.length === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<Users />
					</EmptyMedia>
					<EmptyTitle>
						{t("my_vacancies.selection_process.empty_applies_title")}
					</EmptyTitle>
					<EmptyDescription>
						{t("my_vacancies.selection_process.empty_applies_description")}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<Alert>
				<Hourglass />
				<AlertTitle>
					{t("my_vacancies.selection_process.live_coding.awaiting_title")}
				</AlertTitle>
				<AlertDescription>
					{missingCount > 0
						? t(
								"my_vacancies.selection_process.live_coding.awaiting_description",
								{ count: missingCount },
							)
						: t("my_vacancies.selection_process.live_coding.awaiting_ready")}
				</AlertDescription>
			</Alert>
			<div className="flex flex-col gap-2">
				{applyList.map((apply) => (
					<StepApplyCard key={apply.id} apply={apply}>
						<ApplyLiveCoding
							apply={apply}
							showNegotiation={false}
							onUpdated={onUpdated}
						/>
					</StepApplyCard>
				))}
			</div>
		</div>
	);
}

export default function LiveCodingStep({
	vacancyId,
}: SelectionProcessStepProps) {
	const queryClient = useQueryClient();

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	const status = getStepStatus(STAGE, vacancy?.data);

	// O live coding vem junto da candidatura, então a listagem inteira é refeita
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

	if (status === "awaiting") {
		return (
			<AwaitingExercisesList vacancyId={vacancyId} onUpdated={refreshApplies} />
		);
	}

	return (
		<StepAppliesList
			vacancyId={vacancyId}
			processStep={STAGE}
			renderApplyExtra={(apply) => (
				<ApplyLiveCoding
					apply={apply}
					showNegotiation
					onUpdated={refreshApplies}
				/>
			)}
		/>
	);
}
