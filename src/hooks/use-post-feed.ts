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

/** `following` traz as postagens de quem o usuário segue, mais as dele mesmo. */
export type PostFeedSource = NonNullable<IndexPostParams["feed"]>;

export const POST_FEED_SORTS = [
	"popular",
	"recent",
] as const satisfies readonly PostFeedSort[];
export const POST_FEED_SOURCES = [
	"all",
	"following",
] as const satisfies readonly PostFeedSource[];

export interface PostFeedFilters {
	/** `popular` ordena por engajamento; `recent`, por data. */
	sort?: PostFeedSort;
	/** Aba do feed: todas as postagens ou só as de quem o usuário segue. */
	feed?: PostFeedSource;
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
		filters.feed ?? "all",
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
 * Coloca a postagem recém-publicada no topo das listas "recentes" que ela
 * integra: as do feed (abas "Todos" e "Seguindo", que inclui as do próprio
 * usuário) e a do perfil do autor. As listas "populares" ficam como estão — o
 * post aparece na posição dele quando a lista for recarregada — e as com busca
 * também, porque o texto pode não casar com o termo buscado.
 */
export function prependCachedPost(queryClient: QueryClient, post: Post): void {
	queryClient.setQueriesData<PostFeedCache>(
		{
			predicate: ({ queryKey }) => {
				if (queryKey[0] !== "/post" || queryKey[1] !== "infinite") return false;

				const [, , sort, search, userId] = queryKey;

				return (
					sort === "recent" &&
					search === "" &&
					(userId === "" || userId === post.user_id)
				);
			},
		},
		(current) => {
			if (!current?.pages.length) return current;

			const [first, ...rest] = current.pages;

			return {
				...current,
				pages: [
					{
						...first,
						data: {
							...first.data,
							data: [post, ...first.data.data],
							pagination: {
								...first.data.pagination,
								total: first.data.pagination.total + 1,
							},
						},
					},
					...rest,
				],
			};
		},
	);
}

/**
 * Seguir ou deixar de seguir alguém deixa a aba "Seguindo" desatualizada. O
 * reset descarta as páginas carregadas, então ela recomeça da página 1 na
 * próxima vez que for aberta (ou na hora, se estiver na tela).
 */
export function resetFollowingFeeds(queryClient: QueryClient): void {
	queryClient.resetQueries({
		predicate: ({ queryKey }) =>
			queryKey[0] === "/post" &&
			queryKey[1] === "infinite" &&
			queryKey[5] === "following",
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
					feed: filters.feed,
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
