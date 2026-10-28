import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ChatMessageResource } from "@/api/generated/models";
import { getEcho } from "@/lib/echo";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import type { ChatMessagesReadEvent } from "@/types/chat";
import {
	getChatConversationsQueryKey,
	patchCachedConversation,
} from "./use-chat-conversations";

const getToken = () => useAuthStore.getState().token;

/**
 * Inscreve o usuário no canal pessoal do chat (`chat.{userId}`), por onde chegam
 * as mensagens de **todas** as conversas e as confirmações de leitura. Fica
 * montado junto do painel, mesmo com ele fechado, para o badge de não lidas e as
 * prévias da lista continuarem acompanhando em tempo real.
 */
export function useChatRealtime() {
	const userId = useAuthStore((state) => state.user?.id);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!userId) return;

		const echo = getEcho(getToken);
		const channelName = `chat.${userId}`;

		const handleMessageSent = (message: ChatMessageResource) => {
			const { isOpen, activeConversationId, pushLiveMessage } =
				useChatStore.getState();

			const isMine = message.sender_id === userId;
			// Conversa aberta e visível: a própria tela marca como lida, então nem
			// chega a contar como não lida
			const isVisible =
				isOpen && activeConversationId === message.conversation_id;

			pushLiveMessage(message);

			const found = patchCachedConversation(
				queryClient,
				userId,
				message.conversation_id,
				(conversation) => ({
					...conversation,
					last_message: message,
					last_message_at: message.created_at,
					unread_count:
						isMine || isVisible
							? conversation.unread_count
							: conversation.unread_count + 1,
				}),
			);

			// Primeira mensagem de uma conversa nova: ela ainda não aparecia na listagem
			if (!found) {
				queryClient.invalidateQueries({
					queryKey: getChatConversationsQueryKey(userId),
				});
			}
		};

		const handleMessagesRead = ({
			conversation_id,
			reader_id,
			read_at,
		}: ChatMessagesReadEvent) => {
			// Eu mesmo li, em outra aba ou dispositivo
			if (reader_id === userId) {
				patchCachedConversation(
					queryClient,
					userId,
					conversation_id,
					(conversation) => ({ ...conversation, unread_count: 0 }),
				);
				return;
			}

			// O outro participante leu: as minhas mensagens até aqui viram ✓✓
			useChatStore.getState().setReadAt(conversation_id, read_at);
		};

		echo
			.private(channelName)
			.listen(".message.sent", handleMessageSent)
			.listen(".messages.read", handleMessagesRead);

		return () => {
			echo.leaveChannel(`private-${channelName}`);
		};
	}, [userId, queryClient]);
}
