import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getShowPostQueryKey, useDeletePost } from "@/api/generated/post/post";
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
import { removeCachedPost } from "@/hooks/use-post-feed";
import type { Post } from "@/types/social";
import { CustomToaster } from "@/utils/custom-toaster";
import { socialErrorMessageKey } from "@/utils/social-error";

interface DeletePostDialogProps {
	post: Post;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted?: () => void;
}

/**
 * Exclusão da postagem. Depois dela qualquer rota com esse id responde 422, por
 * isso o card sai do feed, dos favoritos e da tela do post de uma vez.
 */
export default function DeletePostDialog({
	post,
	open,
	onOpenChange,
	onDeleted,
}: DeletePostDialogProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { mutate: deletePost, isPending } = useDeletePost();

	const handleDelete = () => {
		deletePost(
			{ id: post.id },
			{
				onSuccess: () => {
					removeCachedPost(queryClient, post.id);
					queryClient.removeQueries({
						queryKey: getShowPostQueryKey(post.id),
					});

					CustomToaster.successToast(t("toast.success.post_deleted"));

					onOpenChange(false);
					onDeleted?.();
				},
				onError: (error) => {
					CustomToaster.errorToast(t(socialErrorMessageKey(error, "post")));
				},
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("general.are_you_sure")}</AlertDialogTitle>
					<AlertDialogDescription>
						{t("social.post.delete_description")}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button variant={"outline"} onClick={() => onOpenChange(false)}>
						{t("general.cancel")}
					</Button>
					<Button
						variant={"destructive"}
						onClick={handleDelete}
						disabled={isPending}
					>
						{isPending ? <Spinner /> : t("general.delete")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
