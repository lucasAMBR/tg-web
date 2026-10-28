import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
	useDeleteComment,
	useStoreComment,
	useUpdateComment,
} from "@/api/generated/comment/comment";
import { useToggleCommentLike } from "@/api/generated/like/like";
import type { CommentResource } from "@/api/generated/models";
import type { CommentTreeState } from "@/hooks/use-comment-tree";
import { patchCachedPost } from "@/hooks/use-post-feed";
import { invalidatePostParticipants } from "@/hooks/use-post-participants";
import { asRemovedComment } from "@/types/social";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	isRemovedCommentError,
	socialErrorMessageKey,
	socialFieldErrors,
} from "@/utils/social-error";

interface UseCommentActionsParams {
	postId: string;
	comment: CommentResource;
	tree: CommentTreeState;
}

/**
 * Ações de um comentário. Tudo é aplicado na árvore local em vez de recarregar
 * a listagem, para não fechar as respostas que já estavam abertas. Quando a API
 * recusa a ação porque o comentário acabou de ser removido por outra pessoa, o
 * nó é atualizado na tela para o formato de removido.
 */
export function useCommentActions({
	postId,
	comment,
	tree,
}: UseCommentActionsParams) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { mutate: toggleLike, isPending: isTogglingLike } =
		useToggleCommentLike();
	const { mutate: storeComment, isPending: isReplying } = useStoreComment();
	const { mutate: updateComment, isPending: isSaving } = useUpdateComment();
	const { mutate: deleteComment, isPending: isRemoving } = useDeleteComment();

	const handleError = (error: unknown, revert?: () => void) => {
		revert?.();

		if (isRemovedCommentError(error)) {
			tree.patchComment(comment.id, asRemovedComment);
		}

		CustomToaster.errorToast(t(socialErrorMessageKey(error, "comment")));
	};

	const bumpPostComments = (delta: number) => {
		patchCachedPost(queryClient, postId, (post) => ({
			...post,
			comments_count: post.comments_count + delta,
		}));
	};

	const likeComment = () => {
		const previous = {
			is_liked: comment.is_liked,
			likes_count: comment.likes_count,
		};

		tree.patchComment(comment.id, (current) => ({
			...current,
			is_liked: !previous.is_liked,
			likes_count: previous.likes_count + (previous.is_liked ? -1 : 1),
		}));

		toggleLike(
			{ id: comment.id },
			{
				onSuccess: (response) => {
					tree.patchComment(comment.id, (current) => ({
						...current,
						is_liked: response.data.liked,
						likes_count: response.data.likes_count,
					}));
				},
				onError: (error) =>
					handleError(error, () =>
						tree.patchComment(comment.id, (current) => ({
							...current,
							...previous,
						})),
					),
			},
		);
	};

	/** `onFieldError` recebe a mensagem de validação do campo de texto. */
	const replyToComment = (
		content: string,
		callbacks: {
			onSuccess: () => void;
			onFieldError: (message: string) => void;
		},
	) => {
		storeComment(
			{ data: { post_id: postId, parent_id: comment.id, content } },
			{
				onSuccess: (response) => {
					tree.addReply(comment.id, response.data);
					bumpPostComments(1);
					invalidatePostParticipants(queryClient, postId);

					callbacks.onSuccess();
				},
				onError: (error) => {
					const fieldErrors = socialFieldErrors(error);

					if (fieldErrors?.content) {
						callbacks.onFieldError(fieldErrors.content[0]);
						return;
					}

					handleError(error);
				},
			},
		);
	};

	const editComment = (
		content: string,
		callbacks: {
			onSuccess: () => void;
			onFieldError: (message: string) => void;
		},
	) => {
		updateComment(
			{ id: comment.id, data: { content } },
			{
				onSuccess: (response) => {
					// Só o texto e a data mudam: manter o resto preserva as respostas
					// que já estavam carregadas abaixo deste nó.
					tree.patchComment(comment.id, (current) => ({
						...current,
						content: response.data.content,
						updated_at: response.data.updated_at,
					}));

					callbacks.onSuccess();
				},
				onError: (error) => {
					const fieldErrors = socialFieldErrors(error);

					if (fieldErrors?.content) {
						callbacks.onFieldError(fieldErrors.content[0]);
						return;
					}

					handleError(error);
				},
			},
		);
	};

	const removeComment = (onSuccess?: () => void) => {
		deleteComment(
			{ id: comment.id },
			{
				onSuccess: () => {
					// Remoção lógica: o nó continua na árvore com as respostas dele e
					// nenhum contador diminui, nem o do post. Já entre os participantes
					// o comentário removido deixa de contar.
					tree.markCommentRemoved(comment.id);
					invalidatePostParticipants(queryClient, postId);

					CustomToaster.successToast(t("toast.success.comment_deleted"));

					onSuccess?.();
				},
				onError: (error) => handleError(error),
			},
		);
	};

	return {
		likeComment,
		replyToComment,
		editComment,
		removeComment,
		isTogglingLike,
		isReplying,
		isSaving,
		isRemoving,
	};
}
