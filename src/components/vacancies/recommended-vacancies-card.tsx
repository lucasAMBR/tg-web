import { Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Briefcase, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RecommendedJobVacancyResource } from "@/api/generated/models";
import { useRecommendJobVacanciesForDev } from "@/api/generated/recommendation/recommendation";
import FreelanceAnalysisState from "@/components/freelance/freelance-analysis-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { toPercentage } from "@/types/freelance";

/** Quantas vagas o bloco ao lado do feed mostra. */
const RECOMMENDED_VACANCIES_LIMIT = 3;

/** A partir desta aderência (%) o selo fica verde, como nos freelas. */
const HIGH_MATCH_PERCENTAGE = 70;

/**
 * Bloco "Vagas recomendadas" ao lado do feed: as vagas com inscrições abertas
 * mais aderentes ao perfil do dev. A API já tira as vagas em que ele se
 * candidatou. O 409 é o embedding do perfil, gerado depois que o dev cria ou
 * edita o perfil. Quem renderiza garante que o usuário é dev (senão 403).
 */
export default function RecommendedVacanciesCard() {
	const { t } = useTranslation();

	const { data, error, isPending, isFetching, refetch } =
		useRecommendJobVacanciesForDev(
			{ limit: RECOMMENDED_VACANCIES_LIMIT },
			{ query: { retry: false } },
		);

	const recommendations = data?.data ?? [];

	const isAnalysisPending =
		isAxiosError(error) && error.response?.status === 409;

	return (
		<section className="flex w-full flex-col gap-4">
			<h2 className="flex items-center gap-2 text-xl font-bold">
				{t("vacancies.recommended.title")}
			</h2>

			{isPending && <RecommendedVacancySkeleton />}

			{isAnalysisPending && (
				<FreelanceAnalysisState
					title={t("vacancies.recommended.analyzing_title")}
					description={t("vacancies.recommended.analyzing_description")}
					isRetrying={isFetching}
					onRetry={() => refetch()}
				/>
			)}

			{error && !isAnalysisPending && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyTitle>{t("vacancies.recommended.load_error")}</EmptyTitle>
					</EmptyHeader>
				</Empty>
			)}

			{!isPending && !error && recommendations.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Sparkles />
						</EmptyMedia>
						<EmptyTitle>{t("vacancies.recommended.empty")}</EmptyTitle>
					</EmptyHeader>
				</Empty>
			)}

			{recommendations.length > 0 && (
				<ul className="flex flex-col gap-2">
					{recommendations.map((recommendation) => (
						<li key={recommendation.job_vacancy.id}>
							<RecommendedVacancyItem recommendation={recommendation} />
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

function RecommendedVacancyItem({
	recommendation,
}: {
	recommendation: RecommendedJobVacancyResource;
}) {
	const { t } = useTranslation();

	const { similarity, job_vacancy: vacancy } = recommendation;

	const company = vacancy.profile;
	const percentage = toPercentage(similarity);

	return (
		<Link
			to="/vacancies/$id"
			params={{ id: vacancy.id }}
			className="group block"
		>
			<Card className="gap-3 p-3 transition-colors group-hover:border-primary">
				<div className="flex items-center gap-3">
					<Avatar className="size-10 shrink-0">
						{company?.profile_pic && (
							<AvatarImage
								src={company.profile_pic}
								alt={company.name}
								className="object-cover"
							/>
						)}
						<AvatarFallback className="bg-primary text-primary-foreground">
							<Briefcase className="size-5" />
						</AvatarFallback>
					</Avatar>

					<div className="flex min-w-0 flex-1 flex-col">
						<span className="truncate text-sm font-semibold group-hover:text-primary">
							{vacancy.title}
						</span>
						{company?.name && (
							<span className="truncate text-xs text-muted-foreground">
								{company.name}
							</span>
						)}
					</div>
				</div>

				<div className="flex flex-wrap gap-1.5">
					<Badge
						className={
							percentage >= HIGH_MATCH_PERCENTAGE
								? "bg-emerald-500 text-white"
								: "bg-primary text-primary-foreground"
						}
					>
						{t("vacancies.recommended.match", { percentage })}
					</Badge>
					<Badge variant={"secondary"}>
						{t(`enum.employment_type.${vacancy.employment_type}`)}
					</Badge>
					<Badge variant={"outline"}>
						{t(`enum.seniority_level.${vacancy.seniority_level}`)}
					</Badge>
				</div>
			</Card>
		</Link>
	);
}

/** Cards de carregamento no formato do `RecommendedVacancyItem`. */
function RecommendedVacancySkeleton() {
	return (
		<div className="flex flex-col gap-2">
			{[0, 1, 2].map((placeholder) => (
				<Card key={placeholder} className="gap-3 p-3">
					<div className="flex items-center gap-3">
						<Skeleton className="size-10 shrink-0 rounded-full" />
						<div className="flex flex-1 flex-col gap-1">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
					<div className="flex gap-1.5">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-5 w-16" />
					</div>
				</Card>
			))}
		</div>
	);
}
