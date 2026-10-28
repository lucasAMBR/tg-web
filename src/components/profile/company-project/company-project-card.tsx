import type { CompanyProjectResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { externalHref } from "@/utils/external-href";
import { AlertCircle, Edit, EllipsisVertical, Eye, Hourglass, Link, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CompanyProjectCardProps{
    project: CompanyProjectResource,
    openDelete: (project: CompanyProjectResource) => void,
    openUpdate: (project: CompanyProjectResource) => void
}
export default function CompanyProjectCard({ project, openDelete, openUpdate }: CompanyProjectCardProps) {

    const { user } = useAuthStore();

    const { t, i18n } = useTranslation();

    const prod = project.prod_url?.trim();
    const gh = project.github_url?.trim();

    const hasTranslation = project.translation_status === 'translated';
    const translationIsPending = project.translation_status === 'pending';
    const translationIsError = project.translation_status === 'error';
    const translationInProgress = project.translation_status === 'translating';

    const [showOriginalContent, setShowOriginalContent] = useState<boolean>(hasTranslation ? false : true);

    return (
        <Card className="p-0 bg-accent border-accent overflow-hidden gap-0">
            {hasTranslation && (
                <div onClick={() => setShowOriginalContent(!showOriginalContent)} className="p-2 text-primary ml-2 text-accent-foreground cursor-pointer text-sm flex items-center gap-1">
                    <Eye className="size-3.5" />
                    {showOriginalContent ? t("general.display_translated_content") : t("general.display_original_content")}
                </div>
            )}
            {translationIsPending && (
                <div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
                    <Hourglass className="size-3.5" />
                    {t("general.translation_pending")}
                </div>
            )}
            {translationIsError && (
                <div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
                    <AlertCircle className="size-3.5" />
                    {t("general.translation_error")}
                </div>
            )}
            {translationInProgress && (
                <div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
                    <Hourglass className="size-3.5" />
                    {t("general.translation_in_progress")}
                </div>
            )}
            <div className="p-4 bg-card rounded-xl">
            <CardHeader className="p-0">
                <div className="flex justify-between gap-2 mb-2 items-start">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">
                            {showOriginalContent ? project.title : i18n.language === "pt"
                                ? project.title_pt
                                : project.title_en}
                        </CardTitle>
                    </div>
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
                            {(user?.company_profile?.id === project.company_profile_id || user?.role.includes("admin")) &&
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
                            }
                        </div>
                </div>
                <CardDescription>
                    {showOriginalContent ? project.description : i18n.language === "pt"
                        ? project.description_pt
                        : project.description_en}
                </CardDescription>
                <div className="flex gap-1">
                    {project.languages?.map((lang) => (
                        <Badge className="bg-accent text-accent-foreground">{lang.name}</Badge>
                    ))}
                </div>
            </CardHeader>
            </div>
        </Card>
    );
}