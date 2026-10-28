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
	/**
	 * Texto para deixar no campo de mensagem ao abrir a conversa, sem enviar. A
	 * conversa existe por par de usuários e não guarda de onde veio, então quem
	 * abre (a vaga freelance, por exemplo) deixa o contexto aqui.
	 */
	drafts: Record<string, string>;
}

interface ChatActions {
	open: () => void;
	close: () => void;
	toggle: () => void;
	/** Abre o painel já dentro de uma conversa, opcionalmente com um rascunho. */
	openConversation: (conversationId: string, draft?: string) => void;
	/** Volta para a lista de conversas sem fechar o painel. */
	closeConversation: () => void;
	pushLiveMessage: (message: ChatMessageResource) => void;
	setReadAt: (conversationId: string, readAt: string) => void;
	/** O campo de mensagem já recebeu o rascunho. */
	clearDraft: (conversationId: string) => void;
}

type ChatStore = ChatState & ChatActions;

const chatStoreCreator: StateCreator<ChatStore> = (set) => ({
	isOpen: false,
	activeConversationId: null,
	liveMessages: {},
	readAt: {},
	drafts: {},

	open: () => set({ isOpen: true }),

	close: () => set({ isOpen: false }),

	toggle: () => set((state) => ({ isOpen: !state.isOpen })),

	openConversation: (conversationId, draft) =>
		set((state) => ({
			isOpen: true,
			activeConversationId: conversationId,
			drafts:
				draft === undefined
					? state.drafts
					: { ...state.drafts, [conversationId]: draft },
		})),

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

	clearDraft: (conversationId) =>
		set((state) => {
			if (!(conversationId in state.drafts)) return state;

			const { [conversationId]: _, ...drafts } = state.drafts;

			return { drafts };
		}),
});

export const useChatStore = create<ChatStore>(chatStoreCreator);
