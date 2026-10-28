import { Pencil, Undo2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import {
	type FreelanceProposal,
	type FreelanceVacancy,
	getFreelanceLocale,
	proposalPriceLabel,
} from "@/types/freelance";
import { formatDateTime } from "@/utils/formatter";
import FreelanceProposalForm from "./freelance-proposal-form";
import { FreelanceProposalStatusBadge } from "./freelance-status-badge";
import WithdrawProposalDialog from "./withdraw-proposal-dialog";

interface MyProposalCardProps {
	vacancy: FreelanceVacancy;
	proposal: FreelanceProposal;
}

/**
 * "Seu orçamento": com ele pendente e o freela aberto, Editar e Retirar. Depois
 * de aceito ou recusado, só o status.
 */
function MyProposalCard({ vacancy, proposal }: MyProposalCardProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const { canEditProposal, canWithdrawProposal } = useFreelancePermissions();

	const [isEditing, setIsEditing] = useState(false);
	const [withdrawOpen, setWithdrawOpen] = useState(false);

	const canEdit = canEditProposal(vacancy, proposal);
	const canWithdraw = canWithdrawProposal(vacancy, proposal);

	return (
		<Card className="w-full gap-4 p-8">
			<div className="flex flex-row flex-wrap items-center justify-between gap-2">
				<h3 className="text-lg font-bold">
					{isEditing
						? t("freelance.proposal.edit_title")
						: t("freelance.proposal.yours")}
				</h3>
				<FreelanceProposalStatusBadge proposal={proposal} />
			</div>
			{isEditing ? (
				<FreelanceProposalForm
					vacancyId={vacancy.id}
					proposal={proposal}
					onDone={() => setIsEditing(false)}
					onCancel={() => setIsEditing(false)}
				/>
			) : (
				<>
					<div className="flex flex-col gap-1">
						<p className="text-lg font-semibold">
							{proposalPriceLabel(proposal, t, locale)}
						</p>
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
					{(canEdit || canWithdraw) && (
						<div className="flex flex-row flex-wrap gap-2">
							{canEdit && (
								<Button variant={"outline"} onClick={() => setIsEditing(true)}>
									<Pencil className="size-4" />
									{t("freelance.proposal.edit")}
								</Button>
							)}
							{canWithdraw && (
								<Button
									variant={"destructive"}
									onClick={() => setWithdrawOpen(true)}
								>
									<Undo2 className="size-4" />
									{t("freelance.proposal.withdraw")}
								</Button>
							)}
						</div>
					)}
				</>
			)}
			{canWithdraw && (
				<WithdrawProposalDialog
					proposal={proposal}
					open={withdrawOpen}
					onOpenChange={setWithdrawOpen}
				/>
			)}
		</Card>
	);
}

/**
 * O orçamento no detalhe, para o dev: o formulário enquanto ele não orçou, ou o
 * card do orçamento já enviado.
 */
export default function FreelanceDevProposalSection({
	vacancy,
}: {
	vacancy: FreelanceVacancy;
}) {
	const { t } = useTranslation();

	const { canPropose } = useFreelancePermissions();

	if (vacancy.my_proposal) {
		return <MyProposalCard vacancy={vacancy} proposal={vacancy.my_proposal} />;
	}

	if (!canPropose(vacancy)) return null;

	return (
		<Card className="w-full gap-4 p-8">
			<div className="flex flex-col gap-1">
				<h3 className="text-lg font-bold">
					{t("freelance.proposal.form_title")}
				</h3>
				<p className="text-sm text-muted-foreground">
					{t("freelance.proposal.form_description")}
				</p>
			</div>
			<FreelanceProposalForm vacancyId={vacancy.id} />
		</Card>
	);
}
