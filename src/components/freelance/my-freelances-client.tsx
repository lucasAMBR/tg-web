import { useNavigate } from "@tanstack/react-router";
import { FileText, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FreelanceJobVacancyStatusEnum } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyFreelancesParams } from "@/hooks/filters/use-my-freelances-params";
import useDebounce from "@/hooks/use-debounce";
import { useMyFreelanceVacancies } from "@/hooks/use-freelance-lists";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import { cn } from "@/lib/utils";
import {
	FreelanceStatus,
	type FreelanceVacancy,
	formatFreelanceMoney,
	getFreelanceLocale,
} from "@/types/freelance";
import FreelanceInfiniteList from "./freelance-infinite-list";
import FreelanceVacancyCard from "./freelance-vacancy-card";
import FreelanceVacancyForm from "./freelance-vacancy-form";
import FreelanceVacancyOwnerMenu from "./freelance-vacancy-owner-menu";

const TABS = ["all", "open", "in_progress", "completed"] as const;

type ClientTab = (typeof TABS)[number];

/** Orçamentos recebidos no freela aberto, ou o dev e o valor do contrato. */
function OwnerVacancySummary({ vacancy }: { vacancy: FreelanceVacancy }) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	if (vacancy.contract) {
		return (
			<p className="text-sm">
				<span className="text-muted-foreground">
					{t("freelance.contract.dev")}:{" "}
				</span>
				<span className="font-medium">
					{vacancy.contract.dev_profile?.name ??
						t("freelance.proposals.dev_unavailable")}
				</span>
				{" · "}
				<span className="font-medium">
					{formatFreelanceMoney(vacancy.contract.total_price, locale)}
				</span>
			</p>
		);
	}

	if (vacancy.status !== FreelanceStatus.open) return null;

	const count = vacancy.proposals_count ?? 0;

	return (
		<Badge
			variant={count > 0 ? "default" : "outline"}
			className={cn(
				"self-start",
				count > 0 && "bg-primary text-primary-foreground",
			)}
		>
			<FileText className="size-3" />
			{count > 0
				? t("freelance.my.proposals_count", { count })
				: t("freelance.my.no_proposals")}
		</Badge>
	);
}

/** "Meus Freelances" do cliente: os freelas que ele publicou, por status. */
export default function MyFreelancesClient() {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const { canCreateVacancy } = useFreelancePermissions();

	const { tab, search, setFilterParams } = useMyFreelancesParams();

	const currentTab: ClientTab = TABS.includes(tab as ClientTab)
		? (tab as ClientTab)
		: "all";

	const debouncedSearch = useDebounce(search, 500);

	const [creationIsOpen, setCreationIsOpen] = useState(false);

	const list = useMyFreelanceVacancies({
		status:
			currentTab === "all"
				? undefined
				: (currentTab as FreelanceJobVacancyStatusEnum),
		search: debouncedSearch,
	});

	const isUnfilteredEmpty = currentTab === "all" && !debouncedSearch.trim();

	const publishButton = canCreateVacancy && (
		<Button onClick={() => setCreationIsOpen(true)}>
			<Plus /> {t("freelance.my.publish")}
		</Button>
	);

	return (
		<div className="flex flex-col gap-4">
			{canCreateVacancy && (
				<Card className="flex-row items-center justify-between p-4">
					<h2 className="text-lg font-bold">
						{creationIsOpen
							? t("freelance.my.publish_title")
							: t("freelance.my.title")}
					</h2>
					<Button
						variant={creationIsOpen ? "outline" : "default"}
						onClick={() => setCreationIsOpen(!creationIsOpen)}
					>
						<Plus
							className={
								creationIsOpen
									? "rotate-45 transition-all duration-75"
									: "transition-all duration-75"
							}
						/>
						{creationIsOpen ? t("general.cancel") : t("freelance.my.publish")}
					</Button>
				</Card>
			)}

			{creationIsOpen ? (
				<Card className="p-6">
					<FreelanceVacancyForm
						// O freela recém-publicado abre no detalhe, onde os orçamentos e os
						// devs recomendados aparecem
						onSuccess={(vacancy) =>
							navigate({ to: "/freelances/$id", params: { id: vacancy.id } })
						}
						onCancel={() => setCreationIsOpen(false)}
					/>
				</Card>
			) : (
				<>
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<Tabs
							value={currentTab}
							onValueChange={(value) => setFilterParams({ tab: value })}
						>
							<TabsList variant={"line"}>
								{TABS.map((value) => (
									<TabsTrigger
										key={value}
										value={value}
										className="cursor-pointer"
									>
										{t(`freelance.my.tabs.${value}`)}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
						<div className="relative md:w-72">
							<Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={search}
								onChange={(event) =>
									setFilterParams({ search: event.target.value })
								}
								placeholder={t("freelance.search_placeholder")}
								aria-label={t("freelance.search_placeholder")}
								className="bg-background pl-9"
							/>
						</div>
					</div>

					{list.total !== undefined && (
						<p className="text-sm text-muted-foreground">
							{t("freelance.count", { count: list.total })}
						</p>
					)}

					<FreelanceInfiniteList
						items={list.vacancies}
						getKey={(vacancy) => vacancy.id}
						renderItem={(vacancy) => (
							<FreelanceVacancyCard
								vacancy={vacancy}
								to="/freelances/$id"
								showStatus
								actions={<FreelanceVacancyOwnerMenu vacancy={vacancy} />}
							>
								<OwnerVacancySummary vacancy={vacancy} />
							</FreelanceVacancyCard>
						)}
						isLoading={list.isLoading}
						isError={list.isError}
						onRetry={() => list.refetch()}
						hasNextPage={list.hasNextPage}
						isFetchingNextPage={list.isFetchingNextPage}
						fetchNextPage={list.fetchNextPage}
						emptyTitle={
							isUnfilteredEmpty
								? t("freelance.my.client_empty_title")
								: t("freelance.my.status_empty_title")
						}
						emptyDescription={
							isUnfilteredEmpty
								? t("freelance.my.client_empty_description")
								: undefined
						}
						emptyAction={isUnfilteredEmpty ? publishButton : undefined}
					/>
				</>
			)}
		</div>
	);
}
