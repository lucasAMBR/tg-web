import { Newspaper } from "lucide-react";
import { useEffect, useRef } from "react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { Post } from "@/types/social";
import PostCard from "./post-card";

interface PostListProps {
	posts: Post[];
	isLoading: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onReachEnd: () => void;
	emptyTitle: string;
	emptyDescription?: string;
	/** Tela de favoritos: desfavoritar tira o card da lista. */
	removeOnUnfavorite?: boolean;
}

/** Lista de postagens com rolagem infinita, usada pelo feed, perfil e favoritos. */
export default function PostList({
	posts,
	isLoading,
	hasNextPage,
	isFetchingNextPage,
	onReachEnd,
	emptyTitle,
	emptyDescription,
	removeOnUnfavorite = false,
}: PostListProps) {
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;

		if (!sentinel || !hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) onReachEnd();
		});

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, onReachEnd]);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-3">
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<Newspaper />
					</EmptyMedia>
					<EmptyTitle>{emptyTitle}</EmptyTitle>
					{emptyDescription && (
						<EmptyDescription>{emptyDescription}</EmptyDescription>
					)}
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{posts.map((post) => (
				<PostCard
					key={post.id}
					post={post}
					removeOnUnfavorite={removeOnUnfavorite}
				/>
			))}

			{isFetchingNextPage && (
				<div className="flex justify-center py-2">
					<Spinner />
				</div>
			)}
			<div ref={sentinelRef} className="h-px w-full" />
		</div>
	);
}
