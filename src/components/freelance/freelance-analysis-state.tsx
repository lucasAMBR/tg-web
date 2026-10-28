import { Hourglass, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

interface FreelanceAnalysisStateProps {
	title: string;
	description: string;
	/** Há uma tentativa (automática ou manual) em andamento. */
	isRetrying?: boolean;
	onRetry: () => void;
}

/**
 * Estado do 409: o embedding (do freela ou do perfil do dev) ainda está sendo
 * gerado pela fila. O botão cancela a espera da tentativa automática e tenta na
 * hora.
 */
export default function FreelanceAnalysisState({
	title,
	description,
	isRetrying = false,
	onRetry,
}: FreelanceAnalysisStateProps) {
	const { t } = useTranslation();

	return (
		<Empty className="border">
			<EmptyHeader>
				<EmptyMedia variant={"icon"}>
					<Hourglass />
				</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button variant={"outline"} onClick={onRetry}>
					<RefreshCw className="size-4" />
					{t("freelance.retry")}
				</Button>
				{isRetrying && (
					<p className="flex items-center gap-2 text-xs text-muted-foreground">
						<Spinner className="size-3" />
						{t("freelance.analysis.retrying")}
					</p>
				)}
			</EmptyContent>
		</Empty>
	);
}
