import { useGetCompanyStack } from "@/api/generated/company-stack/company-stack"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Brackets, Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CreateCompanyStackDialog from "./create-company-stack-dialog";

interface CompanyStackListProps{
    profileId: string
}

export default function CompanyStackList({ profileId }: CompanyStackListProps){
    const { t } = useTranslation();

    const {
        data: hardSkill,
        isLoading
    } = useGetCompanyStack(profileId);

    const hardSkillList = hardSkill?.data ?? [];

    const [ stackModalIsOpen, setStackModalIsOpen ] = useState<boolean>(false);

    return(
        <div className="w-full flex flex-col gap-4">
			<h2 className="text-3xl flex justify-between">
				<span className="font-[Anta]">{t("company_profile.stack.title")}</span>
                {hardSkillList.length > 0 ? (
                    <Button onClick={() => setStackModalIsOpen(true)} variant={"accent"}>
                        <Edit /> {t("general.change")}
                    </Button>
                ) : (
                    <Button onClick={() => setStackModalIsOpen(true)} variant={"accent"}>
                        <Plus /> {t("general.create")}
                    </Button>
                )}
			</h2>
			<div className="flex flex-col gap-2">
				{isLoading && (
					<div className="flex items-center justify-center">
						<Spinner />
					</div>
				)}
				{!isLoading && hardSkillList.length < 1 && (
					<Card className="p-0">
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant={"icon"}>
									<Brackets />
								</EmptyMedia>
								<EmptyTitle>{t("company_profile.stack.no_stack")}</EmptyTitle>
							</EmptyHeader>

						</Empty>
					</Card>
				)}
				{!isLoading &&
                    hardSkillList.map((skill) => (
                        <Card className="p-4">
                            <p className="font-bold">{skill.name}</p>
                        </Card>
                    ))
                }
			</div>
            <CreateCompanyStackDialog 
                profileId={profileId} 
                open={stackModalIsOpen} 
                openChange={setStackModalIsOpen} 
                initialData={hardSkillList} 
            />
        </div>
    )
}