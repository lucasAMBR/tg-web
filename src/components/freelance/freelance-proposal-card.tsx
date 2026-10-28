import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import StartChatButton from "@/components/chat/start-chat-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import { cn } from "@/lib/utils";
import {
	compareWithBudget,
	type FreelanceProposal,
	FreelanceProposalStatus,
	type FreelanceVacancy,
	getFreelanceLocale,
	proposalPriceLabel,
	type RankedFreelanceProposal,
	toPercentage,
} from "@/types/freelance";
import { formatDateTime } from "@/utils/formatter";
import AcceptProposalDialog from "./accept-proposal-dialog";
import FreelanceDevSummaryRow from "./freelance-dev-summary";
import { FreelanceProposalStatusBadge } from "./freelance-status-badge";

/** Id do elemento do orçamento, para o atalho "Ver orçamento" dos devs recomendados. */
export function getProposalElementId(devProfileId: string): string {
	return `freelance-proposal-${devProfileId}`;
}

/** Quanto o orçamento fica acima ou abaixo do budget. Só o dono tem o budget. */
function BudgetComparisonText({
	totalPrice,
	budget,
}: {
	totalPrice: string;
	budget: string | undefined;
}) {
	const { t } = useTranslation();

	const comparison = compareWithBudget(totalPrice, budget);

	if (!comparison) return null;

	if (comparison.direction === "equal") {
		return (
			<p className="text-xs text-muted-foreground">
				{t("freelance.proposals.equal_budget")}
			</p>
		);
	}

	return (
		<p
			className={cn(
				"text-xs",
				comparison.direction === "above"
					? "text-destructive"
					: "text-emerald-600 dark:text-emerald-400",
			)}
		>
			{t(
				comparison.direction === "above"
					? "freelance.proposals.above_budget"
					: "freelance.proposals.below_budget",
				{ percentage: comparison.percentage },
			)}
		</p>
	);
}

interface FreelanceProposalCardProps {
	vacancy: FreelanceVacancy;
	proposal: FreelanceProposal;
	/** No ranking: o score e a composição dele. */
	ranking?: Pick<
		RankedFreelanceProposal,
		"score" | "similarity" | "price_score"
	>;
	highlighted?: boolean;
}

/** Orçamento recebido, na visão do cliente dono do freela. */
export default function FreelanceProposalCard({
	vacancy,
	proposal,
	ranking,
	highlighted = false,
}: FreelanceProposalCardProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const { canAcceptProposal } = useFreelancePermissions();

	const [acceptOpen, setAcceptOpen] = useState(false);

	const canAccept =
		canAcceptProposal(vacancy) &&
		proposal.status === FreelanceProposalStatus.pending;

	return (
		<Card
			id={getProposalElementId(proposal.dev_profile_id)}
			className={cn(
				"w-full gap-4 p-4 transition-shadow",
				highlighted && "ring-2 ring-primary",
			)}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<FreelanceDevSummaryRow dev={proposal.dev_profile} />
				{ranking ? (
					<div className="flex flex-col items-start gap-1 sm:items-end">
						<Badge
							className={cn(
								"text-sm",
								toPercentage(ranking.score) >= 70
									? "bg-emerald-500 text-white"
									: "bg-primary text-primary-foreground",
							)}
						>
							{t("freelance.proposals.score", {
								percentage: toPercentage(ranking.score),
							})}
						</Badge>
						<p className="text-xs text-muted-foreground sm:text-right">
							{t("freelance.proposals.score_breakdown", {
								similarity:
									ranking.similarity === null
										? t("freelance.proposals.profile_not_analyzed")
										: `${toPercentage(ranking.similarity)}%`,
								price: toPercentage(ranking.price_score),
							})}
						</p>
					</div>
				) : (
					<FreelanceProposalStatusBadge proposal={proposal} />
				)}
			</div>
			<div className="flex flex-col gap-1">
				<p className="font-semibold">
					{proposalPriceLabel(proposal, t, locale)}
				</p>
				<BudgetComparisonText
					totalPrice={proposal.total_price}
					budget={vacancy.budget}
				/>
				<p className="text-xs text-muted-foreground">
					{t("freelance.proposal.sent_at", {
						date: formatDateTime(proposal.created_at, { locale }),
					})}
				</p>
			</div>
			{proposal.message && (
				<p className="whitespace-pre-line wrap-break-word text-sm">
					{proposal.message}
				</p>
			)}
			<div className="flex flex-row flex-wrap gap-2">
				{canAccept && (
					<Button onClick={() => setAcceptOpen(true)}>
						<CheckCircle2 className="size-4" />
						{t("freelance.proposals.accept")}
					</Button>
				)}
				<StartChatButton
					userId={proposal.dev_profile?.user_id}
					draft={t("freelance.chat_draft.client", { title: vacancy.title })}
				/>
			</div>
			{canAccept && (
				<AcceptProposalDialog
					proposal={proposal}
					open={acceptOpen}
					onOpenChange={setAcceptOpen}
				/>
			)}
		</Card>
	);
}
