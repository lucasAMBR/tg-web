import { useIndexLanguage } from "@/api/generated/language/language";
import type { SaveImagesToProjectRequest } from "@/api/generated/models";
import {
	getIndexProjectHistoryQueryKey,
	useStoreProjectHistory,
	useStoreProjectHistoryImages,
} from "@/api/generated/project-history/project-history";
import { ImageUploadField } from "@/components/global/inputs/image-w-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
} from "@/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import useDebounce from "@/hooks/use-debounce";
import {
	CreateProjectSchema,
	type ICreateProjectSchema,
} from "@/schemas/project-history/CreateProjectSchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	Loader2,
	Plus,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface CreateProjectCardProps {
	profileId: string;
}

export default function CreateProjectCard({
	profileId,
}: CreateProjectCardProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const form = useForm<ICreateProjectSchema>({
		resolver: zodResolver(CreateProjectSchema),
		defaultValues: {
			title: "",
			description: "",
			languages: [],
			prod_url: "",
			github_url: "",
			images: [],
		},
	});

	const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("");
	const debounceSearchTerm = useDebounce(languageSearchTerm, 500);

	const { data: languages, isLoading } = useIndexLanguage({
		search: debounceSearchTerm,
	});

	const languagesList = languages?.data.data ?? [];

	const [creationIsOpen, setCreationIsOpen] = useState(false);

	const [open, setOpen] = useState<boolean>(false);
	const [galleryIsOpen, setGalleryIsOpen] = useState<boolean>(false);

	const toggleGalleryIsOpen = (state: boolean) => {
		if (state === false) {
			setGalleryIsOpen(state);
			form.setValue("images", []);
		} else {
			setGalleryIsOpen(state);
		}
	};

	const [selectedObjects, setSelectedObjects] = useState<
		{ id: string; name: string }[]
	>([]);

	const { mutateAsync: createProject } = useStoreProjectHistory();

	const { mutateAsync: storeImages } = useStoreProjectHistoryImages();

	const create = async (data: ICreateProjectSchema) => {
		const { images, ...projectData } = data;

		try {
			const projectItem = await createProject({ data: projectData });

			if (images && images.length > 0) {
				const imagesPayload: SaveImagesToProjectRequest = { images };

				await storeImages({
					id: projectItem.data.id,
					data: imagesPayload,
				});
			}

			CustomToaster.successToast(t("toast.success.project_created"));

			queryClient.invalidateQueries({
				queryKey: getIndexProjectHistoryQueryKey({ dev_profile_id: profileId }),
			});

			form.reset();
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<Card className="p-4">
			<div className="flex flex-row justify-between items-center">
				<h2 className="font-bold text-lg">{t("dev_profile.projects.create_project")}</h2>
				<Button
					size={"icon"}
					onClick={() => setCreationIsOpen(!creationIsOpen)}
				>
					<Plus
						className={
							creationIsOpen
								? "rotate-45 transition-all duration-75"
								: "transition-all duration-75"
						}
					/>
				</Button>
			</div>
			{creationIsOpen && (
				<form
					onSubmit={form.handleSubmit(create)}
					className="flex flex-col gap-3"
				>
					<div className="flex gap-3">
						<Controller
							control={form.control}
							name="title"
							render={({ field }) => (
								<Field className="flex-1">
									<FieldLabel>{t("input.title")}</FieldLabel>
									<Input
										{...field}
										placeholder={t("placeholder.project_title")}
										value={field.value}
										onChange={field.onChange}
									/>
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="languages"
							render={({ field }) => {
								const currentIds = field.value || [];

								const toggleSelection = (id: string, name: string) => {
									const isSelected = currentIds.includes(id);
									let nextIds: string[];

									if (isSelected) {
										nextIds = currentIds.filter((v: string) => v !== id);
										// Opcional: remover do cache para não crescer infinitamente
										setSelectedObjects((prev) =>
											prev.filter((obj) => obj.id !== id),
										);
									} else {
										nextIds = [...currentIds, id];
										// Adiciona ao cache se não existir
										if (!selectedObjects.find((obj) => obj.id === id)) {
											setSelectedObjects((prev) => [...prev, { id, name }]);
										}
									}

									field.onChange(nextIds); // Atualiza o estado do Form (Zod agradece)
								};

								return (
									<Field className="flex-1">
										<FieldLabel>{t("input.language_framework")}</FieldLabel>
										<Popover open={open} onOpenChange={setOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													role="combobox"
													className="h-auto w-full justify-between hover:bg-transparent"
												>
													<div className="flex flex-wrap items-center gap-1 pr-2.5">
														{currentIds.length > 0 ? (
															currentIds.map((id) => {
																// Tenta achar o nome na lista da API ou no nosso cache (selectedObjects)
																const lang =
																	languagesList.find((l) => l.id === id) ||
																	selectedObjects.find((obj) => obj.id === id);

																return (
																	<Badge
																		key={id}
																		variant="secondary"
																		className="rounded-sm"
																	>
																		{lang?.name || id}{" "}
																		{/* Se sumir tudo, mostra o ID (segurança) */}
																		<span
																			className="ml-1 cursor-pointer"
																			onClick={(e) => {
																				e.stopPropagation();
																				toggleSelection(id, lang?.name || "");
																			}}
																		>
																			<XIcon className="size-3" />
																		</span>
																	</Badge>
																);
															})
														) : (
															<span className="text-muted-foreground">
																{t("placeholder.project_language_framework")}
															</span>
														)}
													</div>
													<ChevronsUpDownIcon className="opacity-50 shrink-0" />
												</Button>
											</PopoverTrigger>

											<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
												<Command shouldFilter={false}>
													<CommandInput
														placeholder={t("placeholder.project_language_search")}
														value={languageSearchTerm}
														onValueChange={setLanguageSearchTerm}
													/>
													<CommandList>
														{isLoading && (
															<div className="flex items-center justify-center p-4">
																<Loader2 className="animate-spin size-4 mr-2" />
															</div>
														)}
														<CommandEmpty>{t("no_data.no_languages")}</CommandEmpty>
														<CommandGroup>
															{languagesList?.map((lang) => (
																<CommandItem
																	key={lang.id}
																	value={lang.id}
																	onSelect={() =>
																		toggleSelection(lang.id, lang.name)
																	}
																>
																	{lang.name}
																	{currentIds.includes(lang.id) && (
																		<CheckIcon className="ml-auto size-4" />
																	)}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										{form.formState.errors.languages && (
											<span className="text-destructive text-sm">
												{form.formState.errors.languages.message}
											</span>
										)}
									</Field>
								);
							}}
						/>
					</div>
					<Controller
						control={form.control}
						name="description"
						render={({ field }) => (
							<Field>
								<FieldLabel>{t("input.description")}</FieldLabel>
								<Textarea
									{...field}
									value={field.value}
									onChange={field.onChange}
									placeholder={t("placeholder.project_description")}
								/>
							</Field>
						)}
					/>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Controller
							control={form.control}
							name="prod_url"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel>{t("input.prod_url")}</FieldLabel>
									<Input
										{...field}
										type="url"
										inputMode="url"
										autoComplete="off"
										placeholder={t("placeholder.project_prod_url")}
									/>
									{fieldState.error && (
										<span className="text-destructive text-sm">
											{fieldState.error.message}
										</span>
									)}
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="github_url"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel>{t("input.github_url")}</FieldLabel>
									<Input
										{...field}
										type="url"
										inputMode="url"
										autoComplete="off"
										placeholder={t("placeholder.project_github_url")}
									/>
									{fieldState.error && (
										<span className="text-destructive text-sm">
											{fieldState.error.message}
										</span>
									)}
								</Field>
							)}
						/>
					</div>
					{galleryIsOpen && (
						<ImageUploadField
							control={form.control}
							name="images"
							label={t("input.project_gallery")}
							maxFiles={3}
						/>
					)}
					<div className="flex w-full justify-end mt-4 gap-2">
						<Button
							type="button"
							onClick={() => toggleGalleryIsOpen(!galleryIsOpen)}
							variant={"outline"}
						>
							{galleryIsOpen
								? t("dev_profile.projects.cancel_project_gallery")
								: t("dev_profile.projects.create_project_gallery")}
						</Button>
						<Button>{t("general.create")}</Button>
					</div>
				</form>
			)}
		</Card>
	);
}
