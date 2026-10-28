import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/types/chat";

interface MessageComposerProps {
	isSending: boolean;
	onSend: (body: string) => Promise<void>;
	/** Rascunho deixado por quem abriu a conversa. Vai para o campo, sem enviar. */
	draft?: string;
	onDraftApplied?: () => void;
}

/** Campo de envio: Enter manda, Shift+Enter quebra a linha. */
export default function MessageComposer({
	isSending,
	onSend,
	draft,
	onDraftApplied,
}: MessageComposerProps) {
	const { t } = useTranslation();

	const [body, setBody] = useState("");

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (draft === undefined) return;

		setBody(draft.slice(0, CHAT_MESSAGE_MAX_LENGTH));
		textareaRef.current?.focus();
		onDraftApplied?.();
	}, [draft, onDraftApplied]);

	const trimmed = body.trim();
	const canSend = trimmed.length > 0 && !isSending;

	const handleSend = async () => {
		if (!canSend) return;

		// Limpa antes da resposta para a digitação seguinte não esperar a API; se o
		// envio falhar o texto volta para o campo
		setBody("");

		try {
			await onSend(trimmed);
		} catch {
			setBody(trimmed);
		}
	};

	return (
		<div className="flex shrink-0 items-end gap-2 border-t border-border p-3">
			<Textarea
				ref={textareaRef}
				value={body}
				onChange={(event) => setBody(event.target.value)}
				onKeyDown={(event) => {
					if (event.key !== "Enter" || event.shiftKey) return;

					event.preventDefault();
					handleSend();
				}}
				maxLength={CHAT_MESSAGE_MAX_LENGTH}
				placeholder={t("chat.message_placeholder")}
				rows={1}
				className="max-h-32 min-h-10 resize-none"
			/>
			<Button
				size="icon"
				disabled={!canSend}
				aria-label={t("chat.send")}
				onClick={handleSend}
			>
				{isSending ? (
					<Spinner className="size-4" />
				) : (
					<SendHorizontal className="size-4" />
				)}
			</Button>
		</div>
	);
}
