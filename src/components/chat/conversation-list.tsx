import { MessagesSquare, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ChatConversationResource } from "@/api/generated/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useChatStore } from "@/stores/chat-store";
import { formatConversationTime, getParticipantProfilePic } from "@/types/chat";

interface ConversationListProps {
	conversations: ChatConversationResource[];
	isLoading: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onReachEnd: () => void;
}

/** Conversas do usuário, da que recebeu mensagem mais recentemente para a mais antiga. */
export default function ConversationList({
	conversations,
	isLoading,
	hasNextPage,
	isFetchingNextPage,
	onReachEnd,
}: ConversationListProps) {
	const { t, i18n } = useTranslation();

	const openConversation = useChatStore((state) => state.openConversation);

	const scrollRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const locale = i18n.language === "en" ? "en" : "pt";

	useEffect(() => {
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
	}, [hasNextPage, isFetchingNextPage, onReachEnd, conversations.length]);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2 p-3">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		);
	}

	if (conversations.length === 0) {
		return (
			<Empty className="flex-1">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<MessagesSquare />
					</EmptyMedia>
					<EmptyTitle>{t("chat.empty_title")}</EmptyTitle>
					<EmptyDescription>{t("chat.empty_description")}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div ref={scrollRef} className="flex-1 overflow-y-auto">
			{conversations.map((conversation) => {
				const { participant } = conversation;
				const profilePic = getParticipantProfilePic(participant);
				const hasUnread = conversation.unread_count > 0;

				return (
					<button
						key={conversation.id}
						type="button"
						onClick={() => openConversation(conversation.id)}
						className="flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors hover:bg-muted"
					>
						<Avatar className="size-11 shrink-0">
							{profilePic && (
								<AvatarImage
									src={profilePic}
									alt={participant?.name ?? ""}
									className="object-cover"
								/>
							)}
							<AvatarFallback className="bg-primary text-primary-foreground">
								<User className="size-5" />
							</AvatarFallback>
						</Avatar>
						<div className="flex min-w-0 flex-1 flex-col">
							<div className="flex items-center justify-between gap-2">
								<span className="truncate font-medium">
									{participant?.name ?? t("chat.unknown_participant")}
								</span>
								<span className="shrink-0 text-xs text-muted-foreground">
									{formatConversationTime(conversation.last_message_at, locale)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-2">
								<span
									className={`truncate text-xs ${
										hasUnread
											? "font-medium text-foreground"
											: "text-muted-foreground"
									}`}
								>
									{conversation.last_message?.body ?? t("chat.no_messages_yet")}
								</span>
								{hasUnread && (
									<span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
										{conversation.unread_count > 99
											? "99+"
											: conversation.unread_count}
									</span>
								)}
							</div>
						</div>
					</button>
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
