import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { PopularUserCollection } from "@/api/generated/models";
import { indexPopularUsers } from "@/api/generated/user/user";
import type { PopularUser, RankingProfileType } from "@/types/follow";
import { dedupeBy } from "@/utils/dedupe-by-id";

export interface PopularUsersFilters {
	profileType?: RankingProfileType;
	perPage: number;
}

/**
 * Cada filtro é uma lista separada no cache. O `per_page` entra na chave porque
 * a posição de cada item depende dele.
 */
export const getPopularUsersQueryKey = (filters: PopularUsersFilters) =>
	[
		"/user/popular",
		"infinite",
		filters.profileType ?? "",
		filters.perPage,
	] as const;

export type PopularUsersCache = InfiniteData<PopularUserCollection>;

export const isPopularUsersKey = (queryKey: readonly unknown[]) =>
	queryKey[0] === "/user/popular" && queryKey[1] === "infinite";

export interface RankedPopularUser {
	item: PopularUser;
	/** A API não manda a posição: ela sai da página e do índice dentro dela. */
	position: number;
}

/**
 * Ranking dos usuários mais populares, do mais para o menos. A pontuação muda
 * enquanto as pessoas interagem, então um usuário pode trocar de página entre
 * uma requisição e outra: as páginas são juntadas descartando ids repetidos.
 */
export function usePopularUsers(
	filters: PopularUsersFilters,
	options: { enabled?: boolean } = {},
) {
	const query = useInfiniteQuery({
		queryKey: getPopularUsersQueryKey(filters),
		// O envelope é descartado para as páginas guardarem só a coleção
		queryFn: async ({ pageParam, signal }) => {
			const response = await indexPopularUsers(
				{
					page: pageParam,
					per_page: filters.perPage,
					profile_type: filters.profileType,
				},
				signal,
			);

			return response.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { current_page, total_pages } = lastPage.pagination;

			return current_page < total_pages ? current_page + 1 : undefined;
		},
		enabled: options.enabled ?? true,
	});

	const users = useMemo<RankedPopularUser[]>(
		() =>
			dedupeBy(
				query.data?.pages.flatMap((page) =>
					page.data.map((item, index) => ({
						item,
						position:
							(page.pagination.current_page - 1) * page.pagination.per_page +
							index +
							1,
					})),
				) ?? [],
				({ item }) => item.user.id,
			),
		[query.data],
	);

	return { ...query, users };
}
