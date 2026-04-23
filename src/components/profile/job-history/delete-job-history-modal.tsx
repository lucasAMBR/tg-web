import {
	getIndexEmploymentHistoryQueryKey,
	useDeleteEmploymentHistory,
} from "@/api/generated/employment-history-doc/employment-history-doc";
import type { EmploymentHistoryModel } from "@/api/generated/models";
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
import { useJobHistoryParams } from "@/hooks/filters/use-job-history-filters";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

interface DeletejobHistoryModalProps {
	open: boolean;
	openChange: (open: boolean) => void;
	closeModal: () => void;
	profileId: string;
	job: EmploymentHistoryModel | null;
}

export default function DeletejobHistoryModal({
	open,
	openChange,
	closeModal,
	profileId,
	job,
}: DeletejobHistoryModalProps) {
	if (!job) return null;

	const { page, perPage, search } = useJobHistoryParams();

	const queryClient = useQueryClient();

	const { mutate: deleteItem, isPending: deleteIsPending } =
		useDeleteEmploymentHistory();

	const handleDeleteItem = () => {
		if (!job) return;
		deleteItem(
			{ id: job.id },
			{
				onSuccess: (success) => {
					CustomToaster.successToast(success.message);

					queryClient.invalidateQueries({
						queryKey: getIndexEmploymentHistoryQueryKey({
							profile_id: profileId,
							page,
							per_page: perPage,
							search,
						}),
					});

					closeModal();
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={openChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action is permanent!
					</AlertDialogDescription>
				</AlertDialogHeader>
				<p>
					When you delete an item from your job history he doesn't will be more
					used by our recommendation algorithm
				</p>
				<AlertDialogFooter>
					<Button variant={"outline"} onClick={closeModal}>
						Cancel
					</Button>
					<Button
						variant={"destructive"}
						onClick={handleDeleteItem}
						disabled={deleteIsPending}
					>
						{deleteIsPending ? <Spinner /> : "Delete"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
