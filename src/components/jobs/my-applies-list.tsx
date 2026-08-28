import { useInfiniteQuery } from "@tanstack/react-query";
import { Briefcase, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { indexMyApplies } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import SearchResultSkeleton from "../search/search-result-skeleton";
import MyApplyCard from "./my-apply-card";

const PER_PAGE = 10;

export default function MyAppliesList() {
	const { t } = useTranslation();

	const [searchTerm, setSearchTerm] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");

	const sentinelRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["/dev-vacancy/my-applies", "infinite", appliedSearch] as const,
			queryFn: ({ pageParam, signal }) =>
				indexMyApplies(
					{
						page: pageParam,
						per_page: PER_PAGE,
						search: appliedSearch || undefined,
					},
					signal,
				),
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) =>
				allPages.length < lastPage.data.pagination.total_pages
					? allPages.length + 1
					: undefined,
		});

	const applyList = useMemo(
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

	const handleSearch = (event: React.FormEvent) => {
		event.preventDefault();

		setAppliedSearch(searchTerm.trim());
	};

	return (
		<div className="w-full flex flex-col gap-4">
			<form className="flex flex-row gap-2" onSubmit={handleSearch}>
				<Input
					placeholder={t("my_applies.search_placeholder")}
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
				/>
				<Button type="submit" variant={"secondary"}>
					<Search /> {t("general.search")}
				</Button>
			</form>

			{isLoading && <SearchResultSkeleton />}

			{!isLoading && applyList.length > 0 && (
				<div className="w-full flex flex-col gap-2">
					{applyList.map((apply) => (
						<MyApplyCard key={apply.id} apply={apply} />
					))}
					{isFetchingNextPage && <SearchResultSkeleton />}
					<div ref={sentinelRef} className="h-px w-full" />
				</div>
			)}

			{!isLoading && applyList.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Briefcase />
						</EmptyMedia>
						<EmptyTitle>{t("my_applies.empty_title")}</EmptyTitle>
						<EmptyDescription>
							{t("my_applies.empty_description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
