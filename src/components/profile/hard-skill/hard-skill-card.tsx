import type { HardSkillModel } from "@/api/generated/models";
import { Card, CardHeader, CardTitle } from "../../ui/card";
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
	return (
		<Card className="flex flex-row justify-between items-center p-3 gap-2">
			<span className="font-bold">{hardSkill.language.name}</span>
			<div className="flex items-center gap-2">
				<Badge className="font-bold">{hardSkill.skill_level_label}</Badge>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size={"icon"} variant={"ghost"}>
							<EllipsisVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={() => openUpdate(hardSkill)}>
								<Edit /> Update
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => openDelete(hardSkill)}
								variant="destructive"
							>
								<Trash /> Delete
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</Card>
	);
}
