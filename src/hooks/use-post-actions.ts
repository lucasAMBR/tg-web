import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useTogglePostLike } from "@/api/generated/like/like";
import { useToggleFavoritePost } from "@/api/generated/post/post";
import { patchCachedPost, removeCachedPost } from "@/hooks/use-post-feed";
import type { Post } from "@/types/social";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	isResourceUnavailable,
	socialErrorMessageKey,
} from "@/utils/social-error";

interface UsePostActionsOptions {
	/**
	 * Na tela de favoritos o card sai da lista ao ser desfavoritado, porque ele
	 * deixa de fazer parte dela.
	 */
	removeOnUnfavorite?: boolean;
}

/**
 * Curtir e favoritar com atualização otimista: a tela muda na hora, a resposta
 * confirma o estado final e um erro desfaz o que foi aplicado. O botão fica
 * desabilitado durante a requisição porque clique duplo gera erro na API.
 */
export function usePostActions(
	post: Post,
	options: UsePostActionsOptions = {},
) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const handleError = (error: unknown, revert: () => void) => {
		revert();

		if (isResourceUnavailable(error)) {
			removeCachedPost(queryClient, post.id);
		}

		CustomToaster.errorToast(t(socialErrorMessageKey(error, "post")));
	};

	const { mutate: toggleLike, isPending: isTogglingLike } = useTogglePostLike();

	const { mutate: toggleFavorite, isPending: isTogglingFavorite } =
		useToggleFavoritePost();

	const likePost = () => {
		const previous = { is_liked: post.is_liked, likes_count: post.likes_count };

		patchCachedPost(queryClient, post.id, (current) => ({
			...current,
			is_liked: !previous.is_liked,
			likes_count: previous.likes_count + (previous.is_liked ? -1 : 1),
		}));

		toggleLike(
			{ id: post.id },
			{
				onSuccess: (response) => {
					patchCachedPost(queryClient, post.id, (current) => ({
						...current,
						is_liked: response.data.liked,
						likes_count: response.data.likes_count,
					}));
				},
				onError: (error) =>
					handleError(error, () =>
						patchCachedPost(queryClient, post.id, (current) => ({
							...current,
							...previous,
						})),
					),
			},
		);
	};

	const favoritePost = () => {
		const previous = {
			is_favorited: post.is_favorited,
			favorites_count: post.favorites_count,
		};

		patchCachedPost(queryClient, post.id, (current) => ({
			...current,
			is_favorited: !previous.is_favorited,
			favorites_count:
				previous.favorites_count + (previous.is_favorited ? -1 : 1),
		}));

		toggleFavorite(
			{ id: post.id },
			{
				onSuccess: (response) => {
					patchCachedPost(queryClient, post.id, (current) => ({
						...current,
						is_favorited: response.data.favorited,
						favorites_count: response.data.favorites_count,
					}));

					if (!response.data.favorited && options.removeOnUnfavorite) {
						removeCachedPost(queryClient, post.id, { onlyFavorites: true });
					}
				},
				onError: (error) =>
					handleError(error, () =>
						patchCachedPost(queryClient, post.id, (current) => ({
							...current,
							...previous,
						})),
					),
			},
		);
	};

	return {
		likePost,
		favoritePost,
		isTogglingLike,
		isTogglingFavorite,
	};
}
