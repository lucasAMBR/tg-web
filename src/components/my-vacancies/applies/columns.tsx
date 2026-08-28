import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleSmall, EllipsisVertical, EyeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DevJobVacancyCollectionDataItem } from "@/api/generated/models";
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
import { formatDateTime } from "@/utils/formatter";

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

const ApplyStatusCell = ({ status }: { status: string }) => {
	const { t } = useTranslation();

	const variant =
		status === "approved"
			? "default"
			: status === "rejected"
				? "destructive"
				: "secondary";

	return (
		<Badge
			variant={variant}
			className={
				status === "approved" ? "bg-emerald-500 text-white" : undefined
			}
		>
			<CircleSmall className="w-4" />
			{t(`enum.dev_job_vacancy_status.${status}`)}
		</Badge>
	);
};

const ApplyProcessStepCell = ({ processStep }: { processStep?: string }) => {
	const { t } = useTranslation();

	return (
		<div>
			{processStep ? t(`enum.selection_process_stage.${processStep}`) : "—"}
		</div>
	);
};

const ApplyActionsCell = ({
	apply,
}: {
	apply: DevJobVacancyCollectionDataItem;
}) => {
	const { t } = useTranslation();

	const navigate = useNavigate();

	return (
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
							navigate({
								to: "/devs/$id",
								params: { id: apply.profile?.id ?? apply.dev_profile_id },
							})
						}
					>
						<EyeIcon className="w-4" />
						{t("general.view_profile")}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const columns: ColumnDef<DevJobVacancyCollectionDataItem>[] = [
	{
		header: "my_vacancies.applies.table.dev",
		accessorKey: "profile.name",
		cell: ({ row }) => <div>{row.original.profile?.name ?? "—"}</div>,
	},
	{
		header: "my_vacancies.applies.table.specialty",
		accessorKey: "profile.specialty",
		cell: ({ row }) => (
			<TranslatedSpecialtyCell specialty={row.original.profile?.specialty} />
		),
	},
	{
		header: "my_vacancies.applies.table.seniority_level",
		accessorKey: "profile.seniority_level",
		cell: ({ row }) => (
			<TranslatedSeniorityLevelCell
				seniority_level={row.original.profile?.seniority_level}
			/>
		),
	},
	{
		header: "my_vacancies.applies.table.status",
		accessorKey: "status",
		cell: ({ row }) => <ApplyStatusCell status={row.original.status} />,
	},
	{
		header: "my_vacancies.applies.table.process_step",
		accessorKey: "process_step",
		cell: ({ row }) => (
			<ApplyProcessStepCell processStep={row.original.process_step} />
		),
	},
	{
		header: "my_vacancies.applies.table.applied_at",
		accessorKey: "applied_at",
		cell: ({ row }) => (
			<div>{formatDateTime(row.original.applied_at, { fallback: "—" })}</div>
		),
	},
	{
		header: "",
		accessorKey: "actions",
		meta: {
			className: "max-w-20",
		},
		cell: ({ row }) => <ApplyActionsCell apply={row.original} />,
	},
];
