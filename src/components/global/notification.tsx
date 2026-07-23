import * as React from "react"
import { Bell, BellOff, BookA } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useAuthStore } from "@/stores/auth-store"
import { getProfileId, getRole } from "@/utils/role-helper"
import { useNotifications } from "@/hooks/use-notifications"
import type { NotificationModel } from "@/api/generated/models"
import { useTranslation } from "react-i18next"

const getToken = () => useAuthStore.getState().token;

interface NotificationListProps {
    items: NotificationModel[];
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onReachEnd: () => void;
}

function NotificationList({ items, hasNextPage, isFetchingNextPage, onReachEnd }: NotificationListProps) {
    const { t, i18n } = useTranslation();

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const sentinelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const sentinel = sentinelRef.current;

        if (!sentinel || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) onReachEnd();
            },
            { root: scrollRef.current },
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, onReachEnd, items.length]);

    const getContent = (notification: NotificationModel) => {
        const hasTranslation = notification.translation_status === "translated";

        if (!hasTranslation) {
            return { title: notification.title, message: notification.message };
        }

        return i18n.language === "pt"
            ? { title: notification.title_pt, message: notification.message_pt }
            : { title: notification.title_en, message: notification.message_en };
    };

    if (items.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant={"icon"}>
                        <BellOff />
                    </EmptyMedia>
                    <EmptyTitle>{t("notification.empty")}</EmptyTitle>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div ref={scrollRef} className="max-h-96 overflow-y-auto">
            {items.map((n, index) => {
                const { title, message } = getContent(n);

                return (
                    <div key={n.id} className={`p-4 flex gap-3 items-center ${index === items.length - 1 ? "" : "border-b-2 border-b-accent"}`}>
                        <div className="max-w-12 max-h-12 min-w-12 min-h-12 bg-accent rounded-full flex items-center justify-center">
                            <BookA />
                        </div>
                        <div>
                            <span className="font-bold">{title}</span>
                            <p className="text-xs">{message}</p>
                            {n.link ? (
                                <span className="text-xs text-primary underline">{t("notification.open_link")}</span>
                            ) : (null)}
                        </div>
                    </div>
                );
            })}
            {hasNextPage && (
                <div ref={sentinelRef} className="flex justify-center p-3">
                    <Spinner className="size-4" />
                </div>
            )}
        </div>
    );
}

export function Notification() {
    const [open, setOpen] = React.useState(false)
    const [tab, setTab] = React.useState("all")

    const { t } = useTranslation();

    const user = useAuthStore((state) => state.user);
    const role = getRole(user);
    const profileId = getProfileId(user);

    const notifications = useNotifications(role, profileId ?? null, getToken);

    const unread = notifications.notifications.filter((n) => n.read_at === null);
    const read = notifications.notifications.filter((n) => n.read_at !== null);

    const paginationProps = {
        hasNextPage: notifications.hasNextPage,
        isFetchingNextPage: notifications.isFetchingNextPage,
        onReachEnd: notifications.fetchNextPage,
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button variant="default" size="icon" aria-expanded={open} className="relative">
            <Bell className="h-4 w-4" />
            {notifications.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {notifications.unreadCount > 99 ? "99+" : notifications.unreadCount}
                </span>
            )}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-120 p-0 z-9999" align="end">
            <h1 className="p-4 font-bold text-center">{t("notification.title")}</h1>
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList variant={"line"} className="w-full">
                    <TabsTrigger className="cursor-pointer" value="all">
                        {t("notification.all")}
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="unread">
                        {t("notification.unread")}
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="read">
                        {t("notification.read")}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <NotificationList items={notifications.notifications} {...paginationProps} />
                </TabsContent>
                <TabsContent value="unread">
                    <NotificationList items={unread} {...paginationProps} />
                </TabsContent>
                <TabsContent value="read">
                    <NotificationList items={read} {...paginationProps} />
                </TabsContent>
            </Tabs>
            <Button variant={"outline"} className="w-full rounded-none">{t("notification.mark_all_as_read")}</Button>
        </PopoverContent>
        </Popover>
  )
}
