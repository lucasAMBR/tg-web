import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useStoreComment } from "@/api/generated/comment/comment";
import { useShowPost } from "@/api/generated/post/post";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreadcrumbLabel } from "@/hooks/use-breadcrumbs";
import { useCommentTree } from "@/hooks/use-comment-tree";
import { patchCachedPost } from "@/hooks/use-post-feed";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	isResourceUnavailable,
	socialErrorMessageKey,
	socialFieldErrors,
} from "@/utils/social-error";
import CommentForm from "./comment-form";
import CommentTree from "./comment-tree";
import PostCard from "./post-card";
import PostUnavailable from "./post-unavailable";

interface PostDetailProps {
	postId: string;
}

/** Tela da postagem: o post inteiro e os comentários raiz com a árvore. */
export default function PostDetail({ postId }: PostDetailProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const permissions = useSocialPermissions();

	const { data, isLoading, error } = useShowPost(postId, {
		query: { retry: false },
	});

	const post = data?.data;

	const tree = useCommentTree(postId);

	useBreadcrumbLabel(post?.author?.name ?? undefined);

	const { mutate: storeComment, isPending: isCommenting } = useStoreComment();

	if (isLoading) {
		return (
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
				<Skeleton className="h-64 w-full" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	if (isResourceUnavailable(error) || (!post && error)) {
		return (
			<div className="mx-auto w-full max-w-3xl">
				<PostUnavailable />
			</div>
		);
	}

	if (!post) return null;

	// A postagem existe, mas a listagem de comentários dela respondeu 422: a
	// postagem foi excluída entre as duas chamadas.
	if (isResourceUnavailable(tree.error)) {
		return (
			<div className="mx-auto w-full max-w-3xl">
				<PostUnavailable />
			</div>
		);
	}

	const handleComment = (
		content: string,
		callbacks: {
			onSuccess: () => void;
			onFieldError: (message: string) => void;
		},
	) => {
		storeComment(
			{ data: { post_id: postId, content } },
			{
				onSuccess: (response) => {
					tree.addRootComment(response.data);

					patchCachedPost(queryClient, postId, (current) => ({
						...current,
						comments_count: current.comments_count + 1,
					}));

					callbacks.onSuccess();
				},
				onError: (error) => {
					const fieldErrors = socialFieldErrors(error);

					if (fieldErrors?.content) {
						callbacks.onFieldError(fieldErrors.content[0]);
						return;
					}

					CustomToaster.errorToast(t(socialErrorMessageKey(error, "post")));
				},
			},
		);
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
			<PostCard
				post={post}
				variant="detail"
				onDeleted={() => navigate({ to: "/feed" })}
			/>

			<Card className="gap-4 p-4">
				<h2 className="font-bold text-lg">
					{t("social.comment.section_title", {
						count: post.comments_count,
					})}
				</h2>

				{permissions.canCreateComment && (
					<>
						<CommentForm
							onSubmit={handleComment}
							isPending={isCommenting}
							placeholder={t("social.comment.create_placeholder")}
							submitLabel={t("social.comment.send")}
						/>
						<Separator />
					</>
				)}

				<CommentTree postId={postId} tree={tree} />
			</Card>
		</div>
	);
}
