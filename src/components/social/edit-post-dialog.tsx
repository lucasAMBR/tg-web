import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	useDeletePostImage,
	useStorePostImages,
	useUpdatePost,
} from "@/api/generated/post/post";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { patchCachedPost, removeCachedPost } from "@/hooks/use-post-feed";
import {
	POST_CONTENT_MAX_LENGTH,
	POST_IMAGE_ACCEPTED_TYPES,
	POST_MAX_IMAGES,
	type Post,
	validatePostImages,
} from "@/types/social";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	isResourceUnavailable,
	socialErrorMessageKey,
	socialFieldErrors,
} from "@/utils/social-error";

interface EditPostDialogProps {
	post: Post;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Edição da postagem. O texto vai num PATCH em JSON; as imagens são adicionadas
 * e removidas pelas rotas próprias, cada uma devolvendo a postagem atualizada.
 */
export default function EditPostDialog({
	post,
	open,
	onOpenChange,
}: EditPostDialogProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const [content, setContent] = useState(post.content);
	const [contentError, setContentError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setContent(post.content);
			setContentError(null);
		}
	}, [open, post.content]);

	const { mutate: updatePost, isPending: isSaving } = useUpdatePost();
	const { mutate: storeImages, isPending: isUploading } = useStorePostImages();
	const { mutate: deleteImage, isPending: isDeletingImage } =
		useDeletePostImage();

	const handleError = (error: unknown, context: "post" | "post-images") => {
		if (isResourceUnavailable(error)) {
			removeCachedPost(queryClient, post.id);
			onOpenChange(false);
		}

		const fieldErrors = socialFieldErrors(error);

		if (fieldErrors?.content) {
			setContentError(fieldErrors.content[0]);
			return;
		}

		CustomToaster.errorToast(
			t(socialErrorMessageKey(error, context), { max: POST_MAX_IMAGES }),
		);
	};

	const handleSave = () => {
		setContentError(null);

		if (content.trim().length === 0) {
			setContentError(t("social.errors.content_required"));
			return;
		}

		updatePost(
			{ id: post.id, data: { content } },
			{
				onSuccess: (response) => {
					patchCachedPost(queryClient, post.id, () => response.data);

					CustomToaster.successToast(t("toast.success.post_updated"));

					onOpenChange(false);
				},
				onError: (error) => handleError(error, "post"),
			},
		);
	};

	const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);

		event.target.value = "";

		if (files.length === 0) return;

		const validationError = validatePostImages(files, post.images.length);

		if (validationError) {
			CustomToaster.errorToast(
				t(validationError.key, { max: POST_MAX_IMAGES }),
			);
			return;
		}

		storeImages(
			{ id: post.id, data: { images: files } },
			{
				onSuccess: (response) => {
					patchCachedPost(queryClient, post.id, () => response.data);
				},
				onError: (error) => handleError(error, "post-images"),
			},
		);
	};

	const handleRemoveImage = (imageId: number) => {
		deleteImage(
			{ id: post.id, imageId: String(imageId) },
			{
				onSuccess: () => {
					patchCachedPost(queryClient, post.id, (current) => ({
						...current,
						images: current.images.filter((image) => image.id !== imageId),
					}));
				},
				onError: (error) => handleError(error, "post"),
			},
		);
	};

	const isBusy = isSaving || isUploading || isDeletingImage;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("social.post.edit_title")}</DialogTitle>
				</DialogHeader>

				<Field>
					<FieldLabel>{t("social.post.content_label")}</FieldLabel>
					<Textarea
						value={content}
						maxLength={POST_CONTENT_MAX_LENGTH}
						rows={5}
						onChange={(event) => setContent(event.target.value)}
					/>
					<div className="flex items-center justify-between">
						{contentError ? (
							<span className="text-sm text-destructive">{contentError}</span>
						) : (
							<span />
						)}
						<span className="text-xs text-muted-foreground">
							{content.length}/{POST_CONTENT_MAX_LENGTH}
						</span>
					</div>
				</Field>

				<Field>
					<FieldLabel>
						{t("social.post.images_label", {
							current: post.images.length,
							max: POST_MAX_IMAGES,
						})}
					</FieldLabel>
					<div className="grid grid-cols-5 gap-2">
						{post.images.map((image) => (
							<div key={image.id} className="group relative aspect-square">
								<img
									src={image.thumb_url}
									alt=""
									onError={(event) => {
										event.currentTarget.src = image.original_url;
									}}
									className="h-full w-full rounded-lg object-cover"
								/>
								<Button
									type="button"
									variant="secondary"
									size="icon"
									disabled={isBusy}
									className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100"
									onClick={() => handleRemoveImage(image.id)}
									aria-label={t("general.remove")}
								>
									<X className="size-3" />
								</Button>
							</div>
						))}

						{post.images.length < POST_MAX_IMAGES && (
							<button
								type="button"
								disabled={isBusy}
								onClick={() => fileInputRef.current?.click()}
								className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-default"
							>
								{isUploading ? (
									<Spinner />
								) : (
									<ImagePlus className="size-6 text-muted-foreground" />
								)}
							</button>
						)}
					</div>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept={POST_IMAGE_ACCEPTED_TYPES.join(",")}
						className="hidden"
						onChange={handleAddImages}
					/>
				</Field>

				<DialogFooter>
					<Button variant={"outline"} onClick={() => onOpenChange(false)}>
						{t("general.cancel")}
					</Button>
					<Button onClick={handleSave} disabled={isBusy}>
						{isSaving ? <Spinner /> : t("general.save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
