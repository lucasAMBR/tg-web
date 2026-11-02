import * as React from "react"
import { Bell, BellOff, BookA, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/auth-store"
import type { UserRole } from "@/types/AuthenticatedUser"
import { resolveNotificationRoute } from "@/utils/notification-link"
import { getProfileId, getRole } from "@/utils/role-helper"
import { useNotifications } from "@/hooks/use-notifications"
import { useIsMobile } from "@/hooks/use-mobile"
import type { NotificationResource } from "@/api/generated/models"
import { useTranslation } from "react-i18next"

const getToken = () => useAuthStore.getState().token;

/** No popover a lista rola dentro dele; na tela, junto com a página. */
type NotificationVariant = "popover" | "page";

interface NotificationListProps {
    items: NotificationResource[];
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onReachEnd: () => void;
    role: UserRole | undefined;
    /** Abre a tela da notificação e fecha o popover. */
    onOpenRoute: (route: string) => void;
    variant: NotificationVariant;
}

function NotificationList({ items, hasNextPage, isFetchingNextPage, onReachEnd, role, onOpenRoute, variant }: NotificationListProps) {
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
            { root: variant === "popover" ? scrollRef.current : null },
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, onReachEnd, items.length, variant]);

    const getContent = (notification: NotificationResource) => {
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
        <div ref={scrollRef} className={variant === "popover" ? "max-h-96 overflow-y-auto" : undefined}>
            {items.map((n, index) => {
                const { title, message } = getContent(n);

                const route = resolveNotificationRoute(n.link, n.type, role);

                const content = (
                    <>
                        <div className="max-w-12 max-h-12 min-w-12 min-h-12 bg-accent rounded-full flex items-center justify-center">
                            <BookA />
                        </div>
                        <div>
                            <span className="font-bold">{title}</span>
                            <p className="text-xs">{message}</p>
                            {route ? (
                                <span className="text-xs text-primary underline">{t("notification.open_link")}</span>
                            ) : (null)}
                        </div>
                    </>
                );

                const className = `p-4 flex gap-3 items-center text-left w-full ${index === items.length - 1 ? "" : "border-b-2 border-b-accent"}`;

                // Com link, a notificação inteira leva para a tela dela
                return route ? (
                    <button
                        key={n.id}
                        type="button"
                        className={`${className} cursor-pointer transition-colors hover:bg-accent/50`}
                        onClick={() => onOpenRoute(route)}
                    >
                        {content}
                    </button>
                ) : (
                    <div key={n.id} className={className}>
                        {content}
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

/** Notificações do perfil logado. */
function useProfileNotifications(realtime: boolean) {
    const user = useAuthStore((state) => state.user);
    const role = getRole(user);
    const profileId = getProfileId(user);

    const notifications = useNotifications(role, profileId ?? null, getToken, { realtime });

    return { role, notifications };
}

/** Marca todas as notificações do perfil como lidas. */
function MarkAllAsReadButton({ notifications }: { notifications: ReturnType<typeof useNotifications> }) {
    const { t } = useTranslation();

    return (
        <Button
            variant={"outline"}
            size={"sm"}
            disabled={notifications.unreadCount === 0 || notifications.isMarkingAllAsRead}
            onClick={notifications.markAllAsRead}
        >
            {notifications.isMarkingAllAsRead ? <Spinner /> : <CheckCheck />}
            {t("notification.mark_all_as_read")}
        </Button>
    );
}

interface NotificationPanelProps {
    notifications: ReturnType<typeof useNotifications>;
    role: UserRole | undefined;
    tab: string;
    onTabChange: (tab: string) => void;
    onOpenRoute: (route: string) => void;
    variant: NotificationVariant;
}

/** Abas com as listas de notificações — o conteúdo do popover e da tela. */
function NotificationPanel({ notifications, role, tab, onTabChange, onOpenRoute, variant }: NotificationPanelProps) {
    const { t } = useTranslation();

    const unread = notifications.notifications.filter((n) => n.read_at === null);
    const read = notifications.notifications.filter((n) => n.read_at !== null);

    const listProps = {
        hasNextPage: notifications.hasNextPage,
        isFetchingNextPage: notifications.isFetchingNextPage,
        onReachEnd: notifications.fetchNextPage,
        role,
        onOpenRoute,
        variant,
    };

    return (
        <Tabs value={tab} onValueChange={onTabChange}>
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
                <NotificationList items={notifications.notifications} {...listProps} />
            </TabsContent>
            <TabsContent value="unread">
                <NotificationList items={unread} {...listProps} />
            </TabsContent>
            <TabsContent value="read">
                <NotificationList items={read} {...listProps} />
            </TabsContent>
        </Tabs>
    );
}

/**
 * Sino do header. Fica sempre montado, então é ele que se inscreve no canal das
 * notificações. No celular o popover não cabe: o sino leva para a tela de
 * notificações.
 */
export function Notification() {
    const [open, setOpen] = React.useState(false)
    const [tab, setTab] = React.useState("all")

    const { t } = useTranslation();

    const navigate = useNavigate();

    const isMobile = useIsMobile();

    const { role, notifications } = useProfileNotifications(true);

    const badge = notifications.unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
        {notifications.unreadCount > 99 ? "99+" : notifications.unreadCount}
        </span>
    );

    if (isMobile) {
        return (
            <Button
                variant="default"
                size="icon"
                aria-label={t("notification.title")}
                className="relative"
                onClick={() => navigate({ to: "/notifications" })}
            >
                <Bell className="h-4 w-4" />
                {badge}
            </Button>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button variant="default" size="icon" aria-expanded={open} className="relative">
            <Bell className="h-4 w-4" />
            {badge}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(30rem,calc(100vw-2rem))] p-0 z-9999" align="end">
            <div className="flex items-center justify-between gap-2 p-4">
                <h1 className="font-bold">{t("notification.title")}</h1>
                <MarkAllAsReadButton notifications={notifications} />
            </div>
            <NotificationPanel
                notifications={notifications}
                role={role}
                tab={tab}
                onTabChange={setTab}
                variant="popover"
                onOpenRoute={(route) => {
                    setOpen(false);
                    navigate({ to: route });
                }}
            />
        </PopoverContent>
        </Popover>
  )
}

/** Tela de notificações — no celular ocupa o lugar do popover do header. */
export function NotificationsPage() {
    const [tab, setTab] = React.useState("all");

    const { t } = useTranslation();

    const navigate = useNavigate();

    // Quem se inscreve no canal é o sino do header, que continua montado
    const { role, notifications } = useProfileNotifications(false);

    return (
        <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold md:text-3xl">
                    {t("notification.title")}
                </h2>
                <MarkAllAsReadButton notifications={notifications} />
            </div>

            <Card className="gap-0 overflow-hidden p-0 pt-2">
                <NotificationPanel
                    notifications={notifications}
                    role={role}
                    tab={tab}
                    onTabChange={setTab}
                    variant="page"
                    onOpenRoute={(route) => navigate({ to: route })}
                />
            </Card>
        </>
    );
}
