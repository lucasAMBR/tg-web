import { useRouter } from "@tanstack/react-router";
import { Check, CheckCheck } from "lucide-react";
import type { MouseEvent } from "react";
import type { ChatMessageResource } from "@/api/generated/models";
import { formatDateTime } from "@/utils/formatter";

/** URLs http(s) no texto, sem a pontuação que costuma fechar a frase. */
const URL_PATTERN = /(https?:\/\/[^\s]*[^\s.,;:!?)\]'"])/g;

interface MessageLinkProps {
	href: string;
	isMine: boolean;
}

/**
 * Link dentro da mensagem. Os que apontam para o próprio front (como o link da
 * vaga no convite para o processo seletivo) navegam sem recarregar a página; os
 * de fora abrem em outra aba.
 */
function MessageLink({ href, isMine }: MessageLinkProps) {
	const router = useRouter();

	let url: URL | null = null;

	try {
		url = new URL(href);
	} catch {
		url = null;
	}

	const isInternal = url?.origin === window.location.origin;

	const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
		// Ctrl/Cmd + clique e afins seguem o comportamento normal do navegador
		if (
			!url ||
			!isInternal ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();
		router.navigate({ href: `${url.pathname}${url.search}${url.hash}` });
	};

	return (
		<a
			href={href}
			onClick={handleClick}
			{...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
			className={`break-all underline underline-offset-2 ${
				isMine ? "" : "text-primary"
			}`}
		>
			{href}
		</a>
	);
}

/** O texto da mensagem com as URLs viradas em link. */
function MessageBody({ body, isMine }: { body: string; isMine: boolean }) {
	// Com o grupo de captura no split, as URLs ficam nas posições ímpares
	return body.split(URL_PATTERN).map((part, index) =>
		index % 2 === 1 ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: as partes do texto não mudam de ordem
			<MessageLink key={index} href={part} isMine={isMine} />
		) : (
			part
		),
	);
}

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
					<MessageBody body={message.body} isMine={isMine} />
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
