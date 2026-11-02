import UnderConstruction from "@/components/global/under-construction";
import ProfilePostsTab from "@/components/social/profile-posts-tab";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import CompanyProjectTab from "../company-project/company-project-tab";
import CompanyStackList from "../company-stack/company-stack-list";
import CompanySoftSkillList from "../company-soft-skills/company-soft-skill-list";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompanyProfileBodyProps{
    profileId: string
    /** Id do usuário dono do perfil — a aba de publicações filtra o feed por ele. */
    userId: string | undefined
}

export default function CompanyProfileBody({profileId, userId}: CompanyProfileBodyProps) {
    
    const { t } = useTranslation();

    const [tab, setTab] = useState("posts");

    // No celular a coluna lateral não cabe ao lado das abas e vira a aba "Sobre"
    const isMobile = useIsMobile();
    const activeTab = !isMobile && tab === "about" ? "posts" : tab;

    const aside = (
        <>
            <CompanyStackList profileId={profileId} />
            <CompanySoftSkillList profileId={profileId} />
        </>
    );

    return(
        <div className="flex-1 flex gap-4 mt-3">
            <div className="flex-2 max-md:min-w-0">
                <Tabs value={activeTab} onValueChange={setTab}>
                    <TabsList variant={"line"}>
                        <TabsTrigger className="text-base md:text-xl cursor-pointer" value="posts">
                            {t("company_profile.tabs.posts")}
                        </TabsTrigger>
                        <TabsTrigger className="text-base md:text-xl cursor-pointer" value="projects">
                            {t("company_profile.tabs.projects")}
                        </TabsTrigger>
                        <TabsTrigger className="text-base md:text-xl cursor-pointer" value="open_jobs">
                            {t("company_profile.tabs.open_jobs")}
                        </TabsTrigger>
                        {isMobile && (
                            <TabsTrigger className="text-base md:text-xl cursor-pointer" value="about">
                                {t("company_profile.tabs.about")}
                            </TabsTrigger>
                        )}
                    </TabsList>
                    <TabsContent value="posts" className="mt-2">
                        <ProfilePostsTab userId={userId} />
                    </TabsContent>
                    <TabsContent value="projects" className="mt-2">
                        <CompanyProjectTab profileId={profileId}/>
                    </TabsContent>
                    <TabsContent value="open_jobs" className="mt-2">
                        <UnderConstruction />
                    </TabsContent>
                    {isMobile && (
                        <TabsContent value="about" className="mt-2 flex flex-col gap-6">
                            {aside}
                        </TabsContent>
                    )}
                </Tabs>
            </div>
            {!isMobile && (
                <>
                    <Separator orientation="vertical" />
                    <div className="flex-1 flex flex-col gap-6">
                        {aside}
                    </div>
                </>
            )}
        </div>
    )
}