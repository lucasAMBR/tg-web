import {
	getIndexProjectHistoryQueryKey,
	getShowProjectHistoryQueryKey,
	useDeleteProjectHistoryImage,
	useShowProjectHistory,
	useStoreProjectHistoryImages,
} from "@/api/generated/project-history/project-history";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { env } from "@/utils/env";
import { onError } from "@/utils/on-error";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2, Plus, XIcon } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface ManageProjectModalProps {
	projectId: string;
	profileId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function ManageProjectGallery({
	projectId,
	open,
	onOpenChange,
}: ManageProjectModalProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: projectData, isLoading } = useShowProjectHistory(projectId);

	const MAX_IMAGES = 3;
	const currentImages = projectData?.data.gallery ?? [];
	const emptySlots = Math.max(0, MAX_IMAGES - currentImages.length);

	const { mutateAsync, isPending } = useStoreProjectHistoryImages();

	const { mutate: deleteImage } = useDeleteProjectHistoryImage();

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const remainingSlots = MAX_IMAGES - currentImages.length;

		if (remainingSlots <= 0) {
			CustomToaster.errorToast("Limite de imagens atingido.");
			return;
		}

		const selectedFiles = Array.from(files).slice(0, remainingSlots);

		try {
			const imagesPayload: Record<string, File> = {};

			selectedFiles.forEach((file, index) => {
				imagesPayload[`images[${index}]`] = file;
			});

			await mutateAsync({
				id: projectId,
				data: imagesPayload as any,
			});

			CustomToaster.successToast(t("toast.success.project_gallery_images_added"));

			queryClient.invalidateQueries({
				queryKey: getShowProjectHistoryQueryKey(projectId),
			});

			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			console.error("Erro no upload:", error);
			CustomToaster.errorToast("Erro ao enviar imagem.");
		}
	};

	const handleDeleteImage = (imageId: string) => {
		deleteImage(
			{ id: projectId, imageId: imageId },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.project_gallery_image_deleted"));

					queryClient.invalidateQueries({
						queryKey: getShowProjectHistoryQueryKey(projectId),
					});
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	const closeAndUpdate = () => {
		queryClient.invalidateQueries({
			queryKey: getIndexProjectHistoryQueryKey(),
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Manage Project Gallery</DialogTitle>
					<DialogDescription>
						Here you can manage your project gallery
					</DialogDescription>
				</DialogHeader>

				<input
					type="file"
					className="hidden"
					ref={fileInputRef}
					accept="image/*"
					multiple
					onChange={handleFileChange}
				/>

				<div>
					{isLoading && <Spinner />}

					{projectData && (
						<div className="grid grid-cols-3 gap-4">
							{currentImages.map((gallery) => (
								<div key={gallery.id} className="relative">
									<div
										onClick={() => handleDeleteImage(String(gallery.id))}
										className="bg-white cursor-pointer text-red-600 border border-red-600 rounded-full p-1 absolute top-0 right-0 m-1"
									>
										<XIcon className="size-4" />
									</div>
									<img
										src={env.VITE_STORAGE_URL + gallery.original_url}
										alt={gallery.original_url}
										className="rounded-md object-cover w-full h-full"
									/>
								</div>
							))}

							{Array.from({ length: emptySlots }).map((_, index) => (
								<button
									key={`empty-${index}`}
									disabled={isPending}
									onClick={() => fileInputRef.current?.click()}
									className="border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-all rounded-md flex flex-col items-center justify-center aspect-square disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isPending && index === 0 ? (
										<Loader2 className="size-6 animate-spin text-primary" />
									) : (
										<>
											<Plus className="size-6 text-muted-foreground" />
											<span className="text-[10px] uppercase font-bold mt-1 text-muted-foreground">
												Add
											</span>
										</>
									)}
								</button>
							))}
						</div>
					)}
				</div>

				<DialogFooter className="flex gap-2">
					<Button
						className="flex-1"
						variant={"outline"}
						onClick={closeAndUpdate}
					>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
