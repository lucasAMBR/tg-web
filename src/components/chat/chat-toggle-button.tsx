import { useNavigate } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useChatConversations } from "@/hooks/use-chat-conversations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatStore } from "@/stores/chat-store";

/**
 * Abre e fecha o painel do chat. Fica no header, ao lado das notificações, e some
 * na tela de mensagens, onde o painel não aparece. No celular o painel não cabe
 * ao lado do conteúdo, então o botão leva direto para a tela de mensagens.
 */
export function ChatToggleButton() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const isMobile = useIsMobile();

	const isOpen = useChatStore((state) => state.isOpen);
	const toggle = useChatStore((state) => state.toggle);
	const isPageOpen = useChatStore((state) => state.isPageOpen);

	const { unreadCount } = useChatConversations();

	if (isPageOpen) return null;

	return (
		<Button
			variant="default"
			size="icon"
			aria-expanded={isOpen}
			aria-label={t("chat.title")}
			className="relative"
			onClick={() => (isMobile ? navigate({ to: "/chat" }) : toggle())}
		>
			<MessageSquare className="h-4 w-4" />
			{unreadCount > 0 && (
				<span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
					{unreadCount > 99 ? "99+" : unreadCount}
				</span>
			)}
		</Button>
	);
}
