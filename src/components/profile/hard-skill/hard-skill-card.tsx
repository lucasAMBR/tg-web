import type { HardSkillModel } from "@/api/generated/models";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";

interface HardSkillCardProps {
	hardSkill: HardSkillModel;
	openDelete: (hardSkill: HardSkillModel) => void;
	openUpdate: (hardSkill: HardSkillModel) => void;
}

export default function HardSkillCard({
	hardSkill,
	openDelete,
	openUpdate,
}: HardSkillCardProps) {
	const { t } = useTranslation();
	const { user } = useAuthStore();

	return (
		<Card className="flex flex-row justify-between items-center p-3 gap-2">
			<span className="font-bold">{hardSkill.language.name}</span>
			<div className="flex items-center gap-2">
				<Badge className="font-bold">{t(`enum.hard_skill_levels.${hardSkill.skill_level}`)}</Badge>
				{user?.dev_profile?.id === hardSkill.dev_profile_id || user?.role.includes("admin") && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size={"icon"} variant={"ghost"}>
							<EllipsisVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom">
						<DropdownMenuLabel>{t("general.actions")}</DropdownMenuLabel>
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={() => openUpdate(hardSkill)}>
								<Edit /> {t("general.update")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => openDelete(hardSkill)}
								variant="destructive"
							>
								<Trash /> {t("general.delete")}
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
				)}
			</div>
		</Card>
	);
}
