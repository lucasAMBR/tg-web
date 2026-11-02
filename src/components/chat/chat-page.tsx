import { ArrowLeft, MessagesSquare } from "lucide-react";
import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useShowChatConversation } from "@/api/generated/chat/chat";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { useChatConversations } from "@/hooks/use-chat-conversations";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import ConversationList from "./conversation-list";
import ConversationParticipant from "./conversation-participant";
import ConversationView from "./conversation-view";

/**
 * Tela de mensagens: a lista de conversas à esquerda e a selecionada ao lado. A
 * seleção é a mesma do painel lateral, que fica escondido enquanto a tela está
 * montada — a inscrição no tempo real continua com ele, no layout. No celular
 * as duas não cabem lado a lado: aparece a lista ou a conversa, com um voltar.
 */
export default function ChatPage() {
	const { t } = useTranslation();

	const activeConversationId = useChatStore(
		(state) => state.activeConversationId,
	);
	const selectConversation = useChatStore((state) => state.selectConversation);
	const closeConversation = useChatStore((state) => state.closeConversation);
	const openPage = useChatStore((state) => state.openPage);
	const closePage = useChatStore((state) => state.closePage);

	// Antes da pintura, para o painel aberto não piscar ao lado da tela
	useLayoutEffect(() => {
		openPage();

		return closePage;
	}, [openPage, closePage]);

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

	return (
		<div className="flex min-h-0 flex-1">
			<section
				className={cn(
					"w-full shrink-0 flex-col border-border md:flex md:w-[360px] md:border-r",
					activeConversationId ? "hidden" : "flex",
				)}
			>
				<div className="flex h-16 shrink-0 items-center border-b border-border px-4">
					<h2 className="font-bold">{t("chat.title")}</h2>
				</div>
				<ConversationList
					conversations={conversations}
					isLoading={isLoading}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					onReachEnd={fetchNextPage}
					activeConversationId={activeConversationId}
					onSelect={selectConversation}
				/>
			</section>

			<section
				className={cn(
					"min-w-0 flex-1 flex-col md:flex",
					activeConversationId ? "flex" : "hidden",
				)}
			>
				{activeConversationId ? (
					<>
						<div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden"
								aria-label={t("general.back")}
								onClick={closeConversation}
							>
								<ArrowLeft className="size-4" />
							</Button>
							<ConversationParticipant
								participant={activeConversation?.data.participant}
							/>
						</div>
						{/* A `key` zera o campo de texto e a rolagem ao trocar de conversa */}
						<ConversationView
							key={activeConversationId}
							conversationId={activeConversationId}
						/>
					</>
				) : (
					<Empty className="flex-1">
						<EmptyHeader>
							<EmptyMedia variant={"icon"}>
								<MessagesSquare />
							</EmptyMedia>
							<EmptyTitle>{t("chat.select_title")}</EmptyTitle>
							<EmptyDescription>
								{t("chat.select_description")}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</section>
		</div>
	);
}
