import type { CommentResource } from "@/api/generated/models";
import { useAuthStore } from "@/stores/auth-store";
import { usePermissionStore } from "@/stores/permission-store";
import type { Post } from "@/types/social";

/**
 * Quais ações da rede social a interface mostra. A API valida tudo de novo e
 * responde 403 — esconder botão aqui serve só para não oferecer o que vai falhar.
 *
 * O comentário não traz `user_id`, então a dona dele é identificada por
 * `author?.id`, que vem `null` quando o comentário foi removido.
 */
export function useSocialPermissions() {
	const userId = useAuthStore((state) => state.user?.id);

	const roles = usePermissionStore((state) => state.roles);
	const hasPermission = usePermissionStore((state) => state.hasPermission);

	const isAdmin = roles.includes("admin");

	const isMine = (ownerId: string | null | undefined) =>
		Boolean(ownerId) && ownerId === userId;

	return {
		userId,
		isAdmin,
		canCreatePost: hasPermission("post.create"),
		canCreateComment: hasPermission("comment.create"),
		canEditPost: (post: Post) =>
			isMine(post.user_id) && hasPermission("post.update"),
		canDeletePost: (post: Post) =>
			(isMine(post.user_id) || isAdmin) && hasPermission("post.delete"),
		canEditComment: (comment: CommentResource) =>
			!comment.is_removed &&
			isMine(comment.author?.id) &&
			hasPermission("comment.update"),
		canDeleteComment: (comment: CommentResource) =>
			!comment.is_removed &&
			(isMine(comment.author?.id) || isAdmin) &&
			hasPermission("comment.delete"),
		canReplyComment: (comment: CommentResource) =>
			!comment.is_removed && hasPermission("comment.create"),
		canLikeComment: (comment: CommentResource) => !comment.is_removed,
		/** Botão de seguir. Nunca aparece para o próprio usuário. */
		canToggleFollow: (targetUserId: string | null | undefined) =>
			Boolean(targetUserId) &&
			!isMine(targetUserId) &&
			hasPermission("follow.toggle"),
		/** Sem ela, os contadores aparecem sem link para as listas. */
		canViewFollows: hasPermission("follow.view"),
		/** Os participantes saem dos comentários, então pedem a mesma permissão. */
		canViewPostParticipants: hasPermission("comment.view"),
	};
}
