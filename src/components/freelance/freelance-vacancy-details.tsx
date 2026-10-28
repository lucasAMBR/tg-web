import { Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	Briefcase,
	CheckCircle2,
	Lock,
	MailOpen,
	Pencil,
	Trash2,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShowFreelanceJobVacancy } from "@/api/generated/freelance-job-vacancy/freelance-job-vacancy";
import type { FreelanceProposalStatusEnum } from "@/api/generated/models";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumbLabel } from "@/hooks/use-breadcrumbs";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import {
	FreelanceStatus,
	type FreelanceVacancy,
	formatFreelanceMoney,
	getFreelanceLocale,
	getFreelanceSpecialties,
} from "@/types/freelance";
import { formatDateTime } from "@/utils/formatter";
import {
	freelanceErrorMessageKey,
	isFreelanceUnavailable,
} from "@/utils/freelance-error";
import CompleteFreelanceDialog from "./complete-freelance-dialog";
import DeleteFreelanceVacancyDialog from "./delete-freelance-vacancy-dialog";
import EditFreelanceVacancyDialog from "./edit-freelance-vacancy-dialog";
import FreelanceClientCard from "./freelance-client-card";
import FreelanceContractCard from "./freelance-contract-card";
import FreelanceDevProposalSection from "./freelance-dev-proposal-section";
import FreelanceOwnerProposals, {
	type ProposalsView,
} from "./freelance-owner-proposals";
import FreelanceRecommendedDevs from "./freelance-recommended-devs";
import { FreelanceStatusBadge } from "./freelance-status-badge";

function FreelanceVacancyDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<Card className="w-full flex-row items-center gap-4 px-12 py-8">
				<Skeleton className="size-32 rounded-full" />
				<div className="flex flex-1 flex-col gap-3">
					<Skeleton className="h-9 w-80" />
					<div className="flex flex-row gap-2">
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-6 w-24" />
					</div>
					<Skeleton className="h-5 w-56" />
				</div>
			</Card>
			<Card className="w-full gap-3 p-8">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</Card>
		</div>
	);
}

/** Ações e abas do cliente dono, que mudam com o status do freela. */
function OwnerSection({ vacancy }: { vacancy: FreelanceVacancy }) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const {
		canEditVacancy,
		canDeleteVacancy,
		canCompleteVacancy,
		canManageProposals,
	} = useFreelancePermissions();

	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [completeOpen, setCompleteOpen] = useState(false);

	const [tab, setTab] = useState("proposals");
	const [proposalsView, setProposalsView] = useState<ProposalsView>("ranked");
	const [proposalStatus, setProposalStatus] = useState<
		FreelanceProposalStatusEnum | undefined
	>();
	const [highlightDevProfileId, setHighlightDevProfileId] = useState<
		string | null
	>(null);

	const canEdit = canEditVacancy(vacancy);
	const canDelete = canDeleteVacancy(vacancy);
	const canComplete = canCompleteVacancy(vacancy);

	const viewProposal = (devProfileId: string) => {
		setTab("proposals");
		setProposalsView("all");
		setProposalStatus(undefined);
		setHighlightDevProfileId(devProfileId);
	};

	return (
		<>
			{(canEdit || canDelete || canComplete) && (
				<Card className="w-full gap-3 p-8">
					<h3 className="text-lg font-bold">
						{t("freelance.details.owner_actions")}
					</h3>
					<div className="flex flex-row flex-wrap gap-2">
						{canEdit && (
							<Button variant={"outline"} onClick={() => setEditOpen(true)}>
								<Pencil className="size-4" />
								{t("freelance.details.edit")}
							</Button>
						)}
						{canDelete && (
							<Button
								variant={"destructive"}
								onClick={() => setDeleteOpen(true)}
							>
								<Trash2 className="size-4" />
								{t("freelance.details.remove")}
							</Button>
						)}
						{canComplete && (
							<Button onClick={() => setCompleteOpen(true)}>
								<CheckCircle2 className="size-4" />
								{t("freelance.details.complete")}
							</Button>
						)}
					</div>
					{canEdit && (
						<EditFreelanceVacancyDialog
							vacancy={vacancy}
							open={editOpen}
							onOpenChange={setEditOpen}
						/>
					)}
					{canDelete && (
						<DeleteFreelanceVacancyDialog
							vacancy={vacancy}
							open={deleteOpen}
							onOpenChange={setDeleteOpen}
							onDeleted={() => navigate({ to: "/freelances" })}
						/>
					)}
					{canComplete && (
						<CompleteFreelanceDialog
							vacancy={vacancy}
							open={completeOpen}
							onOpenChange={setCompleteOpen}
						/>
					)}
				</Card>
			)}

			<FreelanceContractCard vacancy={vacancy} viewer="owner" />

			{canManageProposals(vacancy) && (
				<Card className="w-full gap-4 p-8">
					<Tabs value={tab} onValueChange={setTab}>
						<TabsList variant={"line"}>
							<TabsTrigger value="proposals" className="cursor-pointer">
								{t("freelance.details.tabs.proposals")}
								<Badge variant={"secondary"}>
									{vacancy.proposals_count ?? 0}
								</Badge>
							</TabsTrigger>
							<TabsTrigger value="recommended_devs" className="cursor-pointer">
								{t("freelance.details.tabs.recommended_devs")}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="proposals" className="mt-4">
							<FreelanceOwnerProposals
								vacancy={vacancy}
								view={proposalsView}
								onViewChange={setProposalsView}
								status={proposalStatus}
								onStatusChange={setProposalStatus}
								highlightDevProfileId={highlightDevProfileId}
							/>
						</TabsContent>
						<TabsContent value="recommended_devs" className="mt-4">
							<FreelanceRecommendedDevs
								vacancy={vacancy}
								onViewProposal={viewProposal}
							/>
						</TabsContent>
					</Tabs>
				</Card>
			)}
		</>
	);
}

