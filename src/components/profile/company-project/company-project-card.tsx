import type { CompanyProjectModel } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompanyProjectCardProps{
    project: CompanyProjectModel,
    openDelete: (project: CompanyProjectModel) => void,
    openUpdate: (project: CompanyProjectModel) => void
}
export default function CompanyProjectCard({ project, openDelete, openUpdate }: CompanyProjectCardProps) {

    const { user } = useAuthStore();

    const { t } = useTranslation();

    return (
        <Card className="p-4">
            <CardHeader className="p-0">
                <div className="flex justify-between">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    {user?.company_profile?.id === project.company_profile_id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size={"sm"} variant={"outline"}>
                                    <EllipsisVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>{t("general.actions")}</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => openUpdate(project)}
                                >
                                    <Edit /> {t("general.update")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => openDelete(project)}
                                    variant="destructive"
                                >
                                    <Trash /> {t("general.delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <CardDescription>{project.description}</CardDescription>
                <div className="flex gap-1">
                    {project.languages.map((lang) => (
                        <Badge>{lang.name}</Badge>
                    ))}
                </div>
            </CardHeader>
        </Card>
    );
}