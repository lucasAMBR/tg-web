import { indexClientProfiles } from "@/api/generated/profile/profile";
import { useGlobalSearchParams } from "@/hooks/filters/use-global-search-params";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";
import SearchClientCard from "./search-client-card";
import SearchResultSkeleton from "./search-result-skeleton";

const PER_PAGE = 10;

export default function SearchClientResults() {
	const { t } = useTranslation();

	const { search } = useGlobalSearchParams();

	const sentinelRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["/profile/client", "infinite", search] as const,
			queryFn: ({ pageParam, signal }) =>
				indexClientProfiles(
					{ page: pageParam, per_page: PER_PAGE, search: search },
					signal,
				),
			initialPageParam: 1,
			getNextPageParam: (lastPage) => {
				const { current_page, total_pages } = lastPage.data.pagination;

				return current_page < total_pages ? current_page + 1 : undefined;
			},
		});

	const clientList = useMemo(
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
			<h3 className="text-lg font-medium">{t("search.group.clients")}</h3>
			{isLoading && <SearchResultSkeleton />}
			{!isLoading && clientList.length > 0 && (
				<div className="w-full flex flex-col gap-2">
					{clientList.map((client) => (
						<SearchClientCard key={client.id} client={client} />
					))}
					{isFetchingNextPage && <SearchResultSkeleton />}
					<div ref={sentinelRef} className="h-px w-full" />
				</div>
			)}
			{!isLoading && clientList.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Users />
						</EmptyMedia>
						<EmptyTitle>{t("search.empty.clients_title")}</EmptyTitle>
						<EmptyDescription>
							{t("search.empty.clients_description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
