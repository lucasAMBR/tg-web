import UnderConstruction from "@/components/global/under-construction";
import ProfilePostsTab from "@/components/social/profile-posts-tab";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface ClientProfileBodyProps{
    profileId: string
    /** Id do usuário dono do perfil — a aba de publicações filtra o feed por ele. */
    userId: string | undefined
}

export default function ClientProfileBody({ userId }: ClientProfileBodyProps) {

    const [tab, setTab] = useState("posts");

	return (
		<div className="flex-1 flex gap-4 mt-3">
            <div className="flex-2">
                <Tabs defaultValue={tab} onValueChange={setTab}>
                    <TabsList variant={"line"}>
                        <TabsTrigger className="text-xl cursor-pointer" value="posts">
                            Posts
                        </TabsTrigger>
                        <TabsTrigger className="text-xl cursor-pointer" value="open_jobs">
                            Freelance
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="mt-2">
                        <ProfilePostsTab userId={userId} />
                    </TabsContent>
                    <TabsContent value="open_jobs" className="mt-2">
                        <UnderConstruction />
                    </TabsContent>
                </Tabs>
            </div>
            <Separator orientation="vertical" />
            <div className="flex-1 flex flex-col gap-6">
            <div className="w-full flex flex-col gap-4">
			<h2 className="text-3xl flex justify-between">
				<span className="font-[Anta]">Reviews</span>
			</h2>
			<div className="flex flex-col gap-2">
                <UnderConstruction />
			</div>
            </div>
            </div>
        </div>
	)
}