import UnderConstruction from "@/components/global/under-construction"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CertificationsTab from "../certifications/certifications-tab"
import ProjectHistoryTab from "../project-history/project-history-tab"
import JobHistoryTab from "../job-history/job-history-tab"
import { Separator } from "@/components/ui/separator"
import AcademicBackgroundList from "../academic-background/academic-background-list"
import HardSkillList from "../hard-skill/hard-skill-list"
import SoftSkillList from "../soft-skill/soft-skill-list"
import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getIndexProjectHistoryQueryKey } from "@/api/generated/project-history-doc/project-history-doc"
import { getIndexEmploymentHistoryQueryKey } from "@/api/generated/employment-history-doc/employment-history-doc"
import { useTranslation } from "react-i18next"

interface DevProfileContentProps{
    profileId: string
}

export default function DevProfileContent({ profileId }: DevProfileContentProps){

    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const [tab, setTab] = useState("posts");
    
    useEffect(() => {
        if (tab === "projects") {
            queryClient.invalidateQueries({
                queryKey: getIndexProjectHistoryQueryKey(),
            });
        }
        if (tab === "job_history") {
            queryClient.invalidateQueries({
                queryKey: getIndexEmploymentHistoryQueryKey(),
            });
        }
    }, [tab]);

    return(
        <div className="flex-1 flex gap-4 mt-3">
            <div className="flex-2">
                <Tabs defaultValue={tab} onValueChange={setTab}>
                    <TabsList variant={"line"}>
                        <TabsTrigger className="text-xl cursor-pointer" value="posts">
                            {t("dev_profile.tabs.posts")}
                        </TabsTrigger>
                        <TabsTrigger className="text-xl cursor-pointer" value="projects">
                            {t("dev_profile.tabs.projects")}
                        </TabsTrigger>
                        <TabsTrigger
                            className="text-xl cursor-pointer"
                            value="job_history"
                        >
                            {t("dev_profile.tabs.job_history")}
                        </TabsTrigger>
                        <TabsTrigger
                            className="text-xl cursor-pointer"
                            value="certifications"
                        >
                            {t("dev_profile.tabs.certifications")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="mt-2">
                        <UnderConstruction />
                    </TabsContent>
                    <TabsContent value="certifications" className="mt-2">
                        <CertificationsTab profileId={profileId} />
                    </TabsContent>
                    <TabsContent value="projects" className="mt-2">
                        <ProjectHistoryTab profileId={profileId} />
                    </TabsContent>
                    <TabsContent value="job_history" className="mt-2">
                        <JobHistoryTab profileId={profileId} />
                    </TabsContent>
                </Tabs>
            </div>
            <Separator orientation="vertical" />
            <div className="flex-1 flex flex-col gap-6">
                <AcademicBackgroundList profileId={profileId} />
                <HardSkillList profileId={profileId} />
                <SoftSkillList profileId={profileId} />
            </div>
        </div>
    )
}