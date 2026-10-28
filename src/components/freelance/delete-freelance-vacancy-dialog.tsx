import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDeleteFreelanceJobVacancy } from "@/api/generated/freelance-job-vacancy/freelance-job-vacancy";
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
	removeCachedFreelanceVacancy,
} from "@/hooks/use-freelance-lists";
import type { FreelanceVacancy } from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	freelanceErrorMessageKey,
	isFreelanceUnavailable,
} from "@/utils/freelance-error";

interface DeleteFreelanceVacancyDialogProps {
	vacancy: Pick<FreelanceVacancy, "id" | "title">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted?: () => void;
}

/** Remoção do freela, que a API só aceita enquanto ele está `open`. */
export default function DeleteFreelanceVacancyDialog({
	vacancy,
	open,
	onOpenChange,
	onDeleted,
}: DeleteFreelanceVacancyDialogProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { mutate: deleteVacancy, isPending } = useDeleteFreelanceJobVacancy();

	const finish = () => {
		removeCachedFreelanceVacancy(queryClient, vacancy.id);
		invalidateFreelanceData(queryClient);

		onOpenChange(false);
		onDeleted?.();
	};

	const handleDelete = () => {
		deleteVacancy(
			{ id: vacancy.id },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.freelance_vacancy_deleted"),
					);
					finish();
				},
				onError: (error) => {
					CustomToaster.errorToast(
						t(freelanceErrorMessageKey(error, "vacancy")),
					);

					// Já tinha sido removido: o resultado é o mesmo
					if (isFreelanceUnavailable(error)) {
						finish();

						return;
					}

					// Saiu do `open` (foi contratado): a tela mostra o estado novo
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
					<AlertDialogTitle>{t("freelance.remove_title")}</AlertDialogTitle>
					<AlertDialogDescription>
						{t("freelance.remove_description", { title: vacancy.title })}
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
						onClick={handleDelete}
						disabled={isPending}
					>
						{isPending ? <Spinner /> : t("freelance.details.remove")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
