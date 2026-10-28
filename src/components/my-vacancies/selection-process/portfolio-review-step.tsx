import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import {
	type DevJobVacancyResource,
	SelectionProcessStageEnum,
} from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import {
	getPortfolioSolicitation,
	portfolioWasSent,
} from "@/types/portfolio-solicitation";
import StepAppliesList from "./step-applies-list";
import type { SelectionProcessStepProps } from "./step-props";
import StepResultsList from "./step-results-list";
import { getStepStatus } from "./step-status";
import StepUpcomingEmpty from "./step-upcoming-empty";

const STAGE = SelectionProcessStageEnum.portfolio_review;

function PortfolioSolicitationInfo({
	apply,
}: {
	apply: DevJobVacancyResource;
}) {
	const { t } = useTranslation();

	const solicitation = getPortfolioSolicitation(apply);

	if (!solicitation) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_vacancies.selection_process.portfolio_review.not_requested")}
			</p>
		);
	}

	const wasSent = portfolioWasSent(solicitation);

	return (
		<div className="flex flex-col gap-2 border-t pt-3">
			<div className="flex flex-row flex-wrap gap-2">
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
			</div>
			{wasSent ? (
				// O clique para no link para não navegar para o perfil do candidato
				<a
					href={solicitation.portfolio_url ?? undefined}
					target="_blank"
					rel="noreferrer"
					onClick={(event) => event.stopPropagation()}
					className="flex w-fit items-center gap-1 text-sm text-primary break-all"
				>
					<ExternalLink className="size-3.5 shrink-0" />
					{solicitation.portfolio_url}
				</a>
			) : (
				<p className="text-sm text-muted-foreground">
					{t("my_vacancies.selection_process.portfolio_review.awaiting_link")}
				</p>
			)}
		</div>
	);
}

export default function PortfolioReviewStep({
	vacancyId,
}: SelectionProcessStepProps) {
	const { data: vacancy } = useShowJobVacancy(vacancyId);

	const status = getStepStatus(STAGE, vacancy?.data);

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
			renderApplyExtra={(apply) => <PortfolioSolicitationInfo apply={apply} />}
		/>
	);
}
