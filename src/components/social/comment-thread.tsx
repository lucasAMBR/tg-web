import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommentThread } from "@/hooks/use-comment-tree";
import { isResourceUnavailable } from "@/utils/social-error";
import CommentTree from "./comment-tree";
import PostUnavailable from "./post-unavailable";

interface CommentThreadProps {
	postId: string;
	commentId: string;
}

/**
 * Continuação de uma thread: o comentário informado como raiz, com mais três
 * níveis de prévia abaixo dele. As mesmas regras da árvore valem aqui, e o
 * caminho de volta é a tela da postagem.
 */
export default function CommentThread({
	postId,
	commentId,
}: CommentThreadProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const tree = useCommentThread(commentId);

	const backToPost = (
		<Button
			variant={"outline"}
			className="w-fit"
			onClick={() => navigate({ to: `/posts/${postId}` })}
		>
			<ArrowLeft /> {t("social.comment.back_to_post")}
		</Button>
	);

	if (isResourceUnavailable(tree.error) || (!tree.isLoading && tree.error)) {
		return (
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
				{backToPost}
				<PostUnavailable variant="thread" />
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
			{backToPost}

			<Card className="gap-4 p-4">
				{tree.isLoading ? (
					<Skeleton className="h-32 w-full" />
				) : (
					<CommentTree postId={postId} tree={tree} threadRootId={commentId} />
				)}
			</Card>
		</div>
	);
}
