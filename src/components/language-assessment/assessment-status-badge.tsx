import { useTranslation } from "react-i18next";
import type { DevLanguageAssessmentResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { assessmentWasAnswered } from "@/types/language-assessment";

interface AssessmentStatusBadgeProps {
	devAssessment: DevLanguageAssessmentResource;
}

/** `pending` enquanto o dev não entrega a prova, `answered` depois da entrega. */
export default function AssessmentStatusBadge({
	devAssessment,
}: AssessmentStatusBadgeProps) {
	const { t } = useTranslation();

	const wasAnswered = assessmentWasAnswered(devAssessment);

	return (
		<Badge
			variant={wasAnswered ? "default" : "secondary"}
			className={wasAnswered ? "bg-emerald-500 text-white" : undefined}
		>
			{t(`enum.dev_language_assessment.status.${devAssessment.status}`)}
		</Badge>
	);
}
