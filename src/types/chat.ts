import { isToday, isValid, parseISO } from "date-fns";
import type {
	ChatConversationResource,
	ChatMessageResource,
	ChatParticipantResource,
} from "@/api/generated/models";

export { dedupeById } from "@/utils/dedupe-by-id";

/** Limite do `body` no `StoreChatMessageRequest`. */
export const CHAT_MESSAGE_MAX_LENGTH = 2000;

/** Conversas por página em `GET /chat` (padrão da API). */
export const CHAT_CONVERSATIONS_PER_PAGE = 20;

/** Mensagens por página em `GET /chat/{id}/messages` (padrão da API). */
export const CHAT_MESSAGES_PER_PAGE = 30;

/** Payload do evento `.messages.read` do canal pessoal do chat. */
export interface ChatMessagesReadEvent {
	conversation_id: string;
	/** Quem leu — comparar com o próprio id para saber se foi em outra aba. */
	reader_id: string;
	/** Toda mensagem criada até aqui está lida. */
	read_at: string;
}

/**
 * O contrato gerado tipa `profile_pic` do participante como string, mas o campo
 * carrega o atributo cru do usuário: um objeto com as urls da mídia, ou `null`.
 */
export function getParticipantProfilePic(
	participant: ChatParticipantResource | undefined,
): string | undefined {
	const profilePic = participant?.profile_pic as
		| { original_url?: string; thumb_url?: string }
		| string
		| null
		| undefined;

	if (!profilePic) return undefined;

	if (typeof profilePic === "string") return profilePic;

	return profilePic.thumb_url ?? profilePic.original_url ?? undefined;
}

/**
 * Rota do perfil do participante, para a conversa levar até ele. Ausente quando o
 * usuário ainda não criou o perfil ou quando a role não tem tela pública (admin).
 */
export function getParticipantProfileHref(
	participant: ChatParticipantResource | undefined,
): string | undefined {
	if (!participant?.profile_id) return undefined;

	if (participant.role === "dev") return `/devs/${participant.profile_id}`;
	if (participant.role === "company") {
		return `/companies/${participant.profile_id}`;
	}
	if (participant.role === "client") {
		return `/clients/${participant.profile_id}`;
	}

	return undefined;
}

/** Da mensagem mais recente para a mais antiga, como a API devolve a listagem. */
export function sortMessagesDesc(
	messages: ChatMessageResource[],
): ChatMessageResource[] {
	return [...messages].sort(
		(first, second) =>
			toTime(second.created_at) - toTime(first.created_at) ||
			second.id.localeCompare(first.id),
	);
}

/** Da conversa com mensagem mais recente para a mais antiga. */
export function sortConversationsDesc<T extends ChatConversationResource>(
	conversations: T[],
): T[] {
	return [...conversations].sort(
		(first, second) =>
			toTime(second.last_message_at ?? second.created_at) -
			toTime(first.last_message_at ?? first.created_at),
	);
}

/**
 * Se a mensagem já foi lida pelo outro lado. O `read_at` do recurso é a fonte da
 * verdade; o `readAt` recebido pelo evento `.messages.read` cobre as mensagens que
 * já estavam na tela quando a leitura aconteceu — ele vale para tudo o que foi
 * criado até aquele momento.
 */
export function messageIsRead(
	message: ChatMessageResource,
	conversationReadAt?: string,
): boolean {
	if (message.read_at) return true;

	if (!conversationReadAt) return false;

	return toTime(message.created_at) <= toTime(conversationReadAt);
}

/** Horário curto para a lista de conversas: só a hora no dia de hoje, senão a data. */
export function formatConversationTime(
	value: string | null | undefined,
	locale: "pt" | "en",
): string {
	if (!value) return "";

	const date = parseISO(value);

	if (!isValid(date)) return "";

	if (isToday(date)) {
		return date.toLocaleTimeString(locale === "en" ? "en-US" : "pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	return date.toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", {
		day: "2-digit",
		month: "2-digit",
	});
}

function toTime(value: string | null | undefined): number {
	if (!value) return 0;

	const date = parseISO(value);

	return isValid(date) ? date.getTime() : 0;
}
