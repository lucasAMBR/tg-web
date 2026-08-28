import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { indexJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/utils/formatter";
import SearchResultSkeleton from "../search/search-result-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";

const PER_PAGE = 50;

interface MyVacanciesListProps {
	search?: string;
}

export default function MyVacanciesList({ search }: MyVacanciesListProps) {
	const { t, i18n } = useTranslation();

	const { user } = useAuthStore();

	const currencyLocale = i18n.language === "en" ? "en" : "pt";

	const sentinelRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["/job-vacancy", "infinite", search] as const,
			queryFn: ({ pageParam, signal }) =>
				indexJobVacancy(
					{
						page: pageParam,
						per_page: PER_PAGE,
						search: search || undefined,
						company_profile_id: user?.company_profile?.id,
					},
					signal,
				),
			initialPageParam: 1,
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
			{isLoading && <SearchResultSkeleton />}
			{!isLoading && vacancyList.length > 0 && (
				<div className="w-full flex flex-col gap-2">
					{vacancyList.map((vacancy) => (
						<Link
							key={String(vacancy.id)}
							to="/my-vacancies/$id"
							params={{ id: String(vacancy.id) }}
						>
							<Card className="w-full p-4 flex-row items-center gap-4 transition-colors hover:bg-accent/50">
								<Avatar className="size-14">
									{vacancy.profile?.profile_pic && (
										<AvatarImage
											src={vacancy.profile.profile_pic}
											alt={vacancy.profile.name}
											className="object-cover"
										/>
									)}
									<AvatarFallback className="bg-primary text-primary-foreground">
										<Briefcase className="size-7" />
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex flex-1 flex-col gap-2">
									<span className="flex flex-row items-center gap-4 text-md font-semibold">
										<p className="truncate">{vacancy.title}</p>
										<Badge variant={"destructive"}>
											{t("my_vacancies.candidates")}:{" "}
											{vacancy.dev_profiles_count ?? 0}
										</Badge>
									</span>
									<div className="flex flex-row flex-wrap gap-2">
										<Badge
											variant={
												vacancy.status === "open_inscriptions"
													? "default"
													: vacancy.status === "canceled"
														? "destructive"
														: "outline"
											}
											className={
												vacancy.status === "open_inscriptions"
													? "bg-emerald-500 text-white"
													: undefined
											}
										>
											{t(`enum.job_vacancy_status.${vacancy.status}`)}
										</Badge>
										{vacancy.status !== "open_inscriptions" && (
											<Badge variant={"outline"}>
												{t(
													`enum.selection_process_stage.${vacancy.process_step}`,
												)}
											</Badge>
										)}
										<Badge variant={"destructive"}>
											{t(`enum.contract_type.${vacancy.contract_type}`)}
										</Badge>
										<Badge variant={"secondary"}>
											{t(`enum.seniority_level.${vacancy.seniority_level}`)}
										</Badge>
										<Badge variant={"default"}>
											{t(`enum.employment_type.${vacancy.employment_type}`)}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										{t("my_vacancies.estimated_salary")}:{" "}
										{formatCurrency(vacancy.estimated_salary, {
											locale: currencyLocale,
										})}
									</p>
								</div>
							</Card>
						</Link>
					))}
					{isFetchingNextPage && <SearchResultSkeleton count={1} />}
					<div ref={sentinelRef} className="h-px w-full" />
				</div>
			)}
			{!isLoading && vacancyList.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Briefcase />
						</EmptyMedia>
						<EmptyTitle>{t("my_vacancies.empty_title")}</EmptyTitle>
						<EmptyDescription>
							{t("my_vacancies.empty_description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
