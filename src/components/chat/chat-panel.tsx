import { ArrowLeft, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShowChatConversation } from "@/api/generated/chat/chat";
import { Button } from "@/components/ui/button";
import { useChatConversations } from "@/hooks/use-chat-conversations";
import { useChatRealtime } from "@/hooks/use-chat-realtime";
import { useChatStore } from "@/stores/chat-store";
import ConversationList from "./conversation-list";
import ConversationParticipant from "./conversation-participant";
import ConversationView from "./conversation-view";

/**
 * Painel do chat, fixo na lateral direita de todas as telas autenticadas. Fica
 * sempre montado — mesmo fechado — porque é ele que mantém a inscrição no canal
 * pessoal do chat, que alimenta o badge de não lidas do botão no header.
 */
export default function ChatPanel() {
	const { t } = useTranslation();

	useChatRealtime();

	const isOpen = useChatStore((state) => state.isOpen);
	const isPageOpen = useChatStore((state) => state.isPageOpen);
	const activeConversationId = useChatStore(
		(state) => state.activeConversationId,
	);
	const close = useChatStore((state) => state.close);
	const closeConversation = useChatStore((state) => state.closeConversation);
	const openConversation = useChatStore((state) => state.openConversation);

	const {
		conversations,
		isLoading,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useChatConversations();

	// Uma conversa recém-aberta (ainda sem mensagens) não aparece em `GET /chat`,
	// então os dados do participante vêm do próprio registro
	const { data: activeConversation } = useShowChatConversation(
		activeConversationId as string,
		{ query: { enabled: Boolean(activeConversationId) } },
	);

	// Na tela de mensagens a conversa já está aberta no conteúdo da página
	if (!isOpen || isPageOpen) return null;

	return (
		<aside className="flex h-screen w-[380px] shrink-0 flex-col border-l border-border">
			<div className="flex h-18 shrink-0 items-center gap-2 border-b border-border px-4">
				{activeConversationId ? (
					<>
						<Button
							variant="ghost"
							size="icon"
							aria-label={t("general.back")}
							onClick={closeConversation}
						>
							<ArrowLeft className="size-4" />
						</Button>
						<ConversationParticipant
							participant={activeConversation?.data.participant}
						/>
					</>
				) : (
					<h2 className="flex-1 font-bold">{t("chat.title")}</h2>
				)}
				<Button
					variant="ghost"
					size="icon"
					aria-label={t("general.close")}
					onClick={close}
				>
					<X className="size-4" />
				</Button>
			</div>

			{activeConversationId ? (
				<ConversationView conversationId={activeConversationId} />
			) : (
				<ConversationList
					conversations={conversations}
					isLoading={isLoading}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					onReachEnd={fetchNextPage}
					onSelect={openConversation}
				/>
			)}
		</aside>
	);
}
