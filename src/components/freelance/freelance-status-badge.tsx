import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	type FreelanceProposal,
	FreelanceProposalStatus,
	FreelanceStatus,
	type FreelanceVacancy,
} from "@/types/freelance";

const VACANCY_STATUS_CLASSES: Record<string, string> = {
	[FreelanceStatus.open]: "bg-emerald-500 text-white",
	[FreelanceStatus.in_progress]: "bg-amber-500 text-white",
	[FreelanceStatus.completed]: "bg-secondary text-secondary-foreground",
};

const PROPOSAL_STATUS_CLASSES: Record<string, string> = {
	[FreelanceProposalStatus.pending]: "bg-amber-500 text-white",
	[FreelanceProposalStatus.accepted]: "bg-emerald-500 text-white",
	[FreelanceProposalStatus.rejected]: "bg-destructive text-white",
};

export function FreelanceStatusBadge({
	vacancy,
	className,
}: {
	vacancy: Pick<FreelanceVacancy, "status" | "status_label">;
	className?: string;
}) {
	const { t } = useTranslation();

	return (
		<Badge className={cn(VACANCY_STATUS_CLASSES[vacancy.status], className)}>
			{t(`enum.freelance_job_vacancy_status.${vacancy.status}`, {
				defaultValue: vacancy.status_label,
			})}
		</Badge>
	);
}

export function FreelanceProposalStatusBadge({
	proposal,
	className,
}: {
	proposal: Pick<FreelanceProposal, "status" | "status_label">;
	className?: string;
}) {
	const { t } = useTranslation();

	return (
		<Badge className={cn(PROPOSAL_STATUS_CLASSES[proposal.status], className)}>
			{t(`enum.freelance_proposal_status.${proposal.status}`, {
				defaultValue: proposal.status_label,
			})}
		</Badge>
	);
}
