import type { DevSoftSkillModel } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical, Trash } from "lucide-react";

interface SoftSkillCardProps {
	devSoftSkill: DevSoftSkillModel;
	profileId: string;
	openDelete: (devSoftSkill: DevSoftSkillModel) => void;
	openUpdate: (devSoftSkill: DevSoftSkillModel) => void;
}

export default function SoftSkillCard({
	devSoftSkill,
	profileId,
	openDelete,
	openUpdate,
}: SoftSkillCardProps) {
	return (
		<Card className="flex flex-col p-3 gap-3">
			<div className="flex flex-row justify-between items-center w-full">
				<span className="font-bold">{devSoftSkill.soft_skill.name}</span>
				<div className="flex items-center gap-2">
					<Badge className="font-bold">
						{devSoftSkill.soft_skill_level_response.title}
					</Badge>
				</div>
			</div>
			<p className="text-foreground/80">
				{devSoftSkill.soft_skill_level_response.description}
			</p>
		</Card>
	);
}
