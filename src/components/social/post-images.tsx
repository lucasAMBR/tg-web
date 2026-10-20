import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PostResourceImagesItem } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PostImagesProps {
	images: PostResourceImagesItem[];
}

/**
 * Miniatura com queda para a imagem original: o `thumb_url` é gerado depois,
 * pela fila da API, e pode ainda não existir quando o post acaba de ser criado.
 */
function PostThumb({
	image,
	alt,
	className,
}: {
	image: PostResourceImagesItem;
	alt: string;
	className?: string;
}) {
	const [source, setSource] = useState(image.thumb_url);

	return (
		<img
			src={source}
			alt={alt}
			loading="lazy"
			onError={() => {
				if (source !== image.original_url) setSource(image.original_url);
			}}
			className={cn("h-full w-full object-cover", className)}
		/>
	);
}

/** Grade de imagens da postagem, com visualização ampliada ao clicar. */
export default function PostImages({ images }: PostImagesProps) {
	const { t } = useTranslation();

	const [openIndex, setOpenIndex] = useState<number | null>(null);

	if (images.length === 0) return null;

	const current = openIndex === null ? null : images[openIndex];

	const step = (offset: number) => {
		if (openIndex === null) return;

		setOpenIndex((openIndex + offset + images.length) % images.length);
	};

	return (
		<>
			<div
				className={cn(
					"grid gap-1 overflow-hidden rounded-lg",
					images.length === 1 && "grid-cols-1",
					images.length === 2 && "grid-cols-2",
					images.length >= 3 && "grid-cols-3",
				)}
			>
				{images.map((image, index) => (
					<button
						key={image.id}
						type="button"
						onClick={() => setOpenIndex(index)}
						className={cn(
							"cursor-pointer overflow-hidden bg-muted transition-opacity hover:opacity-90",
							images.length === 1 ? "max-h-[32rem]" : "aspect-square",
						)}
						aria-label={t("social.post.open_image")}
					>
						<PostThumb
							image={image}
							alt={t("social.post.image_alt", { index: index + 1 })}
						/>
					</button>
				))}
			</div>

			<Dialog
				open={openIndex !== null}
				onOpenChange={(open) => !open && setOpenIndex(null)}
			>
				<DialogContent
					showCloseButton={false}
					className="max-w-[90vw] border-none bg-transparent p-0 shadow-none sm:max-w-[90vw]"
				>
					<DialogTitle className="sr-only">
						{t("social.post.open_image")}
					</DialogTitle>
					<div className="relative flex items-center justify-center">
						{current && (
							<img
								src={current.original_url}
								alt={t("social.post.image_alt", {
									index: (openIndex ?? 0) + 1,
								})}
								className="max-h-[85vh] w-auto rounded-lg object-contain"
							/>
						)}
						<Button
							variant={"secondary"}
							size={"icon"}
							className="absolute top-2 right-2"
							onClick={() => setOpenIndex(null)}
							aria-label={t("general.close")}
						>
							<X />
						</Button>
						{images.length > 1 && (
							<>
								<Button
									variant={"secondary"}
									size={"icon"}
									className="absolute left-2"
									onClick={() => step(-1)}
									aria-label={t("social.post.previous_image")}
								>
									<ChevronLeft />
								</Button>
								<Button
									variant={"secondary"}
									size={"icon"}
									className="absolute right-2"
									onClick={() => step(1)}
									aria-label={t("social.post.next_image")}
								>
									<ChevronRight />
								</Button>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
