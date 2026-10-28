import { useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	removeCachedFollowLists,
	useFollowList,
} from "@/hooks/use-follow-list";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import type { FollowListItem, FollowListKind } from "@/types/follow";
import FollowButton from "./follow-button";
import FollowsYouBadge from "./follows-you-badge";
import SocialAuthor from "./social-author";

interface FollowListDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	kind: FollowListKind;
	onKindChange: (kind: FollowListKind) => void;
	/** Id do **usuário** dono das listas, não o do perfil. */
	userId: string;
	name: string | null | undefined;
}

/**
 * Seguidores e seguidos de um usuário, do follow mais recente para o mais
 * antigo. Fechar descarta as listas: quem você deixou de seguir aqui continua
 * com o botão "Seguir" até sair da tela e já não vem ao reabrir.
 */
export default function FollowListDialog({
	open,
	onOpenChange,
	...bodyProps
}: FollowListDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<FollowListDialogBody {...bodyProps} enabled={open} />
			</DialogContent>
		</Dialog>
	);
}

type FollowListDialogBodyProps = Omit<
	FollowListDialogProps,
	"open" | "onOpenChange"
> & { enabled: boolean };

function FollowListDialogBody({
	kind,
	onKindChange,
	userId,
	name,
	enabled,
}: FollowListDialogBodyProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const permissions = useSocialPermissions();

	const isOwn = userId === permissions.userId;
	const displayName = name ?? t("social.author.unknown");

	// O corpo desmonta quando o diálogo termina de fechar (depois da animação,
	// para a lista não piscar vazia) ou quando se sai do perfil, inclusive
	// clicando em alguém da lista. É aí que a tela acaba
	useEffect(
		() => () => removeCachedFollowLists(queryClient, userId),
		[queryClient, userId],
	);

	const emptyTitle =
		kind === "followers"
			? isOwn
				? t("social.follow.empty_followers_own")
				: t("social.follow.empty_followers", { name: displayName })
			: isOwn
				? t("social.follow.empty_following_own")
				: t("social.follow.empty_following", { name: displayName });

	return (
		<>
			<DialogHeader>
				<DialogTitle>{displayName}</DialogTitle>
			</DialogHeader>

			<Tabs
				value={kind}
				onValueChange={(value) => onKindChange(value as FollowListKind)}
			>
				<TabsList variant={"line"}>
					<TabsTrigger className="cursor-pointer" value="followers">
						{t("social.follow.followers_tab")}
					</TabsTrigger>
					<TabsTrigger className="cursor-pointer" value="following">
						{t("social.follow.following_tab")}
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<FollowList
				key={kind}
				userId={userId}
				kind={kind}
				enabled={enabled}
				emptyTitle={emptyTitle}
			/>
		</>
	);
}

interface FollowListProps {
	userId: string;
	kind: FollowListKind;
	enabled: boolean;
	emptyTitle: string;
}

function FollowList({ userId, kind, enabled, emptyTitle }: FollowListProps) {
	const sentinelRef = useRef<HTMLDivElement>(null);

	const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useFollowList(userId, kind, { enabled });

	useEffect(() => {
		const sentinel = sentinelRef.current;

		if (!sentinel || !hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) fetchNextPage();
		});

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
			{isLoading && (
				<>
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</>
			)}

			{!isLoading && items.length === 0 && (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Users />
						</EmptyMedia>
						<EmptyTitle>{emptyTitle}</EmptyTitle>
					</EmptyHeader>
				</Empty>
			)}

			{items.map((item) => (
				<FollowListRow key={item.user.id} item={item} />
			))}

			{isFetchingNextPage && (
				<div className="flex justify-center py-2">
					<Spinner />
				</div>
			)}
			<div ref={sentinelRef} className="h-px w-full shrink-0" />
		</div>
	);
}

function FollowListRow({ item }: { item: FollowListItem }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				<SocialAuthor author={item.user} size="sm" />
				{item.follows_you && <FollowsYouBadge />}
			</div>
			<FollowButton
				userId={item.user.id}
				name={item.user.name}
				isFollowed={item.is_followed}
				followsYou={item.follows_you}
				size="sm"
			/>
		</div>
	);
}
