import { useTranslation } from "react-i18next";
import type { DevTechnicalChallengeResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { challengeWasDelivered } from "@/types/technical-challenge";

interface ChallengeStatusBadgeProps {
	devChallenge: DevTechnicalChallengeResource;
}

/** `pending` enquanto o dev não entrega a solução, `delivered` depois do envio. */
export default function ChallengeStatusBadge({
	devChallenge,
}: ChallengeStatusBadgeProps) {
	const { t } = useTranslation();

	const wasDelivered = challengeWasDelivered(devChallenge);

	return (
		<Badge
			variant={wasDelivered ? "default" : "secondary"}
			className={wasDelivered ? "bg-emerald-500 text-white" : undefined}
		>
			{t(`enum.dev_technical_challenge.status.${devChallenge.status}`)}
		</Badge>
	);
}
