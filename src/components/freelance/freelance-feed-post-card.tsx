import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MessageSquareWarning, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDeleteFreelanceFeedPost } from "@/api/generated/freelance-feed/freelance-feed";
import { FreelanceReviewStatusEnum } from "@/api/generated/models";
import SocialAuthor from "@/components/social/social-author";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
	getFreelanceFeedQueryKey,
	removeCachedFeedPost,
} from "@/hooks/use-freelance-feed";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import { cn } from "@/lib/utils";
import {
	type FreelanceFeedPost,
	FreelanceFeedPostType,
	type FreelanceVacancy,
	getFreelanceLocale,
} from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import { formatDateTime } from "@/utils/formatter";
import { FreelanceFeedAttachmentList } from "./freelance-feed-attachments";
import { useFeedPostErrorHandler } from "./freelance-feed-composer";
import FreelanceReviewDialog from "./freelance-review-dialog";

/** Id do elemento da postagem, para a review levar até a entrega. */
export function getFeedPostElementId(postId: string): string {
	return `freelance-feed-post-${postId}`;
}

const REVIEW_CLASSES: Record<string, string> = {
	[FreelanceReviewStatusEnum.approved]: "bg-emerald-500 text-white",
	[FreelanceReviewStatusEnum.changes_requested]: "bg-amber-500 text-white",
};

function ReviewStatusBadge({
	status,
	label,
}: {
	status: string | null;
	label?: string | null;
}) {
	const { t } = useTranslation();

	if (!status) return null;

	return (
		<Badge className={REVIEW_CLASSES[status]}>
			{t(`enum.freelance_review_status.${status}`, {
				defaultValue: label ?? status,
			})}
		</Badge>
	);
}

/** Selo do tipo: entrega e review têm destaque próprio. */
function PostTypeBadge({ post }: { post: FreelanceFeedPost }) {
	const { t } = useTranslation();

	return (
		<Badge
			variant={
				post.type === FreelanceFeedPostType.update ? "outline" : "default"
			}
			className={cn(
				post.type === FreelanceFeedPostType.deliverable &&
					"bg-primary text-primary-foreground",
				post.type === FreelanceFeedPostType.review &&
					"bg-secondary text-secondary-foreground",
			)}
		>
			{t(`enum.freelance_feed_post_type.${post.type}`, {
				defaultValue: post.type_label,
			})}
		</Badge>
	);
}

interface FreelanceFeedPostCardProps {
	vacancy: FreelanceVacancy;
	post: FreelanceFeedPost;
	/** Na review: a entrega revisada, quando ela já está carregada no feed. */
	parent?: FreelanceFeedPost;
	highlighted?: boolean;
	onJumpToPost: (postId: string) => void;
}

export default function FreelanceFeedPostCard({
	vacancy,
	post,
	parent,
	highlighted = false,
	onJumpToPost,
}: FreelanceFeedPostCardProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const queryClient = useQueryClient();

	const { canReviewDeliverable, canDeleteFeedPost } = useFreelancePermissions();

	const [reviewStatus, setReviewStatus] =
		useState<FreelanceReviewStatusEnum | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const handleError = useFeedPostErrorHandler(vacancy.id);

	const { mutate: deletePost, isPending: isDeleting } =
		useDeleteFreelanceFeedPost();

	const canReview = canReviewDeliverable(vacancy, post);
	const canDelete = canDeleteFeedPost(vacancy, post);

	const handleDelete = () => {
		deletePost(
			{ id: vacancy.id, postId: post.id },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.freelance_feed_post_deleted"),
					);

					// Remover uma review muda o estado da entrega revisada: o feed é
					// recarregado para o `latest_review` vir certo
					if (post.type === FreelanceFeedPostType.review) {
						queryClient.invalidateQueries({
							queryKey: getFreelanceFeedQueryKey(vacancy.id),
						});
					} else {
						removeCachedFeedPost(queryClient, vacancy.id, post.id);
					}

					setDeleteOpen(false);
				},
				onError: (error) => {
					const message = handleError(error);

					if (message) CustomToaster.errorToast(message);

					setDeleteOpen(false);
				},
			},
		);
	};

	return (
		<Card
			id={getFeedPostElementId(post.id)}
			className={cn(
				"w-full gap-3 p-4 transition-shadow",
				highlighted && "ring-2 ring-primary",
			)}
		>
			<div className="flex flex-row items-start justify-between gap-2">
				<SocialAuthor
					author={post.author}
					createdAt={post.created_at}
					deletedAuthorLabel={t("freelance.feed.removed_author")}
				/>
				<div className="flex shrink-0 flex-row items-center gap-1">
					<PostTypeBadge post={post} />
					{canDelete && (
						<Button
							variant={"ghost"}
							size={"icon"}
							className="size-8"
							aria-label={t("freelance.feed.delete")}
							onClick={() => setDeleteOpen(true)}
						>
							<Trash2 className="size-4" />
						</Button>
					)}
				</div>
			</div>

			{post.type === FreelanceFeedPostType.review && post.review_status && (
				<div className="flex flex-row flex-wrap items-center gap-2 text-sm">
					<ReviewStatusBadge
						status={post.review_status}
						label={post.review_status_label}
					/>
					{post.parent_id && (
						<button
							type="button"
							className="cursor-pointer text-primary hover:underline"
							onClick={() => post.parent_id && onJumpToPost(post.parent_id)}
						>
							{parent
								? t("freelance.feed.review_about", {
										date: formatDateTime(parent.created_at, { locale }),
									})
								: t("freelance.feed.review_about_older")}
						</button>
					)}
				</div>
			)}

			{post.content && (
				<p className="whitespace-pre-line wrap-break-word text-sm">
					{post.content}
				</p>
			)}

			<FreelanceFeedAttachmentList attachments={post.attachments} />

			{post.type === FreelanceFeedPostType.deliverable && (
				<div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
					{post.latest_review ? (
						<ReviewStatusBadge
							status={post.latest_review.review_status}
							label={post.latest_review.review_status_label}
						/>
					) : (
						<Badge variant={"outline"}>
							{t("freelance.feed.review_pending")}
						</Badge>
					)}
					{canReview && (
						<div className="flex flex-row flex-wrap gap-2">
							<Button
								size={"sm"}
								onClick={() =>
									setReviewStatus(FreelanceReviewStatusEnum.approved)
								}
							>
								<CheckCircle2 className="size-4" />
								{t("freelance.feed.approve")}
							</Button>
							<Button
								size={"sm"}
								variant={"outline"}
								onClick={() =>
									setReviewStatus(FreelanceReviewStatusEnum.changes_requested)
								}
							>
								<MessageSquareWarning className="size-4" />
								{t("freelance.feed.request_changes")}
							</Button>
						</div>
					)}
				</div>
			)}

			{canReview && reviewStatus && (
				<FreelanceReviewDialog
					vacancyId={vacancy.id}
					deliverable={post}
					reviewStatus={reviewStatus}
					open={!!reviewStatus}
					onOpenChange={(open) => {
						if (!open) setReviewStatus(null);
					}}
				/>
			)}

			{canDelete && (
				<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								{t("freelance.feed.delete_title")}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{t("freelance.feed.delete_description")}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<Button
								variant={"outline"}
								onClick={() => setDeleteOpen(false)}
								disabled={isDeleting}
							>
								{t("general.cancel")}
							</Button>
							<Button
								variant={"destructive"}
								onClick={handleDelete}
								disabled={isDeleting}
							>
								{isDeleting ? <Spinner /> : t("freelance.feed.delete")}
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</Card>
	);
}
