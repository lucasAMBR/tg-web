import type { CompanyProjectModel } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { externalHref } from "@/utils/external-href";
import { Edit, EllipsisVertical, Link, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompanyProjectCardProps{
    project: CompanyProjectModel,
    openDelete: (project: CompanyProjectModel) => void,
    openUpdate: (project: CompanyProjectModel) => void
}
export default function CompanyProjectCard({ project, openDelete, openUpdate }: CompanyProjectCardProps) {

    const { user } = useAuthStore();

    const { t } = useTranslation();

    const prod = project.prod_url?.trim();
    const gh = project.github_url?.trim();

    return (
        <Card className="p-4">
            <CardHeader className="p-0">
                <div className="flex justify-between gap-2 mb-2 items-start">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                    </div>
                    {user?.company_profile?.id === project.company_profile_id &&
                        <div className="flex justify-end gap-1">
                            <div className="flex shrink-0 items-center gap-1">
                                {prod && (
                                    <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                                        <a
                                            href={externalHref(prod)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={t("general.open_link")}
                                        >
                                            <Link className="size-3.5" />
                                            <span className="ml-1 text-xs">App</span>
                                        </a>
                                    </Button>
                                )}
                                {gh && (
                                    <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                                        <a
                                            href={externalHref(gh)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={t("general.open_link")}
                                        >
                                            <Link className="size-3.5" />
                                            <span className="ml-1 text-xs">GitHub</span>
                                        </a>
                                    </Button>
                                )}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size={"sm"} variant={"outline"}>
                                        <EllipsisVertical />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
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
                        </div>
                    }
                </div>
                <CardDescription>{project.description}</CardDescription>
                <div className="flex gap-1">
                    {project.languages.map((lang) => (
                        <Badge className="bg-accent text-accent-foreground">{lang.name}</Badge>
                    ))}
                </div>
            </CardHeader>
        </Card>
    );
}