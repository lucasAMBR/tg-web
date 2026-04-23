import {
	getIndexAcademicBackgroundQueryKey,
	useDeleteAcademicBackground,
} from "@/api/generated/academic-background-doc/academic-background-doc";
import type { AcademicBackgroundModel } from "@/api/generated/models";
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
import { useAcademicBackgroundParams } from "@/hooks/filters/use-academic-background-params";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

interface DeleteAcademicBackgroundModalProps {
	profileId: string;
	bg: AcademicBackgroundModel | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	closeModal: () => void;
}
export default function DeleteAcademicBackgroundModal({
	open,
	onOpenChange,
	closeModal,
	bg,
	profileId,
}: DeleteAcademicBackgroundModalProps) {
	if (!bg) return null;

	const { page, perPage, search } = useAcademicBackgroundParams();

	const queryClient = useQueryClient();

	const { mutate: deleteBackground, isPending } = useDeleteAcademicBackground();

	const handleDelete = () => {
		deleteBackground(
			{ id: bg.id },
			{
				onSuccess: (success) => {
					CustomToaster.successToast(success.message);

					queryClient.invalidateQueries({
						queryKey: getIndexAcademicBackgroundQueryKey({
							dev_profile_id: profileId,
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
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action is permanent!
					</AlertDialogDescription>
				</AlertDialogHeader>
				<p>
					If you remove an academic background, this register will not be used
					by out recommendation algorithm
				</p>
				<AlertDialogFooter>
					<Button variant={"outline"} onClick={closeModal}>
						Cancel
					</Button>
					<Button
						variant={"destructive"}
						onClick={handleDelete}
						disabled={isPending}
					>
						{isPending ? <Spinner /> : "Delete"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
