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
	AlertCircle,
	BadgeCheck,
	Edit,
	EllipsisVertical,
	Eye,
	GraduationCap,
	Hourglass,
	School,
	Trash,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AcademicBackgroundCardProps {
	profileId: string;
	background: AcademicBackgroundModel;
	openDelete: (bg: AcademicBackgroundModel) => void;
	openUpdate: (bg: AcademicBackgroundModel) => void;
}
export default function AcademicBackgroundCard({
	background,
	openDelete,
	openUpdate,
}: AcademicBackgroundCardProps) {
	const { t, i18n } = useTranslation();

	const hasTranslation = background.translation_status === 'translated';
	const translationIsPending = background.translation_status === 'pending';
	const translationIsError = background.translation_status === 'error';
	const translationInProgress = background.translation_status === 'translating';

	const [showOriginalContent, setShowOriginalContent] = useState<boolean>(hasTranslation ? false : true);

	return (
		<Card className="p-0 bg-accent border-accent overflow-hidden gap-0">
			{hasTranslation && (
				<div onClick={() => setShowOriginalContent(!showOriginalContent)} className="p-2 text-primary ml-2 text-accent-foreground cursor-pointer text-sm flex items-center gap-1">
					<Eye className="size-3.5" />
					{showOriginalContent ? t("general.display_translated_content") : t("general.display_original_content")}
				</div>
			)}
			{translationIsPending && (
				<div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
					<Hourglass className="size-3.5" />
					{t("general.translation_pending")}
				</div>
			)}
			{translationIsError && (
				<div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
					<AlertCircle className="size-3.5" />
					{t("general.translation_error")}
				</div>
			)}
			{translationInProgress && (
				<div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
					<Hourglass className="size-3.5" />
					{t("general.translation_in_progress")}
				</div>
			)}
			<div className="p-4 bg-card rounded-xl">
			<CardHeader className="p-0">
				<div className="flex justify-between">
					<div className="flex flex-col gap-2">
						<CardTitle className="flex items-center gap-2">
							{showOriginalContent
							? background.degree
							: i18n.language === "pt"
								? (background.degree_pt as string)
								: (background.degree_en as string)}{" "}
							{background.is_verified && (
								<Badge className="bg-blue-700 text-white">
									<BadgeCheck /> {t("general.verified")}
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
								{t(`enum.degree_level.${background.degree_level}`)}
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
							<DropdownMenuLabel>{t("general.actions")}</DropdownMenuLabel>
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => openUpdate(background)}>
									<Edit /> {t("general.update")}
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={() => openDelete(background)}
								>
									<Trash /> {t("general.delete")}
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			</div>
		</Card>
	);
}
