import { AlertCircle, Eye, Hourglass } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TranslationStatusBarProps {
	/** `translation_status` do recurso: pending, translating, translated ou error. */
	status: string;
	showOriginal: boolean;
	onToggle: () => void;
}

/**
 * Faixa no topo dos cards com conteúdo traduzido pela API. Com a tradução
 * pronta, alterna entre ela e o original; antes disso, só avisa o status.
 */
export default function TranslationStatusBar({
	status,
	showOriginal,
	onToggle,
}: TranslationStatusBarProps) {
	const { t } = useTranslation();

	if (status === "translated") {
		return (
			<button
				type="button"
				onClick={onToggle}
				className="ml-2 flex cursor-pointer items-center gap-1 self-start p-2 text-sm text-accent-foreground"
			>
				<Eye className="size-3.5" />
				{showOriginal
					? t("general.display_translated_content")
					: t("general.display_original_content")}
			</button>
		);
	}

	if (status === "error") {
		return (
			<div className="ml-2 flex items-center gap-1 p-2 text-sm text-accent-foreground">
				<AlertCircle className="size-3.5" />
				{t("general.translation_error")}
			</div>
		);
	}

	return (
		<div className="ml-2 flex items-center gap-1 p-2 text-sm text-accent-foreground">
			<Hourglass className="size-3.5" />
			{status === "translating"
				? t("general.translation_in_progress")
				: t("general.translation_pending")}
		</div>
	);
}
