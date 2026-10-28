import type { DevSoftSkillResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
		
import { useTranslation } from "react-i18next";

interface SoftSkillCardProps {
	devSoftSkill: DevSoftSkillResource;
}

export default function SoftSkillCard({
	devSoftSkill
}: SoftSkillCardProps) {
	const { t } = useTranslation();
	return (
		<Card className="flex flex-col p-3 gap-3">
			<div className="flex flex-row justify-between items-center w-full">
				<span className="font-bold">{t(devSoftSkill.soft_skill.i18n_name_key ?? "")}</span>
				<div className="flex items-center gap-2">
					<Badge className="font-bold">
						{t(devSoftSkill.soft_skill_level_response.i18n_title_key ?? "")}
					</Badge>
				</div>
			</div>
			<p className="text-foreground/80">
				{t(devSoftSkill.soft_skill_level_response.i18n_description_key ?? "")}
			</p>
		</Card>
	);
}
