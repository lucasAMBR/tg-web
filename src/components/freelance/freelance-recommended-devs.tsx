import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, MailPlus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStoreFreelanceInvitation } from "@/api/generated/freelance-invitation/freelance-invitation";
import type { RecommendDevsForFreelanceJobVacancy200 } from "@/api/generated/models";
import {
	getRecommendDevsForFreelanceJobVacancyQueryKey,
	useRecommendDevsForFreelanceJobVacancy,
} from "@/api/generated/recommendation/recommendation";
import StartChatButton from "@/components/chat/start-chat-button";
import SearchResultSkeleton from "@/components/search/search-result-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import {
	FREELANCE_RECOMMENDATION_LIMIT,
	type FreelanceVacancy,
	type RecommendedFreelanceDev,
	toPercentage,
} from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	freelanceAnalysisQueryOptions,
	freelanceErrorMessageKey,
	isFreelanceAnalysisPending,
} from "@/utils/freelance-error";
import FreelanceAnalysisState from "./freelance-analysis-state";
import FreelanceDevSummaryRow from "./freelance-dev-summary";

const RECOMMENDATION_PARAMS = { limit: FREELANCE_RECOMMENDATION_LIMIT };

interface RecommendedDevItemProps {
	vacancy: FreelanceVacancy;
	recommendation: RecommendedFreelanceDev;
	onViewProposal: (devProfileId: string) => void;
}

function RecommendedDevItem({
	vacancy,
	recommendation,
	onViewProposal,
}: RecommendedDevItemProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { canInvite } = useFreelancePermissions();

	const { mutate: invite, isPending } = useStoreFreelanceInvitation();

	const {
		dev_profile: dev,
		similarity,
		has_proposal,
		is_invited,
	} = recommendation;

	const queryKey = getRecommendDevsForFreelanceJobVacancyQueryKey(
		vacancy.id,
		RECOMMENDATION_PARAMS,
	);

	const handleInvite = () => {
		invite(
			{ id: vacancy.id, data: { dev_profile_id: dev.id } },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.freelance_invitation_sent"),
					);

					// Marca o convite na própria lista, sem recarregar
					queryClient.setQueryData<RecommendDevsForFreelanceJobVacancy200>(
						queryKey,
						(current) =>
							current
								? {
										...current,
										data: current.data.map((item) =>
											item.dev_profile.id === dev.id
												? { ...item, is_invited: true }
												: item,
										),
									}
								: current,
					);
				},
				onError: (error) => {
					CustomToaster.errorToast(
						t(freelanceErrorMessageKey(error, "invite")),
					);

					// Já convidado, já orçou ou o freela fechou: a lista recarregada
					// mostra o selo certo
					queryClient.invalidateQueries({ queryKey });
				},
			},
		);
	};

	const percentage = toPercentage(similarity);

	return (
		<Card className="w-full gap-3 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<FreelanceDevSummaryRow
					dev={dev}
					badges={
						<>
							<Badge
								className={
									percentage >= 70
										? "bg-emerald-500 text-white"
										: "bg-primary text-primary-foreground"
								}
							>
								{t("freelance.recommended_devs.match", { percentage })}
							</Badge>
							{has_proposal && (
								<Badge variant={"secondary"}>
									{t("freelance.recommended_devs.has_proposal")}
								</Badge>
							)}
							{is_invited && (
								<Badge variant={"secondary"}>
									{t("freelance.recommended_devs.invited")}
								</Badge>
							)}
						</>
					}
				/>
				<div className="flex flex-row flex-wrap gap-2">
					{has_proposal && (
						<Button variant={"outline"} onClick={() => onViewProposal(dev.id)}>
							{t("freelance.recommended_devs.view_proposal")}
						</Button>
					)}
					{!has_proposal && !is_invited && canInvite(vacancy) && (
						<Button onClick={handleInvite} disabled={isPending}>
							{isPending ? (
								<Spinner className="size-4" />
							) : (
								<MailPlus className="size-4" />
							)}
							{t("freelance.recommended_devs.invite")}
						</Button>
					)}
					<StartChatButton
						userId={dev.user_id}
						draft={t("freelance.chat_draft.client", { title: vacancy.title })}
					/>
				</div>
			</div>
		</Card>
	);
}

interface FreelanceRecommendedDevsProps {
	vacancy: FreelanceVacancy;
	/** Atalho para o orçamento de quem já orçou. */
	onViewProposal: (devProfileId: string) => void;
}

/**
 * Devs mais aderentes ao freela, tenham orçado ou não, para o cliente dono. O
 * embedding do freela é gerado em fila cerca de 1 minuto depois de criar ou
 * editar; até lá a rota responde 409 e a seção tenta de novo sozinha.
 */
export default function FreelanceRecommendedDevs({
	vacancy,
	onViewProposal,
}: FreelanceRecommendedDevsProps) {
	const { t } = useTranslation();

	const { data, error, failureReason, isPending, isFetching, refetch } =
		useRecommendDevsForFreelanceJobVacancy(vacancy.id, RECOMMENDATION_PARAMS, {
			query: freelanceAnalysisQueryOptions,
		});

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
						{t(freelanceErrorMessageKey(error, "invite"))}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const recommendations = data?.data ?? [];

	return (
		<div className="flex flex-col gap-3">
			<p className="text-sm text-muted-foreground">
				{t("freelance.recommended_devs.description")}
			</p>
			{recommendations.length === 0 ? (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Users />
						</EmptyMedia>
						<EmptyTitle>
							{t("freelance.recommended_devs.empty_title")}
						</EmptyTitle>
						<EmptyDescription>
							{t("freelance.recommended_devs.empty_description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				recommendations.map((recommendation) => (
					<RecommendedDevItem
						key={recommendation.dev_profile.id}
						vacancy={vacancy}
						recommendation={recommendation}
						onViewProposal={onViewProposal}
					/>
				))
			)}
		</div>
	);
}
