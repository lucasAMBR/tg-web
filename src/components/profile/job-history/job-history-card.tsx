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
import { format } from "date-fns";
import { Edit, EllipsisVertical, Trash } from "lucide-react";

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
	const actual = job.is_current && !job.end_date;

	return (
		<Card className="p-4">
			<CardHeader className="p-0">
				<CardTitle className="flex justify-between items-center">
					<h2 className="text-lg font-bold flex gap-4 items-center">
						{job.position_name}{" "}
						{actual && (
							<Badge className="h-fit bg-green-700 dark:text-white font-bold">
								Actual
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
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuGroup>
									<DropdownMenuItem onClick={() => openUpdate(job)}>
										<Edit /> Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										variant="destructive"
										onClick={() => openDelete(job)}
									>
										<Trash /> Delete
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</CardTitle>
				<CardDescription>
					{`At ${job.company_name}, ${job.company_location}`} <br />
				</CardDescription>
				<div className="flex gap-6">
					<p className="text-muted-foreground text-sm font-normal">
						{`Start date: ${format(job.start_date, "dd/MM/yyyy")}`}
					</p>
					{!actual && (
						<p className="text-muted-foreground text-sm font-normal">
							{`End date: ${format(job.end_date as string, "dd/MM/yyyy")}`}
						</p>
					)}
				</div>
				<div className="flex gap-2">
					<Badge variant={"destructive"}>{job.seniority_level_label}</Badge>
					<Badge variant={"secondary"}>{job.contract_type_label}</Badge>
					<Badge>{job.employment_type_label}</Badge>
				</div>
			</CardHeader>
			<p>{job.actuation_details}</p>
		</Card>
	);
}
