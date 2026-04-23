import type { ProjectHistoryModel } from "@/api/generated/models";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { env } from "@/utils/env";
import Autoplay from "embla-carousel-autoplay";
import { Edit, EllipsisVertical, Image, Trash } from "lucide-react";

interface ProjectItemCardProps {
	project: ProjectHistoryModel;
	openDeleteModal: (project: ProjectHistoryModel) => void;
	openUpdateModal: (project: ProjectHistoryModel) => void;
	openManageGallery: (project: ProjectHistoryModel) => void;
}

export default function ProjectItemCard({
	project,
	openDeleteModal,
	openUpdateModal,
	openManageGallery,
}: ProjectItemCardProps) {
	const { user } = useAuthStore();

	return (
		<Card onClick={() => console.log(project)} className="p-4">
			<CardHeader className="p-0">
				<div className="flex justify-between">
					<CardTitle className="text-xl">{project.title}</CardTitle>
					{user?.dev_profile?.id === project.dev_profile_id && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size={"sm"} variant={"outline"}>
									<EllipsisVertical />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => openUpdateModal(project)}>
									<Edit /> Edit
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => openManageGallery(project)}>
									<Image /> Edit Gallery
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => openDeleteModal(project)}
									variant="destructive"
								>
									<Trash /> Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
				<CardDescription>{project.description}</CardDescription>
				<div className="flex gap-1">
					{project.languages.map((lang) => (
						<Badge>{lang.name}</Badge>
					))}
				</div>
			</CardHeader>
			{project.gallery.length > 0 && (
				<AspectRatio
					ratio={16 / 9}
					className="rounded-md bg-muted overflow-hidden"
				>
					<Carousel
						plugins={[Autoplay({ delay: 3000 })]} // Alternates every 3 seconds
						className="w-full h-full"
					>
						<CarouselContent className="h-full ml-0">
							{project.gallery.map((image) => (
								<CarouselItem key={image.original_url} className="pl-0 h-full">
									<img
										src={env.VITE_STORAGE_URL + image.original_url}
										alt="gallery item"
										className="h-full w-full object-center"
									/>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
				</AspectRatio>
			)}
		</Card>
	);
}
