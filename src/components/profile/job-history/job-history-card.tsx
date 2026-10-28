import type { EmploymentHistoryResource } from "@/api/generated/models";
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
import { AlertCircle, Edit, EllipsisVertical, Eye, Hourglass, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";

interface JobHistoryCardProps {
	profileId: string;
	job: EmploymentHistoryResource;
	openDelete: (job: EmploymentHistoryResource) => void;
	openUpdate: (job: EmploymentHistoryResource) => void;
}

export default function JobHistoryCard({
	job,
	openDelete,
	openUpdate,
}: JobHistoryCardProps) {
	const { user } = useAuthStore();
	const { t, i18n } = useTranslation();
	const actual = job.is_current && !job.end_date;

	const hasTranslation = job.translation_status === 'translated';
	const translationIsPending = job.translation_status === 'pending';
	const translationIsError = job.translation_status === 'error';
	const translationInProgress = job.translation_status === 'translating';

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
					{user?.dev_profile?.id === job.dev_profile_id || user?.role.includes("admin") && (
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
