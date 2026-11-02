import type { UserRole } from "@/types/AuthenticatedUser";
import { useCallback, useEffect, useMemo } from "react";
import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { type IndexNotificationParams, type NotificationResource } from "@/api/generated/models";
import { indexNotification, useMarkAllNotificationsAsRead } from "@/api/generated/notification/notification";
import { getEcho } from "@/lib/echo";
import { useNotificationStore } from "@/stores/notification-store";
import { onError } from "@/utils/on-error";
import { getBroadcastProfileType } from "@/utils/role-helper";

const PER_PAGE = 10;

const NO_NOTIFICATIONS: NotificationResource[] = [];

type NotificationPageParams = IndexNotificationParams & {
    page?: number;
    per_page?: number;
};

type NotificationPages = InfiniteData<Awaited<ReturnType<typeof indexNotification>>>;

interface UseNotificationsOptions {
    /**
     * Inscreve no canal do Reverb. Só quem fica montado o tempo todo (o sino do
     * header) deve se inscrever: sair do canal ao desmontar derruba a inscrição
     * de todo mundo.
     */
    realtime?: boolean;
}

export function useNotifications(profileType: UserRole | null | undefined, profileId: string | null, getToken: () => string | null, { realtime = true }: UseNotificationsOptions = {}) {
    const liveNotifications = useNotificationStore((state) => profileId ? state.liveNotifications[profileId] : undefined) ?? NO_NOTIFICATIONS;
    const clearLiveNotifications = useNotificationStore((state) => state.clearLiveNotifications);
    const markLiveNotificationsAsRead = useNotificationStore((state) => state.markLiveNotificationsAsRead);

    const queryClient = useQueryClient();

    const queryKey = ["/notification", "infinite", profileType, profileId] as const;

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam, signal }) => {
            const params: NotificationPageParams = { page: pageParam, per_page: PER_PAGE };

            return indexNotification(params, signal);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { current_page, total_pages } = lastPage.data.pagination;

            return current_page < total_pages ? current_page + 1 : undefined;
        },
        enabled: Boolean(profileType && profileId),
    });

    const fetchedNotifications = useMemo(
        () => data?.pages.flatMap((page) => page.data.data) ?? [],
        [data],
    );

    const notifications = useMemo(() => {
        const fetchedIds = new Set(fetchedNotifications.map((notification) => notification.id));

        return [
            ...liveNotifications.filter((notification) => !fetchedIds.has(notification.id)),
            ...fetchedNotifications,
        ];
    }, [liveNotifications, fetchedNotifications]);

    useEffect(() => {
        if( !realtime || !profileType || !profileId ) return;

        const echo = getEcho(getToken);
        const channelType = getBroadcastProfileType(profileType);

        const channelName = `notifications.${channelType}.${profileId}`;

        echo.private(channelName).listen('NotificationCreated', (payload: { notification: NotificationResource }) => {
            useNotificationStore.getState().pushLiveNotification(profileId, payload.notification);
        });

    return () => {
      echo.leaveChannel(`private-${channelName}`);
    };
  }, [realtime, profileType, profileId, getToken]);

  const unreadCount = notifications.filter((notification) => notification.read_at === null).length;

  const { mutate: markAllAsReadMutation, isPending: isMarkingAllAsRead } = useMarkAllNotificationsAsRead();

  const markAllAsRead = () =>
    markAllAsReadMutation(undefined, {
      onSuccess: () => {
        const readAt = new Date().toISOString();

        // O que já está na tela fica lido na hora; o refetch traz o `read_at` do servidor
        queryClient.setQueryData<NotificationPages>(queryKey, (current) => current && {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data.map((notification) => ({
                ...notification,
                read_at: notification.read_at ?? readAt,
              })),
            },
          })),
        });

        if (profileId) markLiveNotificationsAsRead(profileId, readAt);

        queryClient.invalidateQueries({ queryKey });
      },
      onError: (error) => onError(error as AxiosError<{ message: string }>),
    });

  const clear = useCallback(() => {
    if (profileId) clearLiveNotifications(profileId);
  }, [profileId, clearLiveNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAllAsRead,
    isMarkingAllAsRead,
    clear,
  };
}
