import {
	type InfiniteData,
	type QueryClient,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type {
	IndexPostParams,
	PostCollectionPagination,
	ShowPost200,
} from "@/api/generated/models";
import {
	getShowPostQueryKey,
	indexFavoritePosts,
	indexPost,
} from "@/api/generated/post/post";
import { dedupeById, POSTS_PER_PAGE, type Post } from "@/types/social";

export type PostFeedSort = NonNullable<IndexPostParams["sort"]>;

export interface PostFeedFilters {
	/** `popular` ordena por engajamento; `recent`, por data. */
	sort?: PostFeedSort;
	search?: string;
	/** Filtra pelo autor — é assim que a aba de publicações do perfil funciona. */
	userId?: string;
	/** Fica `false` enquanto o id do autor do perfil ainda não chegou. */
	enabled?: boolean;
}

/** Só os favoritos do usuário autenticado; não aceita filtro de autor. */
export interface FavoritePostsFilters {
	search?: string;
}

export const getPostFeedQueryKey = (filters: PostFeedFilters) =>
	[
		"/post",
		"infinite",
		filters.sort ?? "recent",
		filters.search ?? "",
		filters.userId ?? "",
	] as const;

export const getFavoritePostsQueryKey = (filters: FavoritePostsFilters) =>
	["/post/favorites", "infinite", filters.search ?? ""] as const;

/** Qualquer listagem paginada de postagens no cache, favoritos incluídos. */
type PostFeedPage = {
	data: { data: Post[]; pagination: PostCollectionPagination };
};
type PostFeedCache = InfiniteData<PostFeedPage>;

const isPostFeedKey = (queryKey: readonly unknown[]) =>
	typeof queryKey[0] === "string" &&
	queryKey[0].startsWith("/post") &&
	queryKey[1] === "infinite";

/**
 * Aplica um patch na postagem em todo lugar que ela aparece: nos feeds já
 * carregados (de qualquer ordenação ou filtro) e na tela do post. Alternativa
 * seria invalidar as listagens a cada curtida, o que refaria todas as páginas.
 */
export function patchCachedPost(
	queryClient: QueryClient,
	postId: string,
	patch: (post: Post) => Post,
): void {
	queryClient.setQueriesData<PostFeedCache>(
		{ predicate: (query) => isPostFeedKey(query.queryKey) },
		(current) => {
			if (!current) return current;

			return {
				...current,
				pages: current.pages.map((page) => ({
					...page,
					data: {
						...page.data,
						data: page.data.data.map((post) =>
							post.id === postId ? patch(post) : post,
						),
					},
				})),
			};
		},
	);

	queryClient.setQueryData<ShowPost200>(
		getShowPostQueryKey(postId),
		(current) => {
			if (!current) return current;

			return {
				...current,
				data: patch(current.data) as ShowPost200["data"],
			};
		},
	);
}

/**
 * Tira a postagem dos feeds carregados. Usado ao excluir e ao desfavoritar na
 * tela de favoritos, onde o card não faz mais parte da lista.
 */
export function removeCachedPost(
	queryClient: QueryClient,
	postId: string,
	options: { onlyFavorites?: boolean } = {},
): void {
	queryClient.setQueriesData<PostFeedCache>(
		{
			predicate: (query) =>
				isPostFeedKey(query.queryKey) &&
				(!options.onlyFavorites || query.queryKey[0] === "/post/favorites"),
		},
		(current) => {
			if (!current) return current;

			return {
				...current,
				pages: current.pages.map((page) => ({
					...page,
					data: {
						...page.data,
						data: page.data.data.filter((post) => post.id !== postId),
					},
				})),
			};
		},
	);
}

/**
 * Refaz as listagens de postagens já carregadas. Usado depois de publicar: o
 * lugar do post novo depende da ordenação de cada feed, então quem decide onde
 * ele entra é a API, não o cliente.
 */
export function invalidatePostFeeds(queryClient: QueryClient): void {
	queryClient.invalidateQueries({
		predicate: (query) => isPostFeedKey(query.queryKey),
	});
}

/**
 * Rolagem infinita do feed. A API pode repetir um item entre páginas quando
 * vários posts são criados no mesmo segundo, então as páginas são juntadas
 * descartando ids repetidos.
 */
export function usePostFeed(filters: PostFeedFilters) {
	const query = useInfiniteQuery({
		queryKey: getPostFeedQueryKey(filters),
		queryFn: ({ pageParam, signal }) =>
			indexPost(
				{
					page: pageParam,
					per_page: POSTS_PER_PAGE,
					search: filters.search || undefined,
					user_id: filters.userId || undefined,
					sort: filters.sort,
				},
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { current_page, total_pages } = lastPage.data.pagination;

			return current_page < total_pages ? current_page + 1 : undefined;
		},
		enabled: filters.enabled ?? true,
	});

	const posts = useMemo(
		() => dedupeById(query.data?.pages.flatMap((page) => page.data.data) ?? []),
		[query.data],
	);

	return { ...query, posts };
}

/** Mesma rolagem do feed, na lista de favoritos do usuário. */
export function useFavoritePostsFeed(filters: FavoritePostsFilters) {
	const query = useInfiniteQuery({
		queryKey: getFavoritePostsQueryKey(filters),
		queryFn: ({ pageParam, signal }) =>
			indexFavoritePosts(
				{
					page: pageParam,
					per_page: POSTS_PER_PAGE,
					search: filters.search || undefined,
				},
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { current_page, total_pages } = lastPage.data.pagination;

			return current_page < total_pages ? current_page + 1 : undefined;
		},
	});

	const posts = useMemo(
		() => dedupeById(query.data?.pages.flatMap((page) => page.data.data) ?? []),
		[query.data],
	);

	return { ...query, posts };
}
