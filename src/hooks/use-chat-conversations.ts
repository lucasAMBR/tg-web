import {
	type InfiniteData,
	type QueryClient,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { indexChatConversation } from "@/api/generated/chat/chat";
import type {
	ChatConversationCollectionDataItem,
	IndexChatConversation200,
} from "@/api/generated/models";
import { useAuthStore } from "@/stores/auth-store";
import {
	CHAT_CONVERSATIONS_PER_PAGE,
	dedupeById,
	sortConversationsDesc,
} from "@/types/chat";

/** A listagem é por usuário, então o id entra na chave junto do cache. */
export const getChatConversationsQueryKey = (userId: string | undefined) =>
	["/chat", "infinite", userId] as const;

type ConversationsCache = InfiniteData<IndexChatConversation200>;

/**
 * Aplica um patch na conversa dentro do cache paginado. A alternativa seria
 * invalidar a listagem a cada mensagem, o que refaria todas as páginas carregadas.
 *
 * Devolve `false` quando a conversa não está no cache — é o caso da primeira
 * mensagem de uma conversa nova, que ainda não aparecia em `GET /chat`, e aí a
 * listagem precisa ser buscada de novo.
 */
export function patchCachedConversation(
	queryClient: QueryClient,
	userId: string,
	conversationId: string,
	patch: (
		conversation: ChatConversationCollectionDataItem,
	) => ChatConversationCollectionDataItem,
): boolean {
	let found = false;

	queryClient.setQueryData<ConversationsCache>(
		getChatConversationsQueryKey(userId),
		(current) => {
			if (!current) return current;

			return {
				...current,
				pages: current.pages.map((page) => {
					const hasConversation = page.data.data.some(
						(conversation) => conversation.id === conversationId,
					);

					if (!hasConversation) return page;

					found = true;

					return {
						...page,
						data: {
							...page.data,
							data: page.data.data.map((conversation) =>
								conversation.id === conversationId
									? patch(conversation)
									: conversation,
							),
						},
					};
				}),
			};
		},
	);

	return found;
}

/**
 * Conversas do usuário autenticado, com o total de não lidas para o badge do
 * botão do chat. A mesma chave serve o botão e o painel, então os dois leem do
 * mesmo cache sem duplicar requisição.
 */
export function useChatConversations() {
	const userId = useAuthStore((state) => state.user?.id);

	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
	} = useInfiniteQuery({
		queryKey: getChatConversationsQueryKey(userId),
		queryFn: ({ pageParam, signal }) =>
			indexChatConversation(
				{ page: pageParam, per_page: CHAT_CONVERSATIONS_PER_PAGE },
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { current_page, total_pages } = lastPage.data.pagination;

			return current_page < total_pages ? current_page + 1 : undefined;
		},
		enabled: Boolean(userId),
	});

	const conversations = useMemo(() => {
		const items = data?.pages.flatMap((page) => page.data.data) ?? [];

		// A API ordena por `last_message_at`, mas o tempo real reordena a lista sem
		// refazer as páginas — por isso a ordenação também acontece aqui
		return sortConversationsDesc(dedupeById(items));
	}, [data]);

	const unreadCount = conversations.reduce(
		(total, conversation) => total + conversation.unread_count,
		0,
	);

	return {
		conversations,
		unreadCount,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
	};
}
