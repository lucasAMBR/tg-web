import { useTranslation } from "react-i18next";
import type { DevScreeningQuestionnaireResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { screeningWasAnswered } from "@/types/screening-questionnaire";

interface ScreeningStatusBadgeProps {
	devQuestionnaire: DevScreeningQuestionnaireResource;
}

/** `pending` enquanto o dev não envia as respostas, `answered` depois do envio. */
export default function ScreeningStatusBadge({
	devQuestionnaire,
}: ScreeningStatusBadgeProps) {
	const { t } = useTranslation();

	const wasAnswered = screeningWasAnswered(devQuestionnaire);

	return (
		<Badge
			variant={wasAnswered ? "default" : "secondary"}
			className={wasAnswered ? "bg-emerald-500 text-white" : undefined}
		>
			{t(`enum.screening_questionnaire.status.${devQuestionnaire.status}`)}
		</Badge>
	);
}
