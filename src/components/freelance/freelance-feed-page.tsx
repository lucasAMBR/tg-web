import { Link } from "@tanstack/react-router";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShowFreelanceJobVacancy } from "@/api/generated/freelance-job-vacancy/freelance-job-vacancy";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreadcrumbLabel } from "@/hooks/use-breadcrumbs";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import {
	freelanceErrorMessageKey,
	isFreelanceUnavailable,
} from "@/utils/freelance-error";
import FreelanceContractCard from "./freelance-contract-card";
import FreelanceFeed from "./freelance-feed";
import { FreelanceStatusBadge } from "./freelance-status-badge";

/** Tela do feed: o freela, o contrato e as postagens das duas pontas. */
export default function FreelanceFeedPage({
	vacancyId,
}: {
	vacancyId: string;
}) {
	const { t } = useTranslation();

	const { isOwner } = useFreelancePermissions();

	const { data, isLoading, error } = useShowFreelanceJobVacancy(vacancyId, {
		query: { retry: false },
	});

	const vacancy = data?.data;

	useBreadcrumbLabel(vacancy?.title);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	if (!vacancy) {
		const unavailable = !error || isFreelanceUnavailable(error);

		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<Briefcase />
					</EmptyMedia>
					<EmptyTitle>
						{unavailable
							? t("freelance.unavailable_title")
							: t("freelance.load_error")}
					</EmptyTitle>
					<EmptyDescription>
						{unavailable
							? t("freelance.unavailable_description")
							: t(freelanceErrorMessageKey(error, "feed"))}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Link
						to="/freelances"
						className={buttonVariants({ variant: "outline" })}
					>
						<ArrowLeft className="size-4" />
						{t("freelance.back_to_my_freelances")}
					</Link>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<>
			<Card className="w-full flex-row flex-wrap items-center justify-between gap-3 p-6">
				<div className="flex min-w-0 flex-col gap-2">
					<h2 className="wrap-break-word font-[Anta] text-3xl font-bold">
						{vacancy.title}
					</h2>
					<div className="flex flex-row flex-wrap items-center gap-2">
						<FreelanceStatusBadge vacancy={vacancy} />
						<span className="text-sm text-muted-foreground">
							{vacancy.profile?.name}
						</span>
					</div>
				</div>
				<Link
					to="/freelances/$id"
					params={{ id: vacancy.id }}
					className={buttonVariants({ variant: "outline" })}
				>
					<ArrowLeft className="size-4" />
					{t("freelance.feed.back_to_details")}
				</Link>
			</Card>
			<FreelanceContractCard
				vacancy={vacancy}
				viewer={isOwner(vacancy) ? "owner" : "dev"}
				showFeedLink={false}
			/>
			<FreelanceFeed vacancy={vacancy} />
		</>
	);
}
