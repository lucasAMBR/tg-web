import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDeleteFreelanceProposal } from "@/api/generated/freelance-proposal/freelance-proposal";
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
import {
	invalidateFreelanceData,
	setCachedMyProposal,
} from "@/hooks/use-freelance-lists";
import type { FreelanceProposal } from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import { freelanceErrorMessageKey } from "@/utils/freelance-error";

interface WithdrawProposalDialogProps {
	proposal: Pick<FreelanceProposal, "id" | "freelance_job_vacancy_id">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Retirar o orçamento pendente. Depois o dev pode enviar outro. */
export default function WithdrawProposalDialog({
	proposal,
	open,
	onOpenChange,
}: WithdrawProposalDialogProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { mutate: withdrawProposal, isPending } = useDeleteFreelanceProposal();

	const vacancyId = proposal.freelance_job_vacancy_id;

	const handleWithdraw = () => {
		withdrawProposal(
			{ id: proposal.id },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.freelance_proposal_withdrawn"),
					);
					setCachedMyProposal(queryClient, vacancyId, null);
					invalidateFreelanceData(queryClient, vacancyId);
					onOpenChange(false);
				},
				onError: (error) => {
					CustomToaster.errorToast(
						t(freelanceErrorMessageKey(error, "proposal")),
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
						{t("freelance.proposal.withdraw_title")}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t("freelance.proposal.withdraw_description")}
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
					<Button
						variant={"destructive"}
						onClick={handleWithdraw}
						disabled={isPending}
					>
						{isPending ? <Spinner /> : t("freelance.proposal.withdraw")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
