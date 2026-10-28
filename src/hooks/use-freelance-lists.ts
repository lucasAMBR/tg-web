import {
	type InfiniteData,
	type QueryClient,
	type QueryKey,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import {
	getShowFreelanceJobVacancyQueryKey,
	indexFreelanceJobVacancy,
	indexMyFreelanceContracts,
	indexMyFreelanceJobVacancies,
} from "@/api/generated/freelance-job-vacancy/freelance-job-vacancy";
import {
	indexFreelanceProposals,
	indexMyFreelanceProposals,
} from "@/api/generated/freelance-proposal/freelance-proposal";
import type {
	FreelanceJobTypeEnum,
	FreelanceJobVacancyStatusEnum,
	FreelanceProposalStatusEnum,
	SeniorityLevelEnum,
	ShowFreelanceJobVacancy200,
} from "@/api/generated/models";
import {
	getRecommendDevsForFreelanceJobVacancyQueryKey,
	getRecommendFreelanceJobVacanciesForDevQueryKey,
	getRecommendProposalsForFreelanceJobVacancyQueryKey,
} from "@/api/generated/recommendation/recommendation";
import {
	dedupeById,
	FREELANCE_PER_PAGE,
	type FreelanceProposal,
	type FreelanceVacancy,
	getNextFreelancePage,
} from "@/types/freelance";

export interface FreelanceSearchFilters {
	search?: string;
	jobType?: string;
	seniorityLevel?: string;
	/** Só para dev: os freelas para os quais ele foi convidado. */
	invited?: boolean;
	enabled?: boolean;
}

export interface MyFreelanceVacanciesFilters {
	/** Sem status: todos. Cada aba é uma lista separada no cache. */
	status?: FreelanceJobVacancyStatusEnum;
	search?: string;
}

export interface MyFreelanceContractsFilters {
	status?: "in_progress" | "completed";
	search?: string;
}

export interface FreelanceProposalsFilters {
	status?: FreelanceProposalStatusEnum;
}

export const getFreelanceSearchQueryKey = (filters: FreelanceSearchFilters) =>
	[
		"/freelance-job-vacancy",
		"infinite",
		filters.search ?? "",
		filters.jobType ?? "",
		filters.seniorityLevel ?? "",
		filters.invited ?? false,
	] as const;

export const getMyFreelanceVacanciesQueryKey = (
	filters: MyFreelanceVacanciesFilters,
) =>
	[
		"/freelance-job-vacancy/my-vacancies",
		"infinite",
		filters.status ?? "",
		filters.search ?? "",
	] as const;

export const getMyFreelanceContractsQueryKey = (
	filters: MyFreelanceContractsFilters,
) =>
	[
		"/freelance-job-vacancy/my-contracts",
		"infinite",
		filters.status ?? "",
		filters.search ?? "",
	] as const;

export const getMyFreelanceProposalsQueryKey = (
	filters: FreelanceProposalsFilters,
) => ["/freelance-proposal", "infinite", filters.status ?? ""] as const;

export const getFreelanceVacancyProposalsQueryKey = (
	vacancyId: string,
	filters: FreelanceProposalsFilters,
) =>
	[
		`/freelance-job-vacancy/${vacancyId}/proposals`,
		"infinite",
		filters.status ?? "",
	] as const;

/** Listagens paginadas de freelas e de orçamentos (o feed fica de fora). */
function isFreelanceListKey(queryKey: QueryKey): boolean {
	const [path, mode] = queryKey;

	if (mode !== "infinite" || typeof path !== "string") return false;

	if (path.endsWith("/feed")) return false;

	return (
		path.startsWith("/freelance-job-vacancy") || path === "/freelance-proposal"
	);
}

/**
 * Refaz tudo que mostra o freela depois de uma ação que muda o estado dele: as
 * listagens (a da pesquisa, "Meus Freelances" e os orçamentos), o detalhe, as
 * recomendações e a busca global, que também traz freelas.
 */
export function invalidateFreelanceData(
	queryClient: QueryClient,
	vacancyId?: string,
): void {
	queryClient.invalidateQueries({
		predicate: ({ queryKey }) => isFreelanceListKey(queryKey),
	});
	queryClient.invalidateQueries({ queryKey: ["/search"] });
	queryClient.invalidateQueries({
		queryKey: getRecommendFreelanceJobVacanciesForDevQueryKey(),
	});

	if (!vacancyId) return;

	queryClient.invalidateQueries({
		queryKey: getShowFreelanceJobVacancyQueryKey(vacancyId),
	});
	queryClient.invalidateQueries({
		queryKey: getRecommendProposalsForFreelanceJobVacancyQueryKey(vacancyId),
	});
	queryClient.invalidateQueries({
		queryKey: getRecommendDevsForFreelanceJobVacancyQueryKey(vacancyId),
	});
}

/** Freela removido: sai do detalhe e das recomendações sem refazer nada. */
export function removeCachedFreelanceVacancy(
	queryClient: QueryClient,
	vacancyId: string,
): void {
	queryClient.removeQueries({
		queryKey: getShowFreelanceJobVacancyQueryKey(vacancyId),
	});
	queryClient.removeQueries({
		queryKey: getRecommendProposalsForFreelanceJobVacancyQueryKey(vacancyId),
	});
	queryClient.removeQueries({
		queryKey: getRecommendDevsForFreelanceJobVacancyQueryKey(vacancyId),
	});
}

/**
 * Troca o freela no detalhe já carregado, com a resposta da própria ação. As
 * listagens são refeitas por `invalidateFreelanceData`.
 */
export function setCachedFreelanceVacancy(
	queryClient: QueryClient,
	vacancy: FreelanceVacancy,
): void {
	queryClient.setQueryData<ShowFreelanceJobVacancy200>(
		getShowFreelanceJobVacancyQueryKey(vacancy.id),
		(current) =>
			current
				? {
						...current,
						data: {
							...current.data,
							...vacancy,
						} as ShowFreelanceJobVacancy200["data"],
					}
				: current,
	);
}

/** Atualiza o `my_proposal` do dev no detalhe, sem esperar o refetch. */
export function setCachedMyProposal(
	queryClient: QueryClient,
	vacancyId: string,
	proposal: FreelanceProposal | null,
): void {
	queryClient.setQueryData<ShowFreelanceJobVacancy200>(
		getShowFreelanceJobVacancyQueryKey(vacancyId),
		(current) =>
			current
				? {
						...current,
						data: { ...current.data, my_proposal: proposal },
					}
				: current,
	);
}

type PaginatedPage<T> = {
	data: {
		data: T[];
		pagination: { current_page: number; total_pages: number; total: number };
	};
};

/** Junta as páginas da rolagem infinita, descartando ids repetidos. */
function useFlattenedPages<T extends { id: string }>(
	data: InfiniteData<PaginatedPage<T>> | undefined,
) {
	return useMemo(
		() => dedupeById(data?.pages.flatMap((page) => page.data.data) ?? []),
		[data],
	);
}

/** Freelas abertos: a aba da pesquisa e os convites do dev. */
export function useFreelanceSearch(filters: FreelanceSearchFilters) {
	const query = useInfiniteQuery({
		queryKey: getFreelanceSearchQueryKey(filters),
		queryFn: ({ pageParam, signal }) =>
			indexFreelanceJobVacancy(
				{
					page: pageParam,
					per_page: FREELANCE_PER_PAGE,
					search: filters.search?.trim() || undefined,
					job_type: (filters.jobType || undefined) as
						| FreelanceJobTypeEnum
						| undefined,
					seniority_level: (filters.seniorityLevel || undefined) as
						| SeniorityLevelEnum
						| undefined,
					invited: filters.invited || undefined,
				},
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: getNextFreelancePage,
		enabled: filters.enabled ?? true,
	});

	const vacancies = useFlattenedPages(query.data);

	return {
		...query,
		vacancies,
		total: query.data?.pages[0]?.data.pagination.total,
	};
}

/** "Meus Freelances" do cliente, em qualquer status. */
export function useMyFreelanceVacancies(filters: MyFreelanceVacanciesFilters) {
	const query = useInfiniteQuery({
		queryKey: getMyFreelanceVacanciesQueryKey(filters),
		queryFn: ({ pageParam, signal }) =>
			indexMyFreelanceJobVacancies(
				{
					page: pageParam,
					per_page: FREELANCE_PER_PAGE,
					status: filters.status,
					search: filters.search?.trim() || undefined,
				},
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: getNextFreelancePage,
	});

	const vacancies = useFlattenedPages(query.data);

	return {
		...query,
		vacancies,
		total: query.data?.pages[0]?.data.pagination.total,
	};
}

/** Contratos do dev: os em andamento vêm primeiro, depois os concluídos. */
export function useMyFreelanceContracts(filters: MyFreelanceContractsFilters) {
	const query = useInfiniteQuery({
		queryKey: getMyFreelanceContractsQueryKey(filters),
		queryFn: ({ pageParam, signal }) =>
			indexMyFreelanceContracts(
				{
					page: pageParam,
					per_page: FREELANCE_PER_PAGE,
					status: filters.status,
					search: filters.search?.trim() || undefined,
				},
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: getNextFreelancePage,
	});

	const vacancies = useFlattenedPages(query.data);

	return {
		...query,
		vacancies,
		total: query.data?.pages[0]?.data.pagination.total,
	};
}

/** Orçamentos enviados pelo dev, cada um com o freela. */
export function useMyFreelanceProposals(filters: FreelanceProposalsFilters) {
	const query = useInfiniteQuery({
		queryKey: getMyFreelanceProposalsQueryKey(filters),
		queryFn: ({ pageParam, signal }) =>
			indexMyFreelanceProposals(
				{
					page: pageParam,
					per_page: FREELANCE_PER_PAGE,
					status: filters.status,
				},
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: getNextFreelancePage,
	});

	const proposals = useFlattenedPages(query.data);

	return {
		...query,
		proposals,
		total: query.data?.pages[0]?.data.pagination.total,
	};
}

/** Todos os orçamentos de um freela, para o cliente dono. */
export function useFreelanceVacancyProposals(
	vacancyId: string,
	filters: FreelanceProposalsFilters & { enabled?: boolean },
) {
	const query = useInfiniteQuery({
		queryKey: getFreelanceVacancyProposalsQueryKey(vacancyId, filters),
		queryFn: ({ pageParam, signal }) =>
			indexFreelanceProposals(
				vacancyId,
				{
					page: pageParam,
					per_page: FREELANCE_PER_PAGE,
					status: filters.status,
				},
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: getNextFreelancePage,
		enabled: filters.enabled ?? true,
	});

	const proposals = useFlattenedPages(query.data);

	return {
		...query,
		proposals,
		total: query.data?.pages[0]?.data.pagination.total,
	};
}
