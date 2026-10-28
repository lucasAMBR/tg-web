import { useNavigate } from "@tanstack/react-router";
import {
	ChevronRight,
	CornerDownRight,
	Heart,
	MessageSquare,
	Pencil,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CommentResource } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCommentActions } from "@/hooks/use-comment-actions";
import type { CommentTreeState } from "@/hooks/use-comment-tree";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { cn } from "@/lib/utils";
import {
	COMMENT_MAX_INDENT_DEPTH,
	commentNodeAction,
	remainingRepliesCount,
	wasEdited,
} from "@/types/social";
import CommentForm from "./comment-form";
import LikesDialog from "./likes-dialog";
import SocialAuthor from "./social-author";

interface CommentNodeProps {
	comment: CommentResource;
	postId: string;
	tree: CommentTreeState;
	depth: number;
	/** Na tela de thread o nó raiz não repete o "continuar esta thread". */
	isThreadRoot?: boolean;
}

/**
 * Um comentário e a subárvore dele. Comentário removido continua na árvore,
 * sem autoria e sem ações, e as respostas dele seguem visíveis.
 */
export default function CommentNode({
	comment,
	postId,
	tree,
	depth,
	isThreadRoot = false,
}: CommentNodeProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const permissions = useSocialPermissions();

	const actions = useCommentActions({ postId, comment, tree });

	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [likesOpen, setLikesOpen] = useState(false);

	const nodeAction = commentNodeAction(comment);
	const isLoadingReplies = tree.loadingReplies.includes(comment.id);

	const canReply = permissions.canReplyComment(comment);
	const canLike = permissions.canLikeComment(comment);
	const canEdit = permissions.canEditComment(comment);
	const canDelete = permissions.canDeleteComment(comment);

	return (
		<div className="flex flex-col gap-2">
			<SocialAuthor
				author={comment.author}
				createdAt={comment.created_at}
				edited={wasEdited(comment)}
				removed={comment.is_removed}
				size="sm"
			/>

			{!comment.is_removed &&
				(isEditing ? (
					<CommentForm
						initialValue={comment.content}
						isPending={actions.isSaving}
						placeholder={t("social.comment.edit_placeholder")}
						submitLabel={t("general.save")}
						onCancel={() => setIsEditing(false)}
						autoFocus
						onSubmit={(content, callbacks) =>
							actions.editComment(content, {
								onSuccess: () => {
									callbacks.onSuccess();
									setIsEditing(false);
								},
								onFieldError: callbacks.onFieldError,
							})
						}
					/>
				) : (
					<p className="whitespace-pre-wrap break-words text-sm">
						{comment.content}
					</p>
				))}

			{!comment.is_removed && !isEditing && (
				<div className="flex flex-wrap items-center gap-1">
					{canLike && (
						<Button
							variant={"ghost"}
							size={"sm"}
							disabled={actions.isTogglingLike}
							onClick={actions.likeComment}
							className={cn("gap-1.5", comment.is_liked && "text-primary")}
							aria-label={t("social.comment.like")}
						>
							<Heart
								className={cn("size-3.5", comment.is_liked && "fill-current")}
							/>
							{comment.likes_count}
						</Button>
					)}

					{canReply && (
						<Button
							variant={"ghost"}
							size={"sm"}
							onClick={() => setIsReplying((current) => !current)}
							className="gap-1.5"
						>
							<MessageSquare className="size-3.5" />
							{t("social.comment.reply")}
						</Button>
					)}

					{canEdit && (
						<Button
							variant={"ghost"}
							size={"sm"}
							onClick={() => setIsEditing(true)}
							className="gap-1.5"
						>
							<Pencil className="size-3.5" />
							{t("general.update")}
						</Button>
					)}

					{canDelete && (
						<Button
							variant={"ghost"}
							size={"sm"}
							disabled={actions.isRemoving}
							onClick={() => actions.removeComment()}
							className="gap-1.5 text-destructive"
						>
							<Trash2 className="size-3.5" />
							{t("general.remove")}
						</Button>
					)}

					{comment.likes_count > 0 && (
						<Button
							variant={"link"}
							size={"sm"}
							onClick={() => setLikesOpen(true)}
							className="text-muted-foreground"
						>
							{t("social.likes.see_who_liked")}
						</Button>
					)}
				</div>
			)}

			{isReplying && canReply && (
				<CommentForm
					isPending={actions.isReplying}
					placeholder={t("social.comment.reply_placeholder")}
					submitLabel={t("social.comment.send_reply")}
					onCancel={() => setIsReplying(false)}
					autoFocus
					onSubmit={(content, callbacks) =>
						actions.replyToComment(content, {
							onSuccess: () => {
								callbacks.onSuccess();
								setIsReplying(false);
							},
							onFieldError: callbacks.onFieldError,
						})
					}
				/>
			)}

			{(comment.replies?.length ?? 0) > 0 && (
				<div
					className={cn(
						"flex flex-col gap-4 border-l border-border pt-2",
						depth < COMMENT_MAX_INDENT_DEPTH ? "ml-2 pl-4" : "pl-4",
					)}
				>
					{comment.replies?.map((reply) => (
						<CommentNode
							key={reply.id}
							comment={reply}
							postId={postId}
							tree={tree}
							depth={depth + 1}
						/>
					))}
				</div>
			)}

			{nodeAction === "load-more" && (
				<Button
					variant={"link"}
					size={"sm"}
					disabled={isLoadingReplies}
					onClick={() => tree.loadMoreReplies(comment.id)}
					className="w-fit gap-1.5"
				>
					{isLoadingReplies ? <Spinner /> : <CornerDownRight />}
					{t("social.comment.see_more_replies", {
						count: remainingRepliesCount(comment),
					})}
				</Button>
			)}

			{nodeAction === "continue-thread" && !isThreadRoot && (
				<Button
					variant={"link"}
					size={"sm"}
					onClick={() =>
						navigate({ to: `/posts/${postId}/thread/${comment.id}` })
					}
					className="w-fit gap-1.5"
				>
					{t("social.comment.continue_thread")}
					<ChevronRight />
				</Button>
			)}

			<LikesDialog
				open={likesOpen}
				onOpenChange={setLikesOpen}
				target={{ type: "comment", id: comment.id }}
			/>
		</div>
	);
}
