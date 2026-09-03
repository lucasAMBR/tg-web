import { useTranslation } from "react-i18next";
import type { DevJobVacancyInterviewResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import {
	getInterviewStatus,
	type InterviewStatus,
} from "@/types/dev-job-vacancy-interview";

const BADGE_VARIANT: Record<
	InterviewStatus,
	"default" | "secondary" | "destructive" | "outline"
> = {
	awaiting_schedule: "secondary",
	awaiting_dev_confirmation: "secondary",
	awaiting_company_confirmation: "secondary",
	approved: "default",
	cancelled: "destructive",
	rejected: "destructive",
};

interface InterviewStatusBadgeProps {
	interview: DevJobVacancyInterviewResource;
}

export default function InterviewStatusBadge({
	interview,
}: InterviewStatusBadgeProps) {
	const { t } = useTranslation();

	const status = getInterviewStatus(interview);

	return (
		<Badge
			variant={BADGE_VARIANT[status] ?? "secondary"}
			className={
				status === "approved" ? "bg-emerald-500 text-white" : undefined
			}
		>
			{t(`enum.dev_job_vacancy_interview.status.${status}`)}
		</Badge>
	);
}
