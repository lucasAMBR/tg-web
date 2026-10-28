import { Lock, Newspaper, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useFreelanceFeed } from "@/hooks/use-freelance-feed";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import {
	type FreelanceFeedPost,
	FreelanceStatus,
	type FreelanceVacancy,
} from "@/types/freelance";
import { freelanceErrorMessageKey } from "@/utils/freelance-error";
import FreelanceFeedComposer from "./freelance-feed-composer";
import FreelanceFeedPostCard, {
	getFeedPostElementId,
} from "./freelance-feed-post-card";
import FreelanceInfiniteList from "./freelance-infinite-list";

/**
 * Feed do freela, para o cliente dono e o dev contratado, com o freela em
 * andamento ou concluído. É o lugar das entregas e das aprovações; a conversa do
 * dia a dia continua no chat.
 */
export default function FreelanceFeed({
	vacancy,
}: {
	vacancy: FreelanceVacancy;
}) {
	const { t } = useTranslation();

	const { canViewFeed, canPostFeed } = useFreelancePermissions();

	const canView = canViewFeed(vacancy);

	const feed = useFreelanceFeed(vacancy.id, canView);

	const { posts, hasNextPage, isFetchingNextPage, fetchNextPage } = feed;

	const postsById = useMemo(
		() => new Map(posts.map((post) => [post.id, post])),
		[posts],
	);

	// A review leva até a entrega revisada. Se ela está numa página ainda não
	// carregada, as páginas seguintes vêm até ela aparecer
	const [jumpTarget, setJumpTarget] = useState<string | null>(null);
	const [highlightedId, setHighlightedId] = useState<string | null>(null);

	useEffect(() => {
		if (!jumpTarget) return;

		if (postsById.has(jumpTarget)) {
			document
				.getElementById(getFeedPostElementId(jumpTarget))
				?.scrollIntoView({ behavior: "smooth", block: "center" });
			setHighlightedId(jumpTarget);
			setJumpTarget(null);

			return;
		}

		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();

			return;
		}

		if (!hasNextPage) setJumpTarget(null);
	}, [jumpTarget, postsById, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (!canView) {
		return (
			<Alert>
				<Lock className="size-4" />
				<AlertDescription>{t("freelance.feed.unavailable")}</AlertDescription>
			</Alert>
		);
	}

	const isCompleted = vacancy.status === FreelanceStatus.completed;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h3 className="flex items-center gap-2 text-lg font-bold">
					<Newspaper className="size-5" />
					{t("freelance.feed.title")}
				</h3>
				<p className="text-sm text-muted-foreground">
					{t("freelance.feed.description")}
				</p>
			</div>

			{isCompleted && (
				<Alert>
					<Lock className="size-4" />
					<AlertDescription>{t("freelance.feed.read_only")}</AlertDescription>
				</Alert>
			)}

			{canPostFeed(vacancy) && <FreelanceFeedComposer vacancy={vacancy} />}

			<div className="flex flex-row flex-wrap items-center justify-between gap-2">
				<p className="text-xs text-muted-foreground">
					{t("freelance.feed.link_expired_hint")}
				</p>
				<Button
					variant={"ghost"}
					size={"sm"}
					onClick={() => feed.refetch()}
					disabled={feed.isFetching}
				>
					<RefreshCw className="size-4" />
					{t("freelance.feed.reload")}
				</Button>
			</div>

			<FreelanceInfiniteList<FreelanceFeedPost>
				items={posts}
				getKey={(post) => post.id}
				renderItem={(post) => (
					<FreelanceFeedPostCard
						vacancy={vacancy}
						post={post}
						parent={post.parent_id ? postsById.get(post.parent_id) : undefined}
						highlighted={post.id === highlightedId}
						onJumpToPost={setJumpTarget}
					/>
				)}
				isLoading={feed.isLoading}
				isError={feed.isError}
				errorMessage={
					feed.error
						? t(freelanceErrorMessageKey(feed.error, "feed"))
						: undefined
				}
				onRetry={() => feed.refetch()}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				fetchNextPage={fetchNextPage}
				emptyIcon={Newspaper}
				emptyTitle={t("freelance.feed.empty_title")}
				emptyDescription={t("freelance.feed.empty_description")}
			/>
		</div>
	);
}
