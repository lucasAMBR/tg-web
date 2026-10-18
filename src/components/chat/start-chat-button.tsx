import type { AxiosError } from "axios";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOpenChatConversation } from "@/api/generated/chat/chat";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { onError } from "@/utils/on-error";

interface StartChatButtonProps {
	/** Id do **usuário** dono do perfil (`user_id`), não o id do perfil. */
	userId: string | null | undefined;
}

/**
 * Abre a conversa com o usuário no painel do chat. `POST /chat` é idempotente,
 * então clicar de novo volta para a mesma conversa.
 */
export default function StartChatButton({ userId }: StartChatButtonProps) {
	const { t } = useTranslation();

	const authenticatedUserId = useAuthStore((state) => state.user?.id);
	const openConversation = useChatStore((state) => state.openConversation);

	const { mutate: openChat, isPending } = useOpenChatConversation();

	// Não existe conversa consigo mesmo
	if (!userId || userId === authenticatedUserId) return null;

	return (
		<Button
			variant="outline"
			disabled={isPending}
			onClick={() =>
				openChat(
					{ data: { user_id: userId } },
					{
						onSuccess: (response) => openConversation(response.data.id),
						onError: (error) =>
							onError(error as AxiosError<{ message: string }>),
					},
				)
			}
		>
			{isPending ? (
				<Spinner className="size-4" />
			) : (
				<MessageSquare className="size-4" />
			)}
			{t("chat.send_message")}
		</Button>
	);
}
