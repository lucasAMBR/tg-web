import type { ProjectHistoryResource } from "@/api/generated/models";
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
import { externalHref } from "@/utils/external-href";
import Autoplay from "embla-carousel-autoplay";
import { AlertCircle, Edit, EllipsisVertical, Eye, Hourglass, Image, Link, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ProjectItemCardProps {
	project: ProjectHistoryResource;
	openDeleteModal: (project: ProjectHistoryResource) => void;
	openUpdateModal: (project: ProjectHistoryResource) => void;
	openManageGallery: (project: ProjectHistoryResource) => void;
}

export default function ProjectItemCard({
	project,
	openDeleteModal,
	openUpdateModal,
	openManageGallery,
}: ProjectItemCardProps) {
	const { user } = useAuthStore();
	const { t, i18n } = useTranslation();

	const prod = project.prod_url?.trim();
	const gh = project.github_url?.trim();

	const hasTranslation = project.translation_status === 'translated';
	const translationIsPending = project.translation_status === 'pending';
	const translationIsError = project.translation_status === 'error';
	const translationInProgress = project.translation_status === 'translating';

	const [showOriginalContent, setShowOriginalContent] = useState<boolean>(hasTranslation ? false : true);

	return (
		<Card className="p-0 bg-accent border-accent overflow-hidden gap-0">
			{hasTranslation && (
				<div onClick={() => setShowOriginalContent(!showOriginalContent)} className="p-2 text-primary ml-2 text-accent-foreground cursor-pointer text-sm flex items-center gap-1">
					<Eye className="size-3.5" />
					{showOriginalContent ? t("general.display_translated_content") : t("general.display_original_content")}
				</div>
			)}
			{translationIsPending && (
				<div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
					<Hourglass className="size-3.5" />
					{t("general.translation_pending")}
				</div>
			)}
			{translationIsError && (
				<div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
					<AlertCircle className="size-3.5" />
					{t("general.translation_error")}
				</div>
			)}
			{translationInProgress && (
				<div className="p-2 ml-2 text-accent-foreground text-sm flex items-center gap-1">
					<Hourglass className="size-3.5" />
					{t("general.translation_in_progress")}
				</div>
			)}
			<div className="p-4 bg-card rounded-xl">
			<CardHeader className="p-0">
				<div className="flex justify-between gap-2 mb-2 items-start">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
						<CardTitle className="text-xl">
							{showOriginalContent ? project.title : i18n.language === "pt" 
								? (project.title_pt as string) 
								: (project.title_en as string)}
						</CardTitle>
					</div>
					<div className="flex justify-end gap-1">
						<div className="flex shrink-0 items-center gap-1">
                            {prod && (
                                <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                                    <a
                                        href={externalHref(prod)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={t("general.open_link")}
                                    >
                                        <Link className="size-3.5" />
                                        <span className="ml-1 text-xs">App</span>
                                    </a>
                                </Button>
                            )}
                            {gh && (
                                <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                                    <a
                                        href={externalHref(gh)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={t("general.open_link")}
                                    >
										<Link className="size-3.5" />
										<span className="ml-1 text-xs">GitHub</span>
                                    </a>
                                </Button>
                            )}
                        </div>
						{(user?.dev_profile?.id === project.dev_profile_id || user?.role.includes("admin")) && 
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
					}
					</div>
				</div>
				<CardDescription>
					{showOriginalContent ? project.description : i18n.language === "pt" 
						? (project.description_pt as string) 
						: (project.description_en as string)}
				</CardDescription>
				<div className="flex gap-1">
					{project.languages?.map((lang) => (
						<Badge className="bg-accent text-accent-foreground">{lang.name}</Badge>
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
			</div>
		</Card>
	);
}
