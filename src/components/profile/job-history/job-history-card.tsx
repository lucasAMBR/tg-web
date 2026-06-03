import type { EmploymentHistoryModel } from "@/api/generated/models";
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
import { formatIsoDateOnlyBr } from "@/utils/date-only";
import { Edit, EllipsisVertical, Eye, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface JobHistoryCardProps {
	profileId: string;
	job: EmploymentHistoryModel;
	openDelete: (job: EmploymentHistoryModel) => void;
	openUpdate: (job: EmploymentHistoryModel) => void;
}

export default function JobHistoryCard({
	profileId,
	job,
	openDelete,
	openUpdate,
}: JobHistoryCardProps) {
	const { t, i18n } = useTranslation();
	const actual = job.is_current && !job.end_date;
	const [showOriginalContent, setShowOriginalContent] = useState<boolean>(false);

	return (
		<Card className="p-0 bg-accent border-accent overflow-hidden gap-0">
			<div onClick={() => setShowOriginalContent(!showOriginalContent)} className="p-2 ml-2 text-accent-foreground cursor-pointer text-sm flex items-center gap-1">
				<Eye className="size-3.5" />
				{showOriginalContent ? t("general.showing_original_content") : t("general.showing_translated_content")}
			</div>
			<div className="p-4 bg-card rounded-xl">
			<CardHeader className="p-0">
				<CardTitle className="flex justify-between items-center">
					<h2 className="text-lg font-bold flex gap-4 items-center">
						{showOriginalContent
							? job.position_name
							: i18n.language === "pt"
								? (job.position_name_pt as string)
								: (job.position_name_en as string)}{" "}
						{actual && (
							<Badge className="h-fit bg-green-700 dark:text-white font-bold">
								{t("dev_profile.job_history.actual")}
							</Badge>
						)}
					</h2>
					{profileId === job.dev_profile_id && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size={"icon"} variant={"outline"}>
									<EllipsisVertical />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuLabel>{t("general.actions")}</DropdownMenuLabel>
								<DropdownMenuGroup>
									<DropdownMenuItem onClick={() => openUpdate(job)}>
										<Edit /> {t("general.update")}
									</DropdownMenuItem>
									<DropdownMenuItem
										variant="destructive"
										onClick={() => openDelete(job)}
									>
										<Trash /> {t("general.delete")}
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</CardTitle>
				<CardDescription>
					{`${t("dev_profile.job_history.at")} ${job.company_name}, ${job.company_location}`} <br />
				</CardDescription>
				<div className="flex gap-6">
					<p className="text-muted-foreground text-sm font-normal">
						{`${t("input.start_date")}: ${formatIsoDateOnlyBr(job.start_date)}`}
					</p>
					{!actual && (
						<p className="text-muted-foreground text-sm font-normal">
							{`${t("input.end_date")}: ${formatIsoDateOnlyBr(job.end_date as string)}`}
						</p>
					)}
				</div>
				<div className="flex gap-2">
					<Badge variant={"destructive"}>{t(`enum.seniority_level.${job.seniority_level}`)}</Badge>
					<Badge variant={"secondary"}>{t(`enum.contract_type.${job.contract_type}`)}</Badge>
					<Badge>{t(`enum.employment_type.${job.employment_type}`)}</Badge>
				</div>
			</CardHeader>
			<p className="mt-4">
				{showOriginalContent
					? job.actuation_details
					: i18n.language === "pt"
						? (job.actuation_details_pt as string)
						: (job.actuation_details_en as string)}
			</p>
			</div>
		</Card>
	);
}
