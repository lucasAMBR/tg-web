import type { AxiosError } from "axios";
import { MessageSquare } from "lucide-react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { useOpenChatConversation } from "@/api/generated/chat/chat";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { onError } from "@/utils/on-error";

interface StartChatButtonProps
	extends Pick<
		ComponentProps<typeof Button>,
		"variant" | "size" | "className"
	> {
	/** Id do **usuário** dono do perfil (`user_id`), não o id do perfil. */
	userId: string | null | undefined;
	/** Texto do botão. Padrão: "Enviar mensagem". */
	label?: string;
	/**
	 * Mensagem deixada no campo de texto da conversa, sem enviar. A conversa não
	 * guarda de onde foi aberta, então o rascunho é o que dá o contexto.
	 */
	draft?: string;
}

/**
 * Abre a conversa com o usuário no painel do chat. `POST /chat` é idempotente,
 * então clicar de novo volta para a mesma conversa.
 */
export default function StartChatButton({
	userId,
	label,
	draft,
	variant = "outline",
	size,
	className,
}: StartChatButtonProps) {
	const { t } = useTranslation();

	const authenticatedUserId = useAuthStore((state) => state.user?.id);
	const openConversation = useChatStore((state) => state.openConversation);

	const { mutate: openChat, isPending } = useOpenChatConversation();

	// Não existe conversa consigo mesmo
	if (!userId || userId === authenticatedUserId) return null;

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			disabled={isPending}
			onClick={() =>
				openChat(
					{ data: { user_id: userId } },
					{
						onSuccess: (response) => openConversation(response.data.id, draft),
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
			{label ?? t("chat.send_message")}
		</Button>
	);
}
