import type { EmploymentHistoryModel } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
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
import { Edit, EllipsisVertical, Trash } from "lucide-react";
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
	const { t } = useTranslation();
	const actual = job.is_current && !job.end_date;

	return (
		<Card className="p-4">
			<CardHeader className="p-0">
				<CardTitle className="flex justify-between items-center">
					<h2 className="text-lg font-bold flex gap-4 items-center">
						{job.position_name}{" "}
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
			<p>{job.actuation_details}</p>
		</Card>
	);
}
