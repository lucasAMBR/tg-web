import type { DevProfileResource } from "@/api/generated/models";
import { getIndexDevProfileQueryKey } from "@/api/generated/profile/profile";
import { useUserBlockAccess, useUserUnblockAccess } from "@/api/generated/user/user";
import AdminUpdateDevProfileDialog from "@/components/admin-land/devs/admin-update-dev-profile-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { formatDateTime } from "@/utils/formatter";
import { onError } from "@/utils/on-error";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { AxiosError } from "axios";
import { CircleSmall, EditIcon, EllipsisVertical, EyeIcon, LockIcon, LockOpenIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const TranslatedSpecialtyCell = ({ specialty }: { specialty: string }) => {
    const { t } = useTranslation();

    return <div>{t(`enum.dev_specialty.${specialty}`)}</div>
}

const TranslatedSeniorityLevelCell = ({ seniority_level }: { seniority_level: string }) => {
    const { t } = useTranslation();

    return <div>{t(`enum.seniority_level.${seniority_level}`)}</div>
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

const DevActionsCell = ({ dev }: { dev: DevProfileResource }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);

    const queryClient = useQueryClient();

    const { mutate: blockAccess } = useUserBlockAccess();

    const { mutate: unblockAccess } = useUserUnblockAccess();

    const handleBlockAccess = () => {
        blockAccess({ id: dev.user_id }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.access_blocked"));
                queryClient.invalidateQueries({ queryKey: getIndexDevProfileQueryKey() });
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        });
    }

    const handleUnblockAccess = () => {
        unblockAccess({ id: dev.user_id }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.access_unblocked"));
                queryClient.invalidateQueries({ queryKey: getIndexDevProfileQueryKey() });
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
                        <DropdownMenuItem onClick={() => navigate({ to: "/admin-land/devs/$id", params: { id: dev.id } })}>
                            <EyeIcon className="w-4" />
                            {t("general.view_profile")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <EditIcon className="w-4" />
                            {t("general.edit_profile")}
                        </DropdownMenuItem>
                        {dev.is_blocked && (
                            <DropdownMenuItem onClick={handleUnblockAccess}>
                                <LockOpenIcon className="w-4" />
                                {t("general.unblock_access")}
                            </DropdownMenuItem>
                        )}
                        {!dev.is_blocked && (
                        <DropdownMenuItem variant="destructive" onClick={handleBlockAccess}>
                            <LockIcon className="w-4" />
                                {t("general.block_access")}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <AdminUpdateDevProfileDialog
                dev={dev}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
};

export const columns: ColumnDef<DevProfileResource>[] = [
    {
        header: "admin_land.devs.table.name",
        accessorKey: "name",
        cell: ({ row }) => {
            return <div>{row.original.name}</div>
        }
    },
    {
        header:  "admin_land.devs.table.specialty",
        accessorKey: "specialty",
        cell: ({ row }) => {
            return <TranslatedSpecialtyCell specialty={row.original.specialty} />
        }
    },
    {
        header: "admin_land.devs.table.seniority_level",
        accessorKey: "seniority_level",
        cell: ({ row }) => {
            return <TranslatedSeniorityLevelCell seniority_level={row.original.seniority_level} />
        }
    },
    {
        header: "admin_land.devs.table.created_at",
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
            return <TranslatedStatusCell status={row.original.is_blocked} />
        }
    },
    {
        header: "",
        accessorKey: "actions",
        meta: {
            className: "max-w-20"
        },
        cell: ({ row }) => <DevActionsCell dev={row.original} />,
    }
] 