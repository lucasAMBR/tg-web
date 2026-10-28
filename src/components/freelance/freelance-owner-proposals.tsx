import { AlertCircle, FileText } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { FreelanceProposalStatusEnum } from "@/api/generated/models";
import { useRecommendProposalsForFreelanceJobVacancy } from "@/api/generated/recommendation/recommendation";
import SearchResultSkeleton from "@/components/search/search-result-skeleton";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFreelanceVacancyProposals } from "@/hooks/use-freelance-lists";
import {
	FREELANCE_RECOMMENDATION_LIMIT,
	FreelanceProposalStatus,
	type FreelanceVacancy,
} from "@/types/freelance";
import {
	freelanceAnalysisQueryOptions,
	freelanceErrorMessageKey,
	isFreelanceAnalysisPending,
} from "@/utils/freelance-error";
import FreelanceAnalysisState from "./freelance-analysis-state";
import FreelanceInfiniteList from "./freelance-infinite-list";
import FreelanceProposalCard, {
	getProposalElementId,
} from "./freelance-proposal-card";

export type ProposalsView = "ranked" | "all";

const ALL_STATUSES = "all";

/** "Mais compatíveis": o ranking dos orçamentos pendentes. */
function RankedProposals({ vacancy }: { vacancy: FreelanceVacancy }) {
	const { t } = useTranslation();

	const { data, error, failureReason, isPending, isFetching, refetch } =
		useRecommendProposalsForFreelanceJobVacancy(
			vacancy.id,
			{ limit: FREELANCE_RECOMMENDATION_LIMIT },
			{ query: freelanceAnalysisQueryOptions },
		);

	// Durante as tentativas automáticas o erro fica em `failureReason`, e só vai
	// para `error` quando elas acabam
	const isAnalyzing =
		isFreelanceAnalysisPending(error) ||
		isFreelanceAnalysisPending(failureReason);

	if (isAnalyzing) {
		return (
			<FreelanceAnalysisState
				title={t("freelance.analysis.vacancy_title")}
				description={t("freelance.analysis.vacancy_description")}
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
					<EmptyMedia variant={"icon"}>
						<AlertCircle />
					</EmptyMedia>
					<EmptyTitle>{t("freelance.load_error")}</EmptyTitle>
					<EmptyDescription>
						{t(freelanceErrorMessageKey(error, "proposal"))}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const ranking = data?.data ?? [];

	if (ranking.length === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<FileText />
					</EmptyMedia>
					<EmptyTitle>
						{t("freelance.proposals.ranking_empty_title")}
					</EmptyTitle>
					<EmptyDescription>
						{t("freelance.proposals.empty_description")}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{ranking.map((item) => (
				<FreelanceProposalCard
					key={item.proposal.id}
					vacancy={vacancy}
					proposal={item.proposal}
					ranking={item}
				/>
			))}
		</div>
	);
}

/** "Todos": a listagem paginada, com filtro por status. */
function AllProposals({
	vacancy,
	status,
	onStatusChange,
	highlightDevProfileId,
}: {
	vacancy: FreelanceVacancy;
	status: FreelanceProposalStatusEnum | undefined;
	onStatusChange: (status: FreelanceProposalStatusEnum | undefined) => void;
	highlightDevProfileId?: string | null;
}) {
	const { t } = useTranslation();

	const list = useFreelanceVacancyProposals(vacancy.id, { status });

	// O atalho "Ver orçamento" dos devs recomendados leva até o orçamento do dev
	const highlightIsLoaded = list.proposals.some(
		(proposal) => proposal.dev_profile_id === highlightDevProfileId,
	);

	useEffect(() => {
		if (!highlightDevProfileId || !highlightIsLoaded) return;

		document
			.getElementById(getProposalElementId(highlightDevProfileId))
			?.scrollIntoView({ behavior: "smooth", block: "center" });
	}, [highlightDevProfileId, highlightIsLoaded]);

	return (
		<div className="flex flex-col gap-3">
			<Select
				value={status ?? ALL_STATUSES}
				onValueChange={(value) =>
					onStatusChange(
						value === ALL_STATUSES
							? undefined
							: (value as FreelanceProposalStatusEnum),
					)
				}
			>
				<SelectTrigger
					className="w-full sm:w-56"
					aria-label={t("freelance.filter_status")}
				>
					<SelectValue placeholder={t("freelance.filter_status")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_STATUSES}>
						{t("freelance.all_statuses")}
					</SelectItem>
					{Object.values(FreelanceProposalStatus).map((value) => (
						<SelectItem key={value} value={value}>
							{t(`enum.freelance_proposal_status.${value}`)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FreelanceInfiniteList
				items={list.proposals}
				getKey={(proposal) => proposal.id}
				renderItem={(proposal) => (
					<FreelanceProposalCard
						vacancy={vacancy}
						proposal={proposal}
						highlighted={proposal.dev_profile_id === highlightDevProfileId}
					/>
				)}
				isLoading={list.isLoading}
				isError={list.isError}
				errorMessage={
					list.error
						? t(freelanceErrorMessageKey(list.error, "proposal"))
						: undefined
				}
				onRetry={() => list.refetch()}
				hasNextPage={list.hasNextPage}
				isFetchingNextPage={list.isFetchingNextPage}
				fetchNextPage={list.fetchNextPage}
				emptyIcon={FileText}
				emptyTitle={
					status
						? t("freelance.proposals.status_empty_title")
						: t("freelance.proposals.empty_title")
				}
				emptyDescription={
					status ? undefined : t("freelance.proposals.empty_description")
				}
			/>
		</div>
	);
}

interface FreelanceOwnerProposalsProps {
	vacancy: FreelanceVacancy;
	view: ProposalsView;
	onViewChange: (view: ProposalsView) => void;
	status: FreelanceProposalStatusEnum | undefined;
	onStatusChange: (status: FreelanceProposalStatusEnum | undefined) => void;
	/** Orçamento destacado ao vir pelo atalho dos devs recomendados. */
	highlightDevProfileId?: string | null;
}

/** A aba "Orçamentos" do cliente dono, com o freela aberto. */
export default function FreelanceOwnerProposals({
	vacancy,
	view,
	onViewChange,
	status,
	onStatusChange,
	highlightDevProfileId,
}: FreelanceOwnerProposalsProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-4">
			<ToggleGroup
				type="single"
				variant={"outline"}
				className="self-start"
				value={view}
				onValueChange={(value) => {
					if (value) onViewChange(value as ProposalsView);
				}}
			>
				<ToggleGroupItem value="ranked" className="px-4">
					{t("freelance.proposals.view_ranked")}
				</ToggleGroupItem>
				<ToggleGroupItem value="all" className="px-4">
					{t("freelance.proposals.view_all")}
				</ToggleGroupItem>
			</ToggleGroup>
			{view === "ranked" ? (
				<RankedProposals vacancy={vacancy} />
			) : (
				<AllProposals
					vacancy={vacancy}
					status={status}
					onStatusChange={onStatusChange}
					highlightDevProfileId={highlightDevProfileId}
				/>
			)}
		</div>
	);
}
