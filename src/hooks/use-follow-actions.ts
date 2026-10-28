import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToggleFollow } from "@/api/generated/follow/follow";
import {
	adjustOwnFollowingCount,
	patchCachedFollowState,
} from "@/hooks/use-follow-list";
import { resetFollowingFeeds } from "@/hooks/use-post-feed";
import { useAuthStore } from "@/stores/auth-store";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	isSelfFollowError,
	socialErrorMessageKey,
	socialErrorStatus,
} from "@/utils/social-error";

interface FollowTarget {
	/** Id do **usuário**, não o do perfil: a rota responde 422 com id de perfil. */
	userId: string;
	isFollowed: boolean;
}

/**
 * Seguir e deixar de seguir com atualização otimista: a tela muda na hora em
 * todo lugar que o usuário aparece, a resposta confirma o estado final e o
 * total de seguidores (outras pessoas podem ter seguido nesse meio-tempo) e um
 * erro desfaz o que foi aplicado. O botão fica desabilitado durante a
 * requisição porque clique duplo gera erro na API.
 */
export function useFollowActions(target: FollowTarget) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { mutate } = useToggleFollow();

	// O mesmo usuário pode ter botão em mais de um lugar ao mesmo tempo (no
	// perfil e numa lista aberta por cima dele), então todos ficam desabilitados
	const isPending =
		useIsMutating({
			mutationKey: ["toggleFollow"],
			predicate: (mutation) =>
				(mutation.state.variables as { id?: string } | undefined)?.id ===
				target.userId,
		}) > 0;

	const handleError = (error: unknown) => {
		// O botão não aparece no próprio perfil; se acontecer, só desfaz
		if (isSelfFollowError(error)) return;

		// Sem `follow.toggle`: recarrega as permissões para o botão sumir
		if (socialErrorStatus(error) === 403) {
			useAuthStore
				.getState()
				.hydrateUser()
				.catch(() => undefined);
			return;
		}

		CustomToaster.errorToast(t(socialErrorMessageKey(error, "follow")));
	};

	const toggleFollow = () => {
		const wasFollowed = target.isFollowed;
		const followingDelta = wasFollowed ? -1 : 1;

		patchCachedFollowState(queryClient, target.userId, {
			is_followed: !wasFollowed,
		});
		adjustOwnFollowingCount(queryClient, followingDelta);

		mutate(
			{ id: target.userId },
			{
				onSuccess: (response) => {
					const { following, followers_count } = response.data;

					patchCachedFollowState(queryClient, target.userId, {
						is_followed: following,
						followers_count,
					});

					if (following === wasFollowed) {
						adjustOwnFollowingCount(queryClient, -followingDelta);
						return;
					}

					resetFollowingFeeds(queryClient);
				},
				onError: (error) => {
					patchCachedFollowState(queryClient, target.userId, {
						is_followed: wasFollowed,
					});
					adjustOwnFollowingCount(queryClient, -followingDelta);

					handleError(error);
				},
			},
		);
	};

	return { toggleFollow, isPending };
}
