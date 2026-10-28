import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { indexCommentLikes, indexPostLikes } from "@/api/generated/like/like";
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
import { dedupeById, POSTS_PER_PAGE } from "@/types/social";
import SocialAuthor from "./social-author";

interface LikesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	target: { type: "post" | "comment"; id: string };
}

/** Quem curtiu, das curtidas mais recentes para as mais antigas. */
export default function LikesDialog({
	open,
	onOpenChange,
	target,
}: LikesDialogProps) {
	const { t } = useTranslation();

	const sentinelRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["/like", target.type, target.id, "infinite"] as const,
			// As duas rotas devolvem a mesma coleção, só com `message` diferente, e
			// o envelope é descartado aqui para as páginas terem um tipo só.
			queryFn: async ({ pageParam, signal }) => {
				const params = { page: pageParam, per_page: POSTS_PER_PAGE };

				const response =
					target.type === "post"
						? await indexPostLikes(target.id, params, signal)
						: await indexCommentLikes(target.id, params, signal);

				return response.data;
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage) => {
				const { current_page, total_pages } = lastPage.pagination;

				return current_page < total_pages ? current_page + 1 : undefined;
			},
			enabled: open,
		});

	const likes = useMemo(
		() => dedupeById(data?.pages.flatMap((page) => page.data) ?? []),
		[data],
	);

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("social.likes.title")}</DialogTitle>
				</DialogHeader>

				<div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
					{isLoading && (
						<>
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</>
					)}

					{!isLoading && likes.length === 0 && (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant={"icon"}>
									<Heart />
								</EmptyMedia>
								<EmptyTitle>{t("social.likes.empty")}</EmptyTitle>
							</EmptyHeader>
						</Empty>
					)}

					{likes.map((like) => (
						<SocialAuthor
							key={like.id}
							author={like.user}
							createdAt={like.created_at}
							size="sm"
						/>
					))}

					{isFetchingNextPage && (
						<div className="flex justify-center py-2">
							<Spinner />
						</div>
					)}
					<div ref={sentinelRef} className="h-px w-full shrink-0" />
				</div>
			</DialogContent>
		</Dialog>
	);
}