/** O que o dev vê: o orçamento, o aviso de contratado ou o contrato dele. */
function DevSection({ vacancy }: { vacancy: FreelanceVacancy }) {
	const { t } = useTranslation();

	const { isContracted } = useFreelancePermissions();

	if (isContracted(vacancy)) {
		return <FreelanceContractCard vacancy={vacancy} viewer="dev" />;
	}

	return (
		<>
			{vacancy.status !== FreelanceStatus.open && (
				<Alert>
					<Lock className="size-4" />
					<AlertDescription>
						{t("freelance.details.hired_notice")}
					</AlertDescription>
				</Alert>
			)}
			<FreelanceDevProposalSection vacancy={vacancy} />
		</>
	);
}

interface FreelanceVacancyDetailsProps {
	vacancyId: string;
	/** De onde o detalhe foi aberto, para o "voltar" do estado de indisponível. */
	backTo: "/search" | "/freelances";
}

export default function FreelanceVacancyDetails({
	vacancyId,
	backTo,
}: FreelanceVacancyDetailsProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const { isOwner, isDev } = useFreelancePermissions();

	const { data, isLoading, error, refetch } = useShowFreelanceJobVacancy(
		vacancyId,
		// Freela removido ou id inválido não muda tentando de novo
		{ query: { retry: false } },
	);

	const vacancy = data?.data;

	useBreadcrumbLabel(vacancy?.title);

	if (isLoading) return <FreelanceVacancyDetailsSkeleton />;

	if (!vacancy) {
		const unavailable = !error || isFreelanceUnavailable(error);

		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						{unavailable ? <Briefcase /> : <AlertCircle />}
					</EmptyMedia>
					<EmptyTitle>
						{unavailable
							? t("freelance.unavailable_title")
							: t("freelance.load_error")}
					</EmptyTitle>
					<EmptyDescription>
						{unavailable
							? t("freelance.unavailable_description")
							: t(freelanceErrorMessageKey(error, "vacancy"))}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent className="flex-row justify-center">
					{!unavailable && (
						<Button variant={"outline"} onClick={() => refetch()}>
							{t("freelance.retry")}
						</Button>
					)}
					<Link to={backTo} className={buttonVariants({ variant: "outline" })}>
						<ArrowLeft className="size-4" />
						{backTo === "/search"
							? t("freelance.back_to_search")
							: t("freelance.back_to_my_freelances")}
					</Link>
				</EmptyContent>
			</Empty>
		);
	}

	const owner = isOwner(vacancy);

	const specialties = getFreelanceSpecialties(vacancy);
	const languages = vacancy.languages ?? [];
	const client = vacancy.profile;

	return (
		<>
			<Card className="w-full gap-4 px-12 py-8">
				<div className="flex flex-row items-center gap-4">
					<Avatar className="size-32">
						{client?.profile_pic && (
							<AvatarImage
								src={client.profile_pic}
								alt={client.name}
								className="object-cover"
							/>
						)}
						<AvatarFallback className="bg-primary text-primary-foreground">
							<Users className="size-22" />
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-1 flex-col gap-2">
						<h2 className="wrap-break-word font-[Anta] text-4xl font-bold">
							{vacancy.title}
						</h2>
						<p className="text-muted-foreground">
							{client?.name ?? t("freelance.details.client_unavailable")}
							{" · "}
							{t("freelance.posted_at", {
								date: formatDateTime(vacancy.created_at, {
									locale,
									pattern: "dd/MM/yyyy",
								}),
							})}
						</p>
						<div className="flex flex-row flex-wrap gap-2">
							<FreelanceStatusBadge vacancy={vacancy} />
							{vacancy.is_invited && (
								<Badge className="bg-primary text-primary-foreground">
									<MailOpen className="size-3" />
									{t("freelance.badges.invited")}
								</Badge>
							)}
							<Badge variant={"default"}>
								{t(`enum.job_type.${vacancy.job_type}`, {
									defaultValue: vacancy.job_type_label,
								})}
							</Badge>
							<Badge variant={"secondary"}>
								{t(`enum.seniority_level.${vacancy.seniority_level}`, {
									defaultValue: vacancy.seniority_level_label,
								})}
							</Badge>
							{specialties.map((specialty) => (
								<Badge
									key={specialty}
									className="bg-accent text-accent-foreground"
								>
									{t(`enum.dev_specialty.${specialty}`)}
								</Badge>
							))}
						</div>
						{owner && vacancy.budget && (
							<p className="text-sm">
								<span className="text-muted-foreground">
									{t("freelance.details.budget")}:{" "}
								</span>
								<span className="text-lg font-semibold">
									{formatFreelanceMoney(vacancy.budget, locale)}
								</span>
								<span className="text-xs text-muted-foreground">
									{" · "}
									{t("freelance.details.budget_hint")}
								</span>
							</p>
						)}
					</div>
				</div>
			</Card>

			{owner && <OwnerSection vacancy={vacancy} />}

			{isDev && <DevSection vacancy={vacancy} />}

			<div className="flex flex-col gap-4 lg:flex-row">
				<div className="flex flex-2 flex-col gap-4">
					<Card className="w-full gap-3 p-8">
						<h3 className="text-lg font-bold">
							{t("freelance.details.description")}
						</h3>
						<p className="whitespace-pre-line wrap-break-word text-sm">
							{vacancy.description}
						</p>
					</Card>
					<Card className="w-full gap-3 p-8">
						<h3 className="text-lg font-bold">
							{t("freelance.details.languages")}
						</h3>
						{languages.length > 0 ? (
							<div className="flex flex-col gap-2">
								{languages.map((language) => (
									<div
										key={language.id}
										className="flex flex-row items-center justify-between gap-2"
									>
										<span className="truncate text-sm">{language.name}</span>
										{language.language_level && (
											<Badge variant={"secondary"}>
												{t(
													`enum.hard_skill_levels.${language.language_level}`,
													{
														defaultValue: language.language_level_label,
													},
												)}
											</Badge>
										)}
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								{t("freelance.details.no_languages")}
							</p>
						)}
					</Card>
				</div>
				<div className="flex flex-1 flex-col gap-4">
					<FreelanceClientCard
						vacancy={vacancy}
						showChat={isDev && vacancy.status === FreelanceStatus.open}
					/>
				</div>
			</div>
		</>
	);
}
