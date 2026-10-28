import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { CommentTreeState } from "@/hooks/use-comment-tree";
import CommentNode from "./comment-node";

interface CommentTreeProps {
	postId: string;
	tree: CommentTreeState;
	/** A raiz da tela de thread não repete o link de continuar a thread. */
	threadRootId?: string;
}

/** Comentários raiz com a subárvore de cada um e "carregar mais comentários". */
export default function CommentTree({
	postId,
	tree,
	threadRootId,
}: CommentTreeProps) {
	const { t } = useTranslation();

	if (tree.isLoading) {
		return (
			<div className="flex flex-col gap-3">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		);
	}

	if (tree.comments.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<MessageSquare />
					</EmptyMedia>
					<EmptyTitle>{t("social.comment.empty")}</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{tree.comments.map((comment) => (
				<CommentNode
					key={comment.id}
					comment={comment}
					postId={postId}
					tree={tree}
					depth={0}
					isThreadRoot={comment.id === threadRootId}
				/>
			))}

			{tree.hasMore && (
				<Button
					variant={"outline"}
					disabled={tree.isLoadingMore}
					onClick={tree.loadMore}
					className="w-fit"
				>
					{tree.isLoadingMore && <Spinner />}
					{t("social.comment.load_more")}
				</Button>
			)}
		</div>
	);
}
