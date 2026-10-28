import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Selo ao lado do nome quando a pessoa segue o usuário logado (`follows_you`).
 * Numa lista de outra pessoa, continua sendo em relação a quem está logado.
 */
export default function FollowsYouBadge({ className }: { className?: string }) {
	const { t } = useTranslation();

	return (
		<Badge variant={"outline"} className={cn("text-xs", className)}>
			{t("social.follow.follows_you")}
		</Badge>
	);
}
