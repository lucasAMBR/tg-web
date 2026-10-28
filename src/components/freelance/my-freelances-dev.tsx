import { Link } from "@tanstack/react-router";
import {
	FileText,
	Handshake,
	MailOpen,
	Newspaper,
	Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FreelanceProposalStatusEnum } from "@/api/generated/models";
import { useRecommendFreelanceJobVacanciesForDev } from "@/api/generated/recommendation/recommendation";
import SearchResultSkeleton from "@/components/search/search-result-skeleton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyFreelancesParams } from "@/hooks/filters/use-my-freelances-params";
import {
	useFreelanceSearch,
	useMyFreelanceContracts,
	useMyFreelanceProposals,
} from "@/hooks/use-freelance-lists";
import {
	FREELANCE_RECOMMENDATION_LIMIT,
	type FreelanceProposal,
	FreelanceProposalStatus,
	FreelanceStatus,
	type FreelanceVacancy,
	getFreelanceLocale,
	proposalPriceLabel,
	toPercentage,
} from "@/types/freelance";
import { formatDateTime } from "@/utils/formatter";
import {
	freelanceErrorMessageKey,
	isFreelanceAnalysisPending,
} from "@/utils/freelance-error";
import FreelanceAnalysisState from "./freelance-analysis-state";
import FreelanceInfiniteList from "./freelance-infinite-list";
import { FreelanceProposalStatusBadge } from "./freelance-status-badge";
import FreelanceVacancyCard from "./freelance-vacancy-card";

const TABS = ["contracts", "proposals", "invitations", "recommended"] as const;

type DevTab = (typeof TABS)[number];

const ALL = "all";

function FeedLink({ vacancyId }: { vacancyId: string }) {
	const { t } = useTranslation();

	return (
		<Link
			to="/freelances/$id/feed"
			params={{ id: vacancyId }}
			className={buttonVariants({ variant: "default", size: "sm" })}
		>
			<Newspaper className="size-4" />
			{t("freelance.details.open_feed")}
		</Link>
	);
}

function StatusFilter({
	value,
	options,
	onChange,
}: {
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
}) {
	const { t } = useTranslation();

	return (
		<Select
			value={value || ALL}
			onValueChange={(next) => onChange(next === ALL ? "" : next)}
		>
			<SelectTrigger
				className="w-full sm:w-56"
				aria-label={t("freelance.filter_status")}
			>
				<SelectValue placeholder={t("freelance.filter_status")} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ALL}>{t("freelance.all_statuses")}</SelectItem>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

/** Contratos: os em andamento primeiro, depois os concluídos. */
function ContractsTab({
	status,
	onStatusChange,
}: {
	status: string;
	onStatusChange: (status: string) => void;
}) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const list = useMyFreelanceContracts({
		status: (status || undefined) as "in_progress" | "completed" | undefined,
	});

	return (
		<div className="flex flex-col gap-3">
			<StatusFilter
				value={status}
				onChange={onStatusChange}
				options={[FreelanceStatus.in_progress, FreelanceStatus.completed].map(
					(value) => ({
						value,
						label: t(`enum.freelance_job_vacancy_status.${value}`),
					}),
				)}
			/>
			<FreelanceInfiniteList<FreelanceVacancy>
				items={list.vacancies}
				getKey={(vacancy) => vacancy.id}
				renderItem={(vacancy) => (
					<FreelanceVacancyCard
						vacancy={vacancy}
						to="/freelances/$id"
						showStatus
					>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							{vacancy.contract && (
								<p className="text-sm">
									<span className="text-muted-foreground">
										{t("freelance.contract.value")}:{" "}
									</span>
									<span className="font-medium">
										{proposalPriceLabel(vacancy.contract, t, locale)}
									</span>
								</p>
							)}
							<FeedLink vacancyId={vacancy.id} />
						</div>
					</FreelanceVacancyCard>
				)}
				isLoading={list.isLoading}
				isError={list.isError}
				onRetry={() => list.refetch()}
				hasNextPage={list.hasNextPage}
				isFetchingNextPage={list.isFetchingNextPage}
				fetchNextPage={list.fetchNextPage}
				emptyIcon={Handshake}
				emptyTitle={
					status
						? t("freelance.contracts.status_empty_title")
						: t("freelance.contracts.empty_title")
				}
				emptyDescription={
					status ? undefined : t("freelance.contracts.empty_description")
				}
			/>
		</div>
	);
}

/** Um orçamento do dev, com o freela a que ele se refere. */
function DevProposalItem({ proposal }: { proposal: FreelanceProposal }) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const vacancy = proposal.freelance_job_vacancy;

	return (
		<Card className="w-full gap-3 p-4">
			<div className="flex flex-row flex-wrap items-start justify-between gap-2">
				<div className="flex min-w-0 flex-col">
					<p className="truncate font-semibold">
						{vacancy?.title ?? t("freelance.dev_proposals.vacancy_unavailable")}
					</p>
					{vacancy?.profile?.name && (
						<p className="truncate text-sm text-muted-foreground">
							{vacancy.profile.name}
						</p>
					)}
				</div>
				<FreelanceProposalStatusBadge proposal={proposal} />
			</div>
			<div className="flex flex-col gap-1">
				<p className="font-medium">{proposalPriceLabel(proposal, t, locale)}</p>
				<p className="text-xs text-muted-foreground">
					{t("freelance.proposal.sent_at", {
						date: formatDateTime(proposal.created_at, { locale }),
					})}
				</p>
			</div>
			{vacancy && (
				<div className="flex flex-row flex-wrap gap-2">
					<Link
						to="/freelances/$id"
						params={{ id: vacancy.id }}
						className={buttonVariants({ variant: "outline", size: "sm" })}
					>
						{t("freelance.proposal.open_vacancy")}
					</Link>
					{proposal.status === FreelanceProposalStatus.accepted && (
						<FeedLink vacancyId={vacancy.id} />
					)}
				</div>
			)}
		</Card>
	);
}

