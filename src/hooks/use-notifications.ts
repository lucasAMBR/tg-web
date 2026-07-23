import type { UserRole } from "@/types/AuthenticatedUser";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type GetNotificationParams, type NotificationModel } from "@/api/generated/models";
import { getNotification } from "@/api/generated/notifications/notifications";
import { getEcho } from "@/lib/echo";
import { getBroadcastProfileType } from "@/utils/role-helper";

const PER_PAGE = 10;

type NotificationPageParams = GetNotificationParams & {
    page?: number;
    per_page?: number;
};

export function useNotifications(profileType: UserRole | null | undefined, profileId: string | null, getToken: () => string | null) {
    const [liveNotifications, setLiveNotifications] = useState<NotificationModel[]>([]);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["/notification", "infinite", profileType, profileId] as const,
        queryFn: ({ pageParam, signal }) => {
            const params: NotificationPageParams = { page: pageParam, per_page: PER_PAGE };

            return getNotification(params, signal);
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
        if( !profileType || !profileId ) return;

        const echo = getEcho(getToken);
        const channelType = getBroadcastProfileType(profileType);

        const channelName = `notifications.${channelType}.${profileId}`;

        echo.private(channelName).listen('NotificationCreated', (payload: { notification: NotificationModel }) => {
            setLiveNotifications((prev) => [payload.notification, ...prev]);
        });

    return () => {
      echo.leaveChannel(`private-${channelName}`);
    };
  }, [profileType, profileId, getToken]);

  const unreadCount = notifications.filter((notification) => notification.read_at === null).length;

  const clear = useCallback(() => setLiveNotifications([]), []);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    clear,
  };
}
