import { useInfiniteQuery } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { indexJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import { useGlobalSearchParams } from "@/hooks/filters/use-global-search-params";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";
import SearchResultSkeleton from "./search-result-skeleton";
import SearchVacancyCard from "./search-vacancy-card";

const PER_PAGE = 10;

export default function SearchVacancyResults() {
	const { t } = useTranslation();

	const { search } = useGlobalSearchParams();

	const sentinelRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["/job-vacancy", "infinite", "search", search] as const,
			queryFn: ({ pageParam, signal }) =>
				indexJobVacancy(
					{ page: pageParam, per_page: PER_PAGE, search: search || undefined },
					signal,
				),
			initialPageParam: 1,
			// A listagem de vagas não retorna paginação, então a última página cheia
			// é o sinal de que ainda pode haver mais resultados
			getNextPageParam: (lastPage, allPages) =>
				lastPage.data.length < PER_PAGE ? undefined : allPages.length + 1,
		});

	const vacancyList = useMemo(
		() => data?.pages.flatMap((page) => page.data) ?? [],
		[data],
	);

	useEffect(() => {
		const sentinel = sentinelRef.current;

		if (!sentinel || !hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) fetchNextPage();
		});

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<div className="w-full flex flex-col gap-2">
			<h3 className="text-lg font-medium">{t("search.group.vacancies")}</h3>
			{isLoading && <SearchResultSkeleton />}
			{!isLoading && vacancyList.length > 0 && (
				<div className="w-full flex flex-col gap-2">
					{vacancyList.map((vacancy) => (
						<SearchVacancyCard key={vacancy.id} vacancy={vacancy} />
					))}
					{isFetchingNextPage && <SearchResultSkeleton />}
					<div ref={sentinelRef} className="h-px w-full" />
				</div>
			)}
			{!isLoading && vacancyList.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Briefcase />
						</EmptyMedia>
						<EmptyTitle>{t("search.empty.vacancies_title")}</EmptyTitle>
						<EmptyDescription>
							{t("search.empty.vacancies_description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
