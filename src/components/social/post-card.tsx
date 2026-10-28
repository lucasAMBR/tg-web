import { useNavigate } from "@tanstack/react-router";
import {
	Bookmark,
	Heart,
	MessageSquare,
	MoreHorizontal,
	Pencil,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePostActions } from "@/hooks/use-post-actions";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { cn } from "@/lib/utils";
import { type Post, wasEdited } from "@/types/social";
import DeletePostDialog from "./delete-post-dialog";
import EditPostDialog from "./edit-post-dialog";
import LikesDialog from "./likes-dialog";
import PostImages from "./post-images";
import SocialAuthor from "./social-author";

interface PostCardProps {
	post: Post;
	/** `detail` é a tela do post: o card não leva mais a lugar nenhum. */
	variant?: "feed" | "detail";
	/** Tela de favoritos: desfavoritar tira o card da lista. */
	removeOnUnfavorite?: boolean;
	/** Chamado depois de excluir, para a tela do post poder sair dela. */
	onDeleted?: () => void;
}

export default function PostCard({
	post,
	variant = "feed",
	removeOnUnfavorite = false,
	onDeleted,
}: PostCardProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const permissions = useSocialPermissions();

	const { likePost, favoritePost, isTogglingLike, isTogglingFavorite } =
		usePostActions(post, { removeOnUnfavorite });

	const [likesOpen, setLikesOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const canEdit = permissions.canEditPost(post);
	const canDelete = permissions.canDeletePost(post);

	const openPost = () => navigate({ to: `/posts/${post.id}` });

	return (
		<Card className="w-full gap-3 p-4">
			<div className="flex items-start justify-between gap-2">
				<SocialAuthor
					author={post.author}
					createdAt={post.created_at}
					edited={wasEdited(post)}
				/>

				{(canEdit || canDelete) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant={"ghost"}
								size={"icon"}
								aria-label={t("general.actions")}
							>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{canEdit && (
								<DropdownMenuItem onSelect={() => setEditOpen(true)}>
									<Pencil /> {t("general.update")}
								</DropdownMenuItem>
							)}
							{canDelete && (
								<DropdownMenuItem
									variant="destructive"
									onSelect={() => setDeleteOpen(true)}
								>
									<Trash2 /> {t("general.delete")}
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<p className="whitespace-pre-wrap break-words">{post.content}</p>

			<PostImages images={post.images} />

			<div className="flex flex-wrap items-center gap-1">
				<Button
					variant={"ghost"}
					size={"sm"}
					disabled={isTogglingLike}
					onClick={likePost}
					className={cn("gap-1.5", post.is_liked && "text-primary")}
					aria-label={t("social.post.like")}
				>
					<Heart className={cn(post.is_liked && "fill-current")} />
					{post.likes_count}
				</Button>

				<Button
					variant={"ghost"}
					size={"sm"}
					onClick={variant === "detail" ? undefined : openPost}
					className="gap-1.5"
					aria-label={t("social.post.comments")}
				>
					<MessageSquare />
					{post.comments_count}
				</Button>

				<Button
					variant={"ghost"}
					size={"sm"}
					disabled={isTogglingFavorite}
					onClick={favoritePost}
					className={cn("gap-1.5", post.is_favorited && "text-primary")}
					aria-label={t("social.post.favorite")}
				>
					<Bookmark className={cn(post.is_favorited && "fill-current")} />
					{post.favorites_count}
				</Button>

				{post.likes_count > 0 && (
					<Button
						variant={"link"}
						size={"sm"}
						onClick={() => setLikesOpen(true)}
						className="text-muted-foreground"
					>
						{t("social.likes.see_who_liked")}
					</Button>
				)}

				{variant === "feed" && (
					<Button
						variant={"link"}
						size={"sm"}
						onClick={openPost}
						className="ml-auto"
					>
						{t("social.post.open")}
					</Button>
				)}
			</div>

			<LikesDialog
				open={likesOpen}
				onOpenChange={setLikesOpen}
				target={{ type: "post", id: post.id }}
			/>

			{canEdit && (
				<EditPostDialog
					post={post}
					open={editOpen}
					onOpenChange={setEditOpen}
				/>
			)}

			{canDelete && (
				<DeletePostDialog
					post={post}
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					onDeleted={onDeleted}
				/>
			)}
		</Card>
	);
}
