import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	useMarkChatConversationAsRead,
	useStoreChatMessage,
} from "@/api/generated/chat/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
	getChatConversationsQueryKey,
	patchCachedConversation,
} from "@/hooks/use-chat-conversations";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { messageIsRead } from "@/types/chat";
import { onError } from "@/utils/on-error";
import MessageBubble from "./message-bubble";
import MessageComposer from "./message-composer";

interface ConversationViewProps {
	conversationId: string;
}

/** Histórico e envio de mensagens da conversa aberta no painel. */
export default function ConversationView({
	conversationId,
}: ConversationViewProps) {
	const { t, i18n } = useTranslation();

	const queryClient = useQueryClient();

	const userId = useAuthStore((state) => state.user?.id);
	const readAt = useChatStore((state) => state.readAt[conversationId]);
	const pushLiveMessage = useChatStore((state) => state.pushLiveMessage);

	const {
		messages,
		isLoading,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useChatMessages(conversationId);

	const { mutate: markAsRead } = useMarkChatConversationAsRead();
	const { mutateAsync: sendMessage, isPending: isSending } =
		useStoreChatMessage();

	const scrollRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const locale = i18n.language === "en" ? "en" : "pt";

	// A listagem vem da mais recente para a mais antiga, então a primeira recebida
	// é a última que chegou: quando ela muda, há o que marcar como lido
	const lastReceivedMessageId = messages.find(
		(message) => message.sender_id !== userId,
	)?.id;

	// A conversa está aberta e visível: a leitura é registrada ao abrir e a cada
	// mensagem nova que chega enquanto ela continua na tela
	useEffect(() => {
		if (!lastReceivedMessageId || !userId) return;

		markAsRead(
			{ id: conversationId },
			{
				onSuccess: () => {
					patchCachedConversation(
						queryClient,
						userId,
						conversationId,
						(conversation) => ({ ...conversation, unread_count: 0 }),
					);
				},
			},
		);
	}, [conversationId, lastReceivedMessageId, markAsRead, queryClient, userId]);

	useEffect(() => {
		const sentinel = sentinelRef.current;

		if (!sentinel || !hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) fetchNextPage();
			},
			{ root: scrollRef.current },
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage, messages.length]);

	const handleSend = async (body: string) => {
		try {
			const response = await sendMessage({
				id: conversationId,
				data: { body },
			});

			const message = response.data;

			// O header `X-Socket-ID` evita o eco nesta aba, então a mensagem enviada
			// entra na tela pela resposta do próprio envio
			pushLiveMessage(message);

			const found = userId
				? patchCachedConversation(
						queryClient,
						userId,
						conversationId,
						(conversation) => ({
							...conversation,
							last_message: message,
							last_message_at: message.created_at,
						}),
					)
				: false;

			// Primeira mensagem da conversa: só a partir dela ela aparece em `GET /chat`
			if (!found) {
				queryClient.invalidateQueries({
					queryKey: getChatConversationsQueryKey(userId),
				});
			}
		} catch (error) {
			onError(error as AxiosError<{ message: string }>);
			throw error;
		}
	};

	return (
		<>
			{isLoading ? (
				<div className="flex flex-1 flex-col gap-2 p-4">
					<Skeleton className="h-12 w-2/3" />
					<Skeleton className="h-12 w-2/3 self-end" />
					<Skeleton className="h-12 w-1/2" />
				</div>
			) : (
				// `flex-col-reverse` mantém a visão presa na mensagem mais recente e
				// deixa o histórico mais antigo ser carregado ao rolar para cima
				<div
					ref={scrollRef}
					className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto p-4"
				>
					{messages.length === 0 && (
						<p className="m-auto text-center text-sm text-muted-foreground">
							{t("chat.start_conversation")}
						</p>
					)}
					{messages.map((message) => (
						<MessageBubble
							key={message.id}
							message={message}
							isMine={message.sender_id === userId}
							isRead={messageIsRead(message, readAt)}
							locale={locale}
						/>
					))}
					{hasNextPage && (
						<div ref={sentinelRef} className="flex justify-center py-2">
							<Spinner className="size-4" />
						</div>
					)}
				</div>
			)}
			<MessageComposer isSending={isSending} onSend={handleSend} />
		</>
	);
}
