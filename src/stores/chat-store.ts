import { create, type StateCreator } from "zustand";
import type { ChatMessageResource } from "@/api/generated/models";

interface ChatState {
	/** Painel do chat aberto na lateral direita. */
	isOpen: boolean;
	/** Conversa aberta dentro do painel (`null` = lista de conversas). */
	activeConversationId: string | null;
	/**
	 * Mensagens que chegaram pelo Reverb, por conversa. Ficam aqui em vez de no
	 * cache do React Query porque a listagem é paginada e invalidá-la a cada
	 * mensagem refaria todas as páginas — a tela mescla as duas fontes por id.
	 */
	liveMessages: Record<string, ChatMessageResource[]>;
	/**
	 * Último `read_at` recebido no evento `.messages.read`, por conversa: todas as
	 * minhas mensagens criadas até ali estão lidas (✓✓), inclusive as que já
	 * tinham vindo da API com `read_at: null`.
	 */
	readAt: Record<string, string>;
}

interface ChatActions {
	open: () => void;
	close: () => void;
	toggle: () => void;
	/** Abre o painel já dentro de uma conversa. */
	openConversation: (conversationId: string) => void;
	/** Volta para a lista de conversas sem fechar o painel. */
	closeConversation: () => void;
	pushLiveMessage: (message: ChatMessageResource) => void;
	setReadAt: (conversationId: string, readAt: string) => void;
}

type ChatStore = ChatState & ChatActions;

const chatStoreCreator: StateCreator<ChatStore> = (set) => ({
	isOpen: false,
	activeConversationId: null,
	liveMessages: {},
	readAt: {},

	open: () => set({ isOpen: true }),

	close: () => set({ isOpen: false }),

	toggle: () => set((state) => ({ isOpen: !state.isOpen })),

	openConversation: (conversationId) =>
		set({ isOpen: true, activeConversationId: conversationId }),

	closeConversation: () => set({ activeConversationId: null }),

	pushLiveMessage: (message) =>
		set((state) => {
			const current = state.liveMessages[message.conversation_id] ?? [];

			// O mesmo evento pode chegar duas vezes (reconexão do socket) e a resposta
			// do envio também entra aqui, então o id manda
			if (current.some((item) => item.id === message.id)) return state;

			return {
				liveMessages: {
					...state.liveMessages,
					[message.conversation_id]: [...current, message],
				},
			};
		}),

	setReadAt: (conversationId, readAt) =>
		set((state) => ({
			readAt: { ...state.readAt, [conversationId]: readAt },
		})),
});

export const useChatStore = create<ChatStore>(chatStoreCreator);
