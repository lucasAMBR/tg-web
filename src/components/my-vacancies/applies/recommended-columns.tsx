import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
	CheckCheck,
	EllipsisVertical,
	EyeIcon,
	MailCheck,
	MailPlus,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RecommendedDevResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InviteDevDialog from "./invite-dev-dialog";

const TranslatedSpecialtyCell = ({ specialty }: { specialty?: string }) => {
	const { t } = useTranslation();

	return <div>{specialty ? t(`enum.dev_specialty.${specialty}`) : "—"}</div>;
};

const TranslatedSeniorityLevelCell = ({
	seniority_level,
}: {
	seniority_level?: string;
}) => {
	const { t } = useTranslation();

	return (
		<div>
			{seniority_level ? t(`enum.seniority_level.${seniority_level}`) : "—"}
		</div>
	);
};

const SimilarityCell = ({ similarity }: { similarity: number }) => {
	const percentage = Math.round(similarity * 100);

	return (
		<Badge
			variant={percentage >= 70 ? "default" : "secondary"}
			className={percentage >= 70 ? "bg-emerald-500 text-white" : undefined}
		>
			{percentage}%
		</Badge>
	);
};

interface RecommendedDevActionsCellProps {
	jobVacancyId: string;
	recommendation: RecommendedDevResource;
	/** A vaga ainda recebe candidaturas: só assim o convite faz sentido. */
	canInvite: boolean;
}

const RecommendedDevActionsCell = ({
	jobVacancyId,
	recommendation,
	canInvite,
}: RecommendedDevActionsCellProps) => {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const [inviteOpen, setInviteOpen] = useState(false);

	const { dev_profile: dev, has_applied, is_invited } = recommendation;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						<EllipsisVertical className="w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="bottom" align="end">
					<DropdownMenuLabel>{t("general.actions")}</DropdownMenuLabel>
					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={() =>
								navigate({ to: "/devs/$id", params: { id: dev.id } })
							}
						>
							<EyeIcon className="w-4" />
							{t("general.view_profile")}
						</DropdownMenuItem>
						{/* Quem já está no processo aparece com o estado, sem o convite */}
						{has_applied ? (
							<DropdownMenuItem disabled>
								<CheckCheck className="w-4" />
								{t("my_vacancies.recommended.invite.applied")}
							</DropdownMenuItem>
						) : is_invited ? (
							<DropdownMenuItem disabled>
								<MailCheck className="w-4" />
								{t("my_vacancies.recommended.invite.invited")}
							</DropdownMenuItem>
						) : (
							canInvite && (
								<DropdownMenuItem onSelect={() => setInviteOpen(true)}>
									<MailPlus className="w-4" />
									{t("my_vacancies.recommended.invite.action")}
								</DropdownMenuItem>
							)
						)}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<InviteDevDialog
				jobVacancyId={jobVacancyId}
				devProfileId={dev.id}
				devName={dev.name}
				open={inviteOpen}
				onOpenChange={setInviteOpen}
			/>
		</>
	);
};

interface RecommendedColumnsOptions {
	jobVacancyId: string;
	canInvite: boolean;
}

export const getRecommendedColumns = ({
	jobVacancyId,
	canInvite,
}: RecommendedColumnsOptions): ColumnDef<RecommendedDevResource>[] => [
	{
		header: "my_vacancies.applies.table.dev",
		accessorKey: "dev_profile.name",
		cell: ({ row }) => <div>{row.original.dev_profile?.name ?? "—"}</div>,
	},
	{
		header: "my_vacancies.applies.table.specialty",
		accessorKey: "dev_profile.specialty",
		cell: ({ row }) => (
			<TranslatedSpecialtyCell
				specialty={row.original.dev_profile?.specialty}
			/>
		),
	},
	{
		header: "my_vacancies.applies.table.seniority_level",
		accessorKey: "dev_profile.seniority_level",
		cell: ({ row }) => (
			<TranslatedSeniorityLevelCell
				seniority_level={row.original.dev_profile?.seniority_level}
			/>
		),
	},
	{
		header: "my_vacancies.recommended.table.similarity",
		accessorKey: "similarity",
		cell: ({ row }) => <SimilarityCell similarity={row.original.similarity} />,
	},
	{
		header: "",
		accessorKey: "actions",
		meta: {
			className: "max-w-20",
		},
		cell: ({ row }) => (
			<RecommendedDevActionsCell
				jobVacancyId={jobVacancyId}
				recommendation={row.original}
				canInvite={canInvite}
			/>
		),
	},
];
