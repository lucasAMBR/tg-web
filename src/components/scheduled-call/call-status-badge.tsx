import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
	getCallStatus,
	type ScheduledCall,
	type ScheduledCallKind,
	type ScheduledCallStatus,
} from "@/types/scheduled-call";

const BADGE_VARIANT: Record<
	ScheduledCallStatus,
	"default" | "secondary" | "destructive" | "outline"
> = {
	awaiting_schedule: "secondary",
	awaiting_dev_confirmation: "secondary",
	awaiting_company_confirmation: "secondary",
	approved: "default",
	cancelled: "destructive",
	rejected: "destructive",
};

interface CallStatusBadgeProps {
	call: ScheduledCall;
	kind: ScheduledCallKind;
}

export default function CallStatusBadge({ call, kind }: CallStatusBadgeProps) {
	const { t } = useTranslation();

	const status = getCallStatus(call);

	return (
		<Badge
			variant={BADGE_VARIANT[status] ?? "secondary"}
			className={
				status === "approved" ? "bg-emerald-500 text-white" : undefined
			}
		>
			{t(`${kind.statusI18nPrefix}.${status}`)}
		</Badge>
	);
}
