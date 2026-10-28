import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAcceptFreelanceProposal } from "@/api/generated/freelance-proposal/freelance-proposal";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { invalidateFreelanceData } from "@/hooks/use-freelance-lists";
import {
	type FreelanceProposal,
	getFreelanceLocale,
	proposalPriceLabel,
} from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import { freelanceErrorMessageKey } from "@/utils/freelance-error";

interface AcceptProposalDialogProps {
	proposal: FreelanceProposal;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Aceitar fecha o contrato: o orçamento fica `accepted`, os outros pendentes
 * `rejected` e o freela `in_progress`. Depois o freela é recarregado e o cliente
 * vai para o feed.
 */
export default function AcceptProposalDialog({
	proposal,
	open,
	onOpenChange,
}: AcceptProposalDialogProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { mutate: acceptProposal, isPending } = useAcceptFreelanceProposal();

	const vacancyId = proposal.freelance_job_vacancy_id;

	const handleAccept = () => {
		acceptProposal(
			{ id: proposal.id },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.freelance_proposal_accepted"),
					);
					invalidateFreelanceData(queryClient, vacancyId);
					onOpenChange(false);
					navigate({ to: "/freelances/$id/feed", params: { id: vacancyId } });
				},
				onError: (error) => {
					CustomToaster.errorToast(
						t(freelanceErrorMessageKey(error, "accept")),
					);
					invalidateFreelanceData(queryClient, vacancyId);
					onOpenChange(false);
				},
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t("freelance.proposals.accept_title")}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t("freelance.proposals.accept_description", {
							name:
								proposal.dev_profile?.name ??
								t("freelance.proposals.dev_unavailable"),
							price: proposalPriceLabel(proposal, t, locale),
						})}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button
						variant={"outline"}
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						{t("general.cancel")}
					</Button>
					<Button onClick={handleAccept} disabled={isPending}>
						{isPending ? <Spinner /> : t("freelance.proposals.accept")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
