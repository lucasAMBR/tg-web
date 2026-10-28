import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useCompleteFreelanceJobVacancy } from "@/api/generated/freelance-job-vacancy/freelance-job-vacancy";
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
	setCachedFreelanceVacancy,
} from "@/hooks/use-freelance-lists";
import type { FreelanceVacancy } from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import { freelanceErrorMessageKey } from "@/utils/freelance-error";

interface CompleteFreelanceDialogProps {
	vacancy: Pick<FreelanceVacancy, "id">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Conclusão do freela pelo cliente, só com ele `in_progress`. Depois dela o
 * feed fica só para consulta, então o freela é recarregado para o composer
 * sumir.
 */
export default function CompleteFreelanceDialog({
	vacancy,
	open,
	onOpenChange,
}: CompleteFreelanceDialogProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { mutate: completeVacancy, isPending } =
		useCompleteFreelanceJobVacancy();

	const handleComplete = () => {
		completeVacancy(
			{ id: vacancy.id },
			{
				onSuccess: (response) => {
					CustomToaster.successToast(
						t("toast.success.freelance_vacancy_completed"),
					);
					setCachedFreelanceVacancy(queryClient, response.data);
					invalidateFreelanceData(queryClient, vacancy.id);
					onOpenChange(false);
				},
				onError: (error) => {
					CustomToaster.errorToast(
						t(freelanceErrorMessageKey(error, "complete")),
					);
					invalidateFreelanceData(queryClient, vacancy.id);
					onOpenChange(false);
				},
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("freelance.complete_title")}</AlertDialogTitle>
					<AlertDialogDescription>
						{t("freelance.complete_description")}
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
					<Button onClick={handleComplete} disabled={isPending}>
						{isPending ? <Spinner /> : t("freelance.details.complete")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
