import { indexCompanyProfile } from "@/api/generated/profile/profile";
import { useGlobalSearchParams } from "@/hooks/filters/use-global-search-params";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Building } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";
import SearchCompanyCard from "./search-company-card";
import SearchResultSkeleton from "./search-result-skeleton";

const PER_PAGE = 10;

export default function SearchCompanyResults() {
	const { t } = useTranslation();

	const { search } = useGlobalSearchParams();

	const sentinelRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["/profile/company", "infinite", search] as const,
			queryFn: ({ pageParam, signal }) =>
				indexCompanyProfile(
					{ page: pageParam, per_page: PER_PAGE, search: search },
					signal,
				),
			initialPageParam: 1,
			getNextPageParam: (lastPage) => {
				const { current_page, total_pages } = lastPage.data.pagination;

				return current_page < total_pages ? current_page + 1 : undefined;
			},
		});

	const companyList = useMemo(
		() => data?.pages.flatMap((page) => page.data.data) ?? [],
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
			<h3 className="text-lg font-medium">{t("search.group.companies")}</h3>
			{isLoading && <SearchResultSkeleton />}
			{!isLoading && companyList.length > 0 && (
				<div className="w-full flex flex-col gap-2">
					{companyList.map((company) => (
						<SearchCompanyCard key={company.id} company={company} />
					))}
					{isFetchingNextPage && <SearchResultSkeleton />}
					<div ref={sentinelRef} className="h-px w-full" />
				</div>
			)}
			{!isLoading && companyList.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Building />
						</EmptyMedia>
						<EmptyTitle>{t("search.empty.companies_title")}</EmptyTitle>
						<EmptyDescription>
							{t("search.empty.companies_description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
