import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, User, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShowChatConversation } from "@/api/generated/chat/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChatConversations } from "@/hooks/use-chat-conversations";
import { useChatRealtime } from "@/hooks/use-chat-realtime";
import { useChatStore } from "@/stores/chat-store";
import {
	getParticipantProfileHref,
	getParticipantProfilePic,
} from "@/types/chat";
import ConversationList from "./conversation-list";
import ConversationView from "./conversation-view";

/**
 * Painel do chat, fixo na lateral direita de todas as telas autenticadas. Fica
 * sempre montado — mesmo fechado — porque é ele que mantém a inscrição no canal
 * pessoal do chat, que alimenta o badge de não lidas do botão no header.
 */
export default function ChatPanel() {
	const { t } = useTranslation();

	const navigate = useNavigate();

	useChatRealtime();

	const isOpen = useChatStore((state) => state.isOpen);
	const activeConversationId = useChatStore(
		(state) => state.activeConversationId,
	);
	const close = useChatStore((state) => state.close);
	const closeConversation = useChatStore((state) => state.closeConversation);

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

	if (!isOpen) return null;

	const participant = activeConversation?.data.participant;
	const profilePic = getParticipantProfilePic(participant);
	const profileHref = getParticipantProfileHref(participant);

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
						<button
							type="button"
							disabled={!profileHref}
							onClick={() => {
								if (profileHref) navigate({ to: profileHref });
							}}
							className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
						>
							<Avatar className="size-9 shrink-0">
								{profilePic && (
									<AvatarImage
										src={profilePic}
										alt={participant?.name ?? ""}
										className="object-cover"
									/>
								)}
								<AvatarFallback className="bg-primary text-primary-foreground">
									<User className="size-4" />
								</AvatarFallback>
							</Avatar>
							<div className="flex min-w-0 flex-col">
								<span className="truncate font-medium">
									{participant?.name ?? t("chat.unknown_participant")}
								</span>
								{participant?.role && (
									<span className="truncate text-xs text-muted-foreground">
										{t(`role.${participant.role}`)}
									</span>
								)}
							</div>
						</button>
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
				/>
			)}
		</aside>
	);
}
