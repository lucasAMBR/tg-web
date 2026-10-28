import {
	type InfiniteData,
	type QueryClient,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { indexFollowers, indexFollowing } from "@/api/generated/follow/follow";
import type { UserResource } from "@/api/generated/models";
import {
	isPopularUsersKey,
	type PopularUsersCache,
} from "@/hooks/use-popular-users";
import { isPostParticipantsKey } from "@/hooks/use-post-participants";
import { useAuthStore } from "@/stores/auth-store";
import {
	FOLLOWS_PER_PAGE,
	type FollowListKind,
	optimisticToggle,
} from "@/types/follow";
import { dedupeBy } from "@/utils/dedupe-by-id";

export const getFollowListQueryKey = (userId: string, kind: FollowListKind) =>
	["/follow", userId, kind, "infinite"] as const;

/**
 * Listas cujos itens só guardam se o usuário logado segue a pessoa: seguidores,
 * seguidos e participantes da conversa de um post.
 */
type FollowStateListCache = InfiniteData<{
	data: { user: { id: string }; is_followed: boolean }[];
}>;

/** Exibição de perfil no cache (`GET /profile/{tipo}/{id}`), de qualquer tipo. */
type ProfileShowCache = { data: { user_id: string; user?: UserResource } };

const isFollowListKey = (queryKey: readonly unknown[]) =>
	queryKey[0] === "/follow" && queryKey[3] === "infinite";

const isProfileShowKey = (queryKey: readonly unknown[]) =>
	typeof queryKey[0] === "string" &&
	/^\/profile\/(dev|company|client)\/[^/]+$/.test(queryKey[0]);

function patchCachedProfileUser(
	queryClient: QueryClient,
	userId: string,
	patch: (user: UserResource) => UserResource,
): void {
	queryClient.setQueriesData<ProfileShowCache>(
		{ predicate: (query) => isProfileShowKey(query.queryKey) },
		(current) => {
			if (current?.data?.user_id !== userId || !current.data.user) {
				return current;
			}

			return {
				...current,
				data: { ...current.data, user: patch(current.data.user) },
			};
		},
	);
}

/**
 * Aplica o estado de seguir de um usuário em todo lugar que ele aparece: no
 * perfil dele, se estiver no cache, nas listas de seguidores e de seguidos, nos
 * participantes das conversas e no ranking de populares já carregados — o id
 * do usuário é a chave. Sem
 * `followers_count`, o perfil e o ranking somam ou subtraem 1 a partir do
 * estado que tinham, que é o caso do clique otimista e do clique vindo de uma
 * lista, que não traz o total.
 */
export function patchCachedFollowState(
	queryClient: QueryClient,
	userId: string,
	next: { is_followed: boolean; followers_count?: number },
): void {
	patchCachedProfileUser(queryClient, userId, (user) => {
		const stats = {
			is_followed: user.is_followed ?? false,
			followers_count: user.followers_count ?? 0,
		};

		const toggled =
			stats.is_followed === next.is_followed ? stats : optimisticToggle(stats);

		return {
			...user,
			is_followed: next.is_followed,
			followers_count: next.followers_count ?? toggled.followers_count,
		};
	});

	queryClient.setQueriesData<FollowStateListCache>(
		{
			predicate: (query) =>
				isFollowListKey(query.queryKey) ||
				isPostParticipantsKey(query.queryKey),
		},
		(current) => {
			if (!current) return current;

			return {
				...current,
				pages: current.pages.map((page) => ({
					...page,
					data: page.data.map((item) =>
						item.user.id === userId
							? { ...item, is_followed: next.is_followed }
							: item,
					),
				})),
			};
		},
	);

	// No ranking os seguidores fazem parte da pontuação, então ela acompanha o
	// total. A lista não é reordenada: a posição nova aparece quando ela for
	// recarregada
	queryClient.setQueriesData<PopularUsersCache>(
		{ predicate: (query) => isPopularUsersKey(query.queryKey) },
		(current) => {
			if (!current) return current;

			return {
				...current,
				pages: current.pages.map((page) => ({
					...page,
					data: page.data.map((item) => {
						if (item.user.id !== userId) return item;

						const toggled =
							item.is_followed === next.is_followed
								? item
								: optimisticToggle(item);
						const followersCount =
							next.followers_count ?? toggled.followers_count;

						return {
							...item,
							is_followed: next.is_followed,
							followers_count: followersCount,
							popularity_score:
								item.popularity_score + followersCount - item.followers_count,
						};
					}),
				})),
			};
		},
	);
}

/**
 * Soma `delta` ao `following_count` do usuário logado: no `/auth/profile`
 * guardado no store, que alimenta o próprio perfil, e na exibição do perfil
 * dele, se estiver no cache. Assim o "seguindo" fica certo sem recarregar.
 */
export function adjustOwnFollowingCount(
	queryClient: QueryClient,
	delta: number,
): void {
	const { user, setUser } = useAuthStore.getState();

	if (!user) return;

	setUser({
		...user,
		following_count: Math.max((user.following_count ?? 0) + delta, 0),
	});

	patchCachedProfileUser(queryClient, user.id, (profileUser) => ({
		...profileUser,
		following_count: Math.max((profileUser.following_count ?? 0) + delta, 0),
	}));
}

/** Descarta as listas de seguidores e de seguidos de um usuário. */
export function removeCachedFollowLists(
	queryClient: QueryClient,
	userId: string,
): void {
	queryClient.removeQueries({ queryKey: ["/follow", userId] });
}

/**
 * Rolagem infinita das listas de seguidores e de seguidos. A API pode repetir
 * um usuário entre páginas quando vários follows acontecem no mesmo segundo,
 * então as páginas são juntadas descartando ids repetidos.
 *
 * Enquanto a lista está aberta ela não é refeita: quem você deixa de seguir
 * continua nela, com o botão "Seguir", para dar para desfazer. Quem abre a
 * lista descarta o cache ao fechar (`removeCachedFollowLists`), e aí ela
 * recomeça da página 1.
 */
export function useFollowList(
	userId: string,
	kind: FollowListKind,
	options: { enabled?: boolean } = {},
) {
	const query = useInfiniteQuery({
		queryKey: getFollowListQueryKey(userId, kind),
		// As duas rotas devolvem a mesma coleção, só com `message` diferente, e
		// o envelope é descartado aqui para as páginas terem um tipo só.
		queryFn: async ({ pageParam, signal }) => {
			const params = { page: pageParam, per_page: FOLLOWS_PER_PAGE };

			const response =
				kind === "followers"
					? await indexFollowers(userId, params, signal)
					: await indexFollowing(userId, params, signal);

			return response.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { current_page, total_pages } = lastPage.pagination;

			return current_page < total_pages ? current_page + 1 : undefined;
		},
		staleTime: Number.POSITIVE_INFINITY,
		enabled: options.enabled ?? true,
	});

	const items = useMemo(
		() =>
			dedupeBy(
				query.data?.pages.flatMap((page) => page.data) ?? [],
				(item) => item.user.id,
			),
		[query.data],
	);

	return { ...query, items };
}
