import { useIndexCompanySoftSkills } from "@/api/generated/soft-skill-doc/soft-skill-doc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Brackets, Edit, Plus } from "lucide-react";
import AddCompanySoftSkillDialog from "./add-company-soft-skill-dialog";
import { useState } from "react";

interface CompanySoftSkillListProps{
    profileId: string
}

export default function CompanySoftSkillList({ profileId }: CompanySoftSkillListProps) {

    const {
        data: softSkills,
        isLoading
    } = useIndexCompanySoftSkills(profileId);

    const softSkillList = softSkills?.data ?? []

	const [open, setOpen] = useState(false);

    return (
        <div className="w-full flex flex-col gap-4">
			<h2 className="text-3xl flex justify-between">
				<span className="font-[Anta]">Valued skills</span>
                <Button onClick={() => setOpen(true)} variant={"outline"}>
					{!isLoading && softSkillList.length > 0 ? <Edit /> : <Plus />}
                    {!isLoading && softSkillList.length > 0 ? "Edit" : "Add"}
                </Button>
			</h2>
			<div className="flex flex-col gap-2">
				{isLoading && (
					<div className="flex items-center justify-center">
						<Spinner /> loading...
					</div>
				)}
				{!isLoading && softSkillList.length < 1 && (
					<Card className="p-0">
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant={"icon"}>
									<Brackets />
								</EmptyMedia>
								<EmptyTitle>No valued skills yet</EmptyTitle>
								<EmptyContent></EmptyContent>
								<EmptyDescription>
									You haven&apos;t registered any value skills yet, they are used to let the developers know what soft skill your corporation values, and the algorithm uses this to recommend the perfect dev for you!
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Button>Add</Button>
							</EmptyContent>
						</Empty>
					</Card>
				)}
				{!isLoading &&
                    softSkillList.map((skill) => (
                        <Card className="p-4">
                            <p className="font-bold">{skill.soft_skill.name}</p>
                        </Card>
                    ))
                }
			</div>
			<AddCompanySoftSkillDialog profileId={profileId} open={open} openChange={setOpen} initialData={softSkillList} />
        </div>
    );
}