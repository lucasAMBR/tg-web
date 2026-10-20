import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { storePost, storePostImages } from "@/api/generated/post/post";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { invalidatePostFeeds } from "@/hooks/use-post-feed";
import {
	chunkImagesByRequestSize,
	POST_CONTENT_MAX_LENGTH,
	POST_IMAGE_ACCEPTED_TYPES,
	POST_MAX_IMAGES,
	validatePostImages,
} from "@/types/social";
import { CustomToaster } from "@/utils/custom-toaster";
import { socialErrorMessageKey, socialFieldErrors } from "@/utils/social-error";

interface SelectedImage {
	id: string;
	file: File;
	previewUrl: string;
}

/**
 * Publicação de postagem. O texto é obrigatório — não existe post só com
 * imagem — e as imagens são validadas aqui com as mesmas regras da API antes de
 * subir. Quando o total passa do limite de corpo da requisição, o primeiro lote
 * vai junto do `POST /post` e o resto em `POST /post/{id}/images`.
 */
export default function CreatePostCard() {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const [content, setContent] = useState("");
	/** A prévia é criada uma vez por arquivo e revogada ao sair da lista. */
	const [images, setImages] = useState<SelectedImage[]>([]);
	const [contentError, setContentError] = useState<string | null>(null);
	const [isPublishing, setIsPublishing] = useState(false);

	const files = images.map((image) => image.file);

	const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selected = Array.from(event.target.files ?? []);

		event.target.value = "";

		if (selected.length === 0) return;

		const validationError = validatePostImages([...files, ...selected]);

		if (validationError) {
			CustomToaster.errorToast(
				t(validationError.key, { max: POST_MAX_IMAGES }),
			);
			return;
		}

		setImages((current) => [
			...current,
			...selected.map((file) => ({
				id: crypto.randomUUID(),
				file,
				previewUrl: URL.createObjectURL(file),
			})),
		]);
	};

	const removeImage = (id: string) => {
		setImages((current) => {
			const removed = current.find((image) => image.id === id);

			if (removed) URL.revokeObjectURL(removed.previewUrl);

			return current.filter((image) => image.id !== id);
		});
	};

	const reset = () => {
		setContent("");
		setImages((current) => {
			for (const image of current) URL.revokeObjectURL(image.previewUrl);

			return [];
		});
		setContentError(null);
	};

	const handlePublish = async () => {
		setContentError(null);

		if (content.trim().length === 0) {
			setContentError(t("social.errors.content_required"));
			return;
		}

		const [firstBatch, ...nextBatches] = chunkImagesByRequestSize(files);

		setIsPublishing(true);

		try {
			const created = await storePost({
				content,
				images: firstBatch ?? [],
			});

			for (const batch of nextBatches) {
				await storePostImages(created.data.id, { images: batch });
			}

			invalidatePostFeeds(queryClient);

			CustomToaster.successToast(t("toast.success.post_created"));

			reset();
		} catch (error) {
			const fieldErrors = socialFieldErrors(error);

			if (fieldErrors?.content) {
				setContentError(fieldErrors.content[0]);
			} else {
				CustomToaster.errorToast(
					t(socialErrorMessageKey(error, "post-images"), {
						max: POST_MAX_IMAGES,
					}),
				);
			}
		} finally {
			setIsPublishing(false);
		}
	};

	return (
		<Card className="w-full gap-3 p-4">
			<Textarea
				value={content}
				rows={3}
				maxLength={POST_CONTENT_MAX_LENGTH}
				placeholder={t("social.post.create_placeholder")}
				onChange={(event) => setContent(event.target.value)}
			/>

			{contentError && (
				<span className="text-sm text-destructive">{contentError}</span>
			)}

			{images.length > 0 && (
				<div className="grid grid-cols-5 gap-2">
					{images.map((image) => (
						<div key={image.id} className="group relative aspect-square">
							<img
								src={image.previewUrl}
								alt={image.file.name}
								className="h-full w-full rounded-lg object-cover"
							/>
							<Button
								type="button"
								variant="secondary"
								size="icon"
								className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100"
								onClick={() => removeImage(image.id)}
								aria-label={t("general.remove")}
							>
								<X className="size-3" />
							</Button>
						</div>
					))}
				</div>
			)}

			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button
						variant={"secondary"}
						size={"sm"}
						disabled={isPublishing || images.length >= POST_MAX_IMAGES}
						onClick={() => fileInputRef.current?.click()}
					>
						<ImagePlus /> {t("social.post.add_images")}
					</Button>
					<span className="text-xs text-muted-foreground">
						{images.length}/{POST_MAX_IMAGES}
					</span>
				</div>

				<div className="flex items-center gap-3">
					<span className="text-xs text-muted-foreground">
						{content.length}/{POST_CONTENT_MAX_LENGTH}
					</span>
					<Button onClick={handlePublish} disabled={isPublishing}>
						{isPublishing ? <Spinner /> : <Send />}
						{t("social.post.publish")}
					</Button>
				</div>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={POST_IMAGE_ACCEPTED_TYPES.join(",")}
				className="hidden"
				onChange={handleAddImages}
			/>
		</Card>
	);
}