function ProposalsTab({
	status,
	onStatusChange,
}: {
	status: string;
	onStatusChange: (status: string) => void;
}) {
	const { t } = useTranslation();

	const list = useMyFreelanceProposals({
		status: (status || undefined) as FreelanceProposalStatusEnum | undefined,
	});

	return (
		<div className="flex flex-col gap-3">
			<StatusFilter
				value={status}
				onChange={onStatusChange}
				options={Object.values(FreelanceProposalStatus).map((value) => ({
					value,
					label: t(`enum.freelance_proposal_status.${value}`),
				}))}
			/>
			<FreelanceInfiniteList<FreelanceProposal>
				items={list.proposals}
				getKey={(proposal) => proposal.id}
				renderItem={(proposal) => <DevProposalItem proposal={proposal} />}
				isLoading={list.isLoading}
				isError={list.isError}
				onRetry={() => list.refetch()}
				hasNextPage={list.hasNextPage}
				isFetchingNextPage={list.isFetchingNextPage}
				fetchNextPage={list.fetchNextPage}
				emptyIcon={FileText}
				emptyTitle={
					status
						? t("freelance.dev_proposals.status_empty_title")
						: t("freelance.dev_proposals.empty_title")
				}
				emptyDescription={
					status ? undefined : t("freelance.dev_proposals.empty_description")
				}
			/>
		</div>
	);
}

/** Convites: a listagem com `invited=true`. */
function InvitationsTab() {
	const { t } = useTranslation();

	const list = useFreelanceSearch({ invited: true });

	return (
		<FreelanceInfiniteList<FreelanceVacancy>
			items={list.vacancies}
			getKey={(vacancy) => vacancy.id}
			renderItem={(vacancy) => (
				<FreelanceVacancyCard vacancy={vacancy} to="/freelances/$id" />
			)}
			isLoading={list.isLoading}
			isError={list.isError}
			onRetry={() => list.refetch()}
			hasNextPage={list.hasNextPage}
			isFetchingNextPage={list.isFetchingNextPage}
			fetchNextPage={list.fetchNextPage}
			emptyIcon={MailOpen}
			emptyTitle={t("freelance.invitations.empty_title")}
			emptyDescription={t("freelance.invitations.empty_description")}
		/>
	);
}

/**
 * Freelas abertos mais próximos do perfil do dev. A API já tira os freelas em
 * que ele orçou, então a lista é refeita depois de cada orçamento. O 409 é o
 * embedding do perfil, gerado depois que o dev cria ou edita o perfil.
 */
function RecommendedTab() {
	const { t } = useTranslation();

	const { data, error, isPending, isFetching, refetch } =
		useRecommendFreelanceJobVacanciesForDev(
			{ limit: FREELANCE_RECOMMENDATION_LIMIT },
			{ query: { retry: false } },
		);

	if (isFreelanceAnalysisPending(error)) {
		return (
			<FreelanceAnalysisState
				title={t("freelance.recommended.analyzing_title")}
				description={t("freelance.recommended.analyzing_description")}
				isRetrying={isFetching}
				onRetry={() => refetch()}
			/>
		);
	}

	if (isPending) return <SearchResultSkeleton />;

	if (error) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyTitle>{t("freelance.load_error")}</EmptyTitle>
					<EmptyDescription>
						{t(freelanceErrorMessageKey(error, "proposal"))}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const recommendations = data?.data ?? [];

	if (recommendations.length === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<Sparkles />
					</EmptyMedia>
					<EmptyTitle>{t("freelance.recommended.empty_title")}</EmptyTitle>
					<EmptyDescription>
						{t("freelance.recommended.empty_description")}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-muted-foreground">
				{t("freelance.recommended.description")}
			</p>
			{recommendations.map(({ similarity, freelance_job_vacancy: vacancy }) => (
				<FreelanceVacancyCard
					key={vacancy.id}
					vacancy={vacancy}
					to="/freelances/$id"
				>
					<Badge
						className={
							toPercentage(similarity) >= 70
								? "self-start bg-emerald-500 text-white"
								: "self-start bg-primary text-primary-foreground"
						}
					>
						{t("freelance.recommended.match", {
							percentage: toPercentage(similarity),
						})}
					</Badge>
				</FreelanceVacancyCard>
			))}
		</div>
	);
}

/**
 * "Meus Freelances" do dev: o que é dele no módulo. Procurar freelas fica na
 * pesquisa.
 */
export default function MyFreelancesDev() {
	const { t } = useTranslation();

	const { tab, status, setFilterParams } = useMyFreelancesParams();

	const currentTab: DevTab = TABS.includes(tab as DevTab)
		? (tab as DevTab)
		: "contracts";

	return (
		<div className="flex flex-col gap-4">
			<Tabs
				value={currentTab}
				// O filtro de status é de cada aba
				onValueChange={(value) => setFilterParams({ tab: value, status: "" })}
			>
				<TabsList variant={"line"} className="flex-wrap">
					{TABS.map((value) => (
						<TabsTrigger key={value} value={value} className="cursor-pointer">
							{t(`freelance.my.tabs.${value}`)}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
			{currentTab === "contracts" && (
				<ContractsTab
					status={status}
					onStatusChange={(value) => setFilterParams({ status: value })}
				/>
			)}
			{currentTab === "proposals" && (
				<ProposalsTab
					status={status}
					onStatusChange={(value) => setFilterParams({ status: value })}
				/>
			)}
			{currentTab === "invitations" && <InvitationsTab />}
			{currentTab === "recommended" && <RecommendedTab />}
		</div>
	);
}
