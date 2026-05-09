import UnderConstruction from "@/components/global/under-construction";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import CompanyProjectTab from "../company-project/company-project-tab";
import CompanyStackList from "../company-stack/company-stack-list";
import CompanySoftSkillList from "../company-soft-skills/company-soft-skill-list";

interface CompanyProfileBodyProps{
    profileId: string
}

export default function CompanyProfileBody({profileId}: CompanyProfileBodyProps) {
    
    const queryClient = useQueryClient();

    const [tab, setTab] = useState("posts");

    return(
        <div className="flex-1 flex gap-4 mt-3">
            <div className="flex-2">
                <Tabs defaultValue={tab} onValueChange={setTab}>
                    <TabsList variant={"line"}>
                        <TabsTrigger className="text-xl cursor-pointer" value="posts">
                            Posts
                        </TabsTrigger>
                        <TabsTrigger className="text-xl cursor-pointer" value="projects">
                            Projects
                        </TabsTrigger>
                        <TabsTrigger className="text-xl cursor-pointer" value="open_jobs">
                            Open Jobs
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="mt-2">
                        <UnderConstruction />
                    </TabsContent>
                    <TabsContent value="projects" className="mt-2">
                        <CompanyProjectTab profileId={profileId}/>
                    </TabsContent>
                    <TabsContent value="open_jobs" className="mt-2">
                        <UnderConstruction />
                    </TabsContent>
                </Tabs>
            </div>
            <Separator orientation="vertical" />
            <div className="flex-1 flex flex-col gap-6">
                <CompanyStackList profileId={profileId} />
                <CompanySoftSkillList profileId={profileId} />
            </div>
        </div>
    )
}