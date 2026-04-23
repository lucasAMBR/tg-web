import type { AcademicBackgroundModel } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	BadgeCheck,
	Edit,
	EllipsisVertical,
	GraduationCap,
	School,
	Trash,
} from "lucide-react";

interface AcademicBackgroundCardProps {
	profileId: string;
	background: AcademicBackgroundModel;
	openDelete: (bg: AcademicBackgroundModel) => void;
	openUpdate: (bg: AcademicBackgroundModel) => void;
}
export default function AcademicBackgroundCard({
	profileId,
	background,
	openDelete,
	openUpdate,
}: AcademicBackgroundCardProps) {
	return (
		<Card className="p-4">
			<CardHeader className="p-0 m-0">
				<div className="flex justify-between">
					<div className="flex flex-col gap-2">
						<CardTitle className="flex items-center gap-2">
							{background.degree}{" "}
							{background.is_verified && (
								<Badge className="bg-blue-700 text-white">
									<BadgeCheck /> Verified
								</Badge>
							)}
						</CardTitle>
						<CardDescription className="flex gap-4">
							<span className="text-md font-normal text-muted-foreground flex items-start center gap-1">
								<School className="size-5" />
								{background.institution}
							</span>
							<span className="text-md font-normal text-muted-foreground flex items-start center gap-1">
								<GraduationCap className="size-5" />
								{background.degree_level_label}
							</span>
						</CardDescription>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size={"icon"} variant={"ghost"}>
								<EllipsisVertical />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => openUpdate(background)}>
									<Edit /> Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={() => openDelete(background)}
								>
									<Trash /> Delete
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
		</Card>
	);
}
