import type { AddressResource, CompanyProfileResource } from "@/api/generated/models";
import { getIndexCompanyProfileQueryKey } from "@/api/generated/profile/profile";
import { useUserBlockAccess, useUserUnblockAccess } from "@/api/generated/user/user";
import AdminUpdateCompanyProfileDialog from "@/components/admin-land/company/admin-update-company-profile-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { formatCNPJ, formatDateTime } from "@/utils/formatter";
import { onError } from "@/utils/on-error";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { AxiosError } from "axios";
import { CircleSmall, EditIcon, EllipsisVertical, EyeIcon, LockIcon, LockOpenIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type AdminCompanyProfile = CompanyProfileResource & {
	is_blocked?: boolean;
	address?: AddressResource | null;
};

const TranslatedOperationalSegmentCell = ({ segment }: { segment: string }) => {
	const { t } = useTranslation();

	return <div>{t(`enum.operational_segment.${segment}`)}</div>
}

const TranslatedStatusCell = ({ status }: { status: boolean }) => {
	const { t } = useTranslation();

	return <div>
		{status ?
			<Badge variant="destructive"><CircleSmall className="w-4" />{t("general.blocked")}</Badge> :
			<Badge variant="default" className="bg-emerald-500 text-white"><CircleSmall className="w-4" /> {t("general.active")}</Badge>
		}
	</div>
}

const CompanyActionsCell = ({ company }: { company: AdminCompanyProfile }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [editOpen, setEditOpen] = useState(false);

	const queryClient = useQueryClient();

	const { mutate: blockAccess } = useUserBlockAccess();
	const { mutate: unblockAccess } = useUserUnblockAccess();

	const handleBlockAccess = () => {
		blockAccess({ id: company.user_id }, {
			onSuccess: () => {
				CustomToaster.successToast(t("toast.success.access_blocked"));
				queryClient.invalidateQueries({ queryKey: getIndexCompanyProfileQueryKey() });
			},
			onError: (error) => {
				onError(error as AxiosError<ApiError>);
			}
		});
	}

	const handleUnblockAccess = () => {
		unblockAccess({ id: company.user_id }, {
			onSuccess: () => {
				CustomToaster.successToast(t("toast.success.access_unblocked"));
				queryClient.invalidateQueries({ queryKey: getIndexCompanyProfileQueryKey() });
			},
			onError: (error) => {
				onError(error as AxiosError<ApiError>);
			}
		});
	}

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
						<DropdownMenuItem onClick={() => navigate({ to: "/admin-land/company/$id", params: { id: company.id } })}>
							<EyeIcon className="w-4" />
							{t("general.view_profile")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setEditOpen(true)}>
							<EditIcon className="w-4" />
							{t("general.edit_profile")}
						</DropdownMenuItem>
						{company.is_blocked && (
							<DropdownMenuItem onClick={handleUnblockAccess}>
								<LockOpenIcon className="w-4" />
								{t("general.unblock_access")}
							</DropdownMenuItem>
						)}
						{!company.is_blocked && (
							<DropdownMenuItem variant="destructive" onClick={handleBlockAccess}>
								<LockIcon className="w-4" />
								{t("general.block_access")}
							</DropdownMenuItem>
						)}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<AdminUpdateCompanyProfileDialog
				company={company}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>
		</>
	);
};

export const columns: ColumnDef<AdminCompanyProfile>[] = [
	{
		header: "admin_land.companies.table.name",
		accessorKey: "name",
		cell: ({ row }) => {
			return <div>{row.original.name}</div>
		}
	},
	{
		header: "admin_land.companies.table.operational_segment",
		accessorKey: "operational_segment",
		cell: ({ row }) => {
			return <TranslatedOperationalSegmentCell segment={row.original.operational_segment} />
		}
	},
	{
		header: "admin_land.companies.table.cnpj",
		accessorKey: "cnpj",
		cell: ({ row }) => {
			return <div>{formatCNPJ(row.original.cnpj)}</div>
		}
	},
	{
		header: "admin_land.companies.table.created_at",
		accessorKey: "created_at",
		cell: ({ row }) => {
			const createdAt = formatDateTime(row.original.created_at, { locale: "pt" });

			return <div>{createdAt}</div>
		}
	},
	{
		header: "general.location",
		accessorKey: "location",
		cell: ({ row }) => {
			const location = row.original.address ? row.original.address?.city + ", " + row.original.address?.state : "—";

			return <div>{location}</div>
		}
	},
	{
		header: "general.status",
		accessorKey: "status",
		cell: ({ row }) => {
			return <TranslatedStatusCell status={row.original.is_blocked ?? false} />
		}
	},
	{
		header: "",
		accessorKey: "actions",
		meta: {
			className: "max-w-20"
		},
		cell: ({ row }) => <CompanyActionsCell company={row.original} />,
	}
]
