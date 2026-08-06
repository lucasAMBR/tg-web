import { useListDevSoftSkill } from "@/api/generated/soft-skill/soft-skill";

import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { UserCircle } from "lucide-react";
import SoftSkillCard from "./soft-skill-card";
import { Card } from "@/components/ui/card";
import RegisterSoftSkillModal from "./register-soft-skills-modal";
import UpdateSoftSkillModal from "./update-dev-soft-skills-modal";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";

interface SoftSkillListProps {
	profileId: string;
}

export default function SoftSkillList({ profileId }: SoftSkillListProps) {
	const { user } = useAuthStore();
	const { t } = useTranslation();

	const { data: softSkills, isLoading } = useListDevSoftSkill(profileId);

	const softSkillList = softSkills?.data ?? [];

	return (
		<div className="w-full flex flex-col gap-4">
			<h2 className="text-3xl flex justify-between">
				<span className="font-[Anta]">{t("dev_profile.soft_skills.title")}</span>
				
				{user?.dev_profile?.id === profileId && (
					<>
					{softSkillList.length < 1 && (
						<RegisterSoftSkillModal profileId={profileId} />
					)}
					{softSkillList.length > 1 && (
						<UpdateSoftSkillModal
							profileId={profileId}
							initialData={softSkillList}
						/>
					)}
					</>
				)}
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
									<UserCircle />
								</EmptyMedia>
								<EmptyTitle>{t("dev_profile.soft_skills.no_soft_skills")}</EmptyTitle>
							</EmptyHeader>
						</Empty>
					</Card>
				)}
				{!isLoading &&
					softSkillList.map((skill) => (
						<SoftSkillCard
							key={skill.id}
							devSoftSkill={skill}
						/>
					))}
			</div>
		</div>
	);
}
