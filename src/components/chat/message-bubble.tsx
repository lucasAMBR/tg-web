import { Check, CheckCheck } from "lucide-react";
import type { ChatMessageResource } from "@/api/generated/models";
import { formatDateTime } from "@/utils/formatter";

interface MessageBubbleProps {
	message: ChatMessageResource;
	/** Enviada pelo usuário autenticado: muda o lado e mostra a confirmação. */
	isMine: boolean;
	isRead: boolean;
	locale: "pt" | "en";
}

/** Uma mensagem na conversa, com o horário e a confirmação de leitura. */
export default function MessageBubble({
	message,
	isMine,
	isRead,
	locale,
}: MessageBubbleProps) {
	return (
		<div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
			<div
				// No tema escuro o `muted` é praticamente o fundo do painel, então a
				// mensagem recebida usa o `accent` com borda para ter corpo nos dois temas
				className={`flex max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 ${
					isMine
						? "bg-primary text-primary-foreground"
						: "border border-border bg-accent text-accent-foreground"
				}`}
			>
				<p className="text-sm break-words whitespace-pre-wrap">
					{message.body}
				</p>
				<div
					className={`flex items-center gap-1 self-end text-[10px] ${
						isMine ? "text-primary-foreground/70" : "text-muted-foreground"
					}`}
				>
					<span>
						{formatDateTime(message.created_at, {
							locale,
							pattern: "HH:mm",
						})}
					</span>
					{isMine &&
						(isRead ? (
							<CheckCheck className="size-3" />
						) : (
							<Check className="size-3" />
						))}
				</div>
			</div>
		</div>
	);
}
