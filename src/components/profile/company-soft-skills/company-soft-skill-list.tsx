import { useIndexCompanySoftSkills } from "@/api/generated/soft-skill-doc/soft-skill-doc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Brackets, Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AddCompanySoftSkillDialog from "./add-company-soft-skill-dialog";

interface CompanySoftSkillListProps {
	profileId: string;
}

export default function CompanySoftSkillList({ profileId }: CompanySoftSkillListProps) {
	const { t } = useTranslation();

	const { data: softSkills, isLoading } = useIndexCompanySoftSkills(profileId);

	const softSkillList = softSkills?.data ?? [];

	const [open, setOpen] = useState(false);

	return (
		<div className="w-full flex flex-col gap-4">
			<h2 className="text-3xl flex justify-between">
				<span className="font-[Anta]">{t("company_profile.soft_skills.title")}</span>
				{softSkillList.length > 0 ? (
					<Button onClick={() => setOpen(true)} variant={"accent"}>
						<Edit /> {t("general.change")}
					</Button>
				) : (
					<Button onClick={() => setOpen(true)} variant={"accent"}>
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
				{!isLoading && softSkillList.length < 1 && (
					<Card className="p-0">
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant={"icon"}>
									<Brackets />
								</EmptyMedia>
								<EmptyTitle>{t("company_profile.soft_skills.no_soft_skills")}</EmptyTitle>
								<EmptyDescription>
									{t("company_profile.soft_skills.no_soft_skills_description")}
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</Card>
				)}
				{!isLoading &&
					softSkillList.map((skill) => (
						<Card key={skill.id} className="p-4">
							<p className="font-bold">{t(skill.soft_skill.i18n_name_key)}</p>
						</Card>
					))}
			</div>
			<AddCompanySoftSkillDialog
				profileId={profileId}
				open={open}
				openChange={setOpen}
				initialData={softSkillList}
			/>
		</div>
	);
}
