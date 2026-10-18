import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { indexChatMessage } from "@/api/generated/chat/chat";
import { useChatStore } from "@/stores/chat-store";
import {
	CHAT_MESSAGES_PER_PAGE,
	dedupeById,
	sortMessagesDesc,
} from "@/types/chat";

export const getChatMessagesQueryKey = (conversationId: string | null) =>
	["/chat/messages", "infinite", conversationId] as const;

/**
 * Mensagens da conversa aberta, da mais recente para a mais antiga (a ordem da
 * API), já mescladas com as que chegaram pelo Reverb. As páginas seguintes são o
 * histórico mais antigo, carregado quando o usuário rola para cima.
 */
export function useChatMessages(conversationId: string | null) {
	const liveMessages = useChatStore(
		(state) => state.liveMessages[conversationId ?? ""],
	);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: getChatMessagesQueryKey(conversationId),
			queryFn: ({ pageParam, signal }) =>
				indexChatMessage(
					conversationId as string,
					{ page: pageParam, per_page: CHAT_MESSAGES_PER_PAGE },
					signal,
				),
			initialPageParam: 1,
			getNextPageParam: (lastPage) => {
				const { current_page, total_pages } = lastPage.data.pagination;

				return current_page < total_pages ? current_page + 1 : undefined;
			},
			enabled: Boolean(conversationId),
		});

	const messages = useMemo(() => {
		const fetched = data?.pages.flatMap((page) => page.data.data) ?? [];

		// Uma página pode repetir mensagens que já estão na tela quando chegam
		// mensagens novas durante a navegação no histórico: o id desempata
		return sortMessagesDesc(dedupeById([...(liveMessages ?? []), ...fetched]));
	}, [data, liveMessages]);

	return {
		messages,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	};
}
