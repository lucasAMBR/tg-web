import { create, type StateCreator } from "zustand";
import type { NotificationResource } from "@/api/generated/models";

interface NotificationState {
	/**
	 * Notificações que chegaram pelo Reverb, por perfil. Ficam aqui em vez do
	 * estado do hook para o sino do header e a tela de notificações mostrarem as
	 * mesmas — só o sino fica inscrito no canal.
	 */
	liveNotifications: Record<string, NotificationResource[]>;
}

interface NotificationActions {
	pushLiveNotification: (
		profileId: string,
		notification: NotificationResource,
	) => void;
	/** Preenche o `read_at` das que ainda não foram lidas. */
	markLiveNotificationsAsRead: (profileId: string, readAt: string) => void;
	clearLiveNotifications: (profileId: string) => void;
}

type NotificationStore = NotificationState & NotificationActions;

const notificationStoreCreator: StateCreator<NotificationStore> = (set) => ({
	liveNotifications: {},

	pushLiveNotification: (profileId, notification) =>
		set((state) => ({
			liveNotifications: {
				...state.liveNotifications,
				[profileId]: [
					notification,
					...(state.liveNotifications[profileId] ?? []),
				],
			},
		})),

	markLiveNotificationsAsRead: (profileId, readAt) =>
		set((state) => {
			const current = state.liveNotifications[profileId];

			if (!current) return state;

			return {
				liveNotifications: {
					...state.liveNotifications,
					[profileId]: current.map((notification) => ({
						...notification,
						read_at: notification.read_at ?? readAt,
					})),
				},
			};
		}),

	clearLiveNotifications: (profileId) =>
		set((state) => {
			if (!(profileId in state.liveNotifications)) return state;

			const { [profileId]: _, ...liveNotifications } =
				state.liveNotifications;

			return { liveNotifications };
		}),
});

export const useNotificationStore = create<NotificationStore>(
	notificationStoreCreator,
);
