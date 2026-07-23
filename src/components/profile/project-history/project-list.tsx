import {
	getIndexProjectHistoryQueryKey,
	useDeleteProjectHistory,
	useIndexProjectHistory,
	useUpdateProjectHistory,
} from "@/api/generated/project-history-doc/project-history-doc";
import DefaultPagination, {
	type GenericPagination,
} from "@/components/global/pagination";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	BrushCleaning,
	CheckIcon,
	ChevronsUpDownIcon,
	Folder,
	Loader2,
	Search,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import ProjectItemCard from "./project-item-card";
import type { ProjectHistoryModel } from "@/api/generated/models";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import {
	UpdateProjectSchema,
	type IUpdateProjectSchema,
	type UpdateProjectFormInput,
} from "@/schemas/project-history/UpdateProjectSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useIndexLanguage } from "@/api/generated/languages-doc/languages-doc";
import useDebounce from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import ManageProjectGallery from "./manage-project-gallery";
import { useProjectHistoryParams } from "@/hooks/filters/use-project-history-filters";
import { useTranslation } from "react-i18next";

interface ProjectHistoryListProps {
	profileId: string;
}

export default function ProjectHistoryList({
	profileId,
}: ProjectHistoryListProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { page, perPage, search, setFilterParams } = useProjectHistoryParams();

	const debouncedSearch = useDebounce(search, 500);

	const clearFilters = () => {
		setFilterParams({ page: 1, perPage: 10, search: "" });
	};

	const [selectedProject, setSelectedProject] =
		useState<ProjectHistoryModel | null>(null);

	const [deleteModalIsOpen, setDeleteIsOpen] = useState<boolean>(false);

	const openDelete = (project: ProjectHistoryModel) => {
		setDeleteIsOpen(true);
		setSelectedProject(project);
	};

	const closeDelete = () => {
		setDeleteIsOpen(false);
		setSelectedProject(null);
	};

	const [manageGalleryModalIsOpen, setManageGalleryModalIsOpen] =
		useState<boolean>(false);

	const openManageGallery = (project: ProjectHistoryModel) => {
		setManageGalleryModalIsOpen(true);
		setSelectedProject(project);
	};

	const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false);

	const openUpdate = (project: ProjectHistoryModel) => {
		setUpdateModalIsOpen(true);
		setSelectedProject(project);
	};

	const closeUpdate = () => {
		setUpdateModalIsOpen(false);
		setSelectedProject(null);
	};

	const { data: projectHistory } = useIndexProjectHistory({
		dev_profile_id: profileId,
		page,
		per_page: perPage,
		search: debouncedSearch,
	});

	const { mutate: deleteProject, isPending: deleteIsPending } =
		useDeleteProjectHistory();

	const handleDelete = () => {
		if (!selectedProject) return;

		deleteProject(
			{ id: selectedProject.id },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.project_deleted"));
					queryClient.invalidateQueries({
						queryKey: getIndexProjectHistoryQueryKey({ dev_profile_id: profileId }),
					});
					closeDelete();
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	const [open, setOpen] = useState<boolean>(false);

	const { mutate: updateProject, isPending } = useUpdateProjectHistory();

	const form = useForm<
		UpdateProjectFormInput,
		unknown,
		IUpdateProjectSchema
	>({
		resolver: zodResolver(UpdateProjectSchema),
		defaultValues: {
			title: selectedProject?.title ?? "",
			description: selectedProject?.description ?? "",
			languages:
				selectedProject?.languages.map((language) => language.id) ?? [],
			prod_url: selectedProject?.prod_url ?? "",
			github_url: selectedProject?.github_url ?? "",
		},
	});

	useEffect(() => {
		if (selectedProject) {
			// 1. Reset do formulário
			form.reset({
				title: selectedProject.title,
				description: selectedProject.description,
				languages: selectedProject.languages.map((l) => l.id),
				prod_url: selectedProject.prod_url ?? "",
				github_url: selectedProject.github_url ?? "",
			});

			// 2. Sincronizar o cache de nomes para que o ID bruto não apareça
			setSelectedLanguages((prev) => {
				const newLangs = [...prev];
				selectedProject.languages.forEach((lang) => {
					if (!newLangs.find((obj) => obj.id === lang.id)) {
						newLangs.push({ id: lang.id, name: lang.name });
					}
				});
				return newLangs;
			});
		}
	}, [selectedProject, form]);

	const handleUpdate = (data: IUpdateProjectSchema) => {
		if (!selectedProject) return;

		updateProject(
			{ id: selectedProject.id, data },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.project_updated"));

					queryClient.invalidateQueries({
						queryKey: getIndexProjectHistoryQueryKey({ dev_profile_id: profileId }),
					});

					closeUpdate();
				},
			},
		);
	};

	const projectHistoryList = projectHistory?.data.data ?? [];

	const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("");
	const debounceSearchTerm = useDebounce(languageSearchTerm, 500);

	const { data: languages, isLoading: languageIsLoading } = useIndexLanguage({
		search: debounceSearchTerm,
	});

	const languagesList = languages?.data.data ?? [];

	const [selectedLanguages, setSelectedLanguages] = useState<
		{ id: string; name: string }[]
	>([]);

	return (
		<div className="flex flex-col gap-3">
			<Card className="p-4 flex flex-row gap-2">
				<div className="relative flex-1">
					<div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
						<Search className="size-4" />
						<span className="sr-only">User</span>
					</div>
					<Input
						value={search}
						onChange={(e) => setFilterParams({ search: e.target.value })}
						type="text"
						placeholder={t("placeholder.project_search")}
						className="peer pl-9"
					/>
				</div>
				<Button variant={"secondary"} onClick={clearFilters}>
					<BrushCleaning className="size-4" /> {t("general.clear")}
				</Button>
			</Card>
			{projectHistoryList.length === 0 && (
				<Card>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant={"icon"}>
								<Folder />
							</EmptyMedia>
							<EmptyTitle>{t("dev_profile.projects.no_projects")}</EmptyTitle>
						</EmptyHeader>
					</Empty>
				</Card>
			)}
			{projectHistoryList.length > 0 && (
				<div className="flex flex-col gap-3">
					{projectHistoryList.map((project) => (
						<ProjectItemCard
							key={project.id}
							project={project}
							openDeleteModal={openDelete}
							openUpdateModal={openUpdate}
							openManageGallery={openManageGallery}
						/>
					))}
				</div>
			)}
			<Card className="p-4 bg-muted">
				<DefaultPagination
					data={projectHistory?.data.pagination as GenericPagination}
					setPage={(p) => setFilterParams({ page: p })}
					setPerPage={(pp) => setFilterParams({ perPage: pp })}
				/>
			</Card>
			<AlertDialog open={deleteModalIsOpen} onOpenChange={setDeleteIsOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("dev_profile.projects.delete_project")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("dev_profile.projects.delete_project_description")}
							<span className="font-bold"> {selectedProject?.title}</span>.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={closeDelete}>
							{t("general.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							variant={"destructive"}
							disabled={deleteIsPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteIsPending ? <Spinner /> : t("general.delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<Dialog open={updateModalIsOpen} onOpenChange={setUpdateModalIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("dev_profile.projects.update_project")}</DialogTitle>
						<DialogDescription>
							{t("dev_profile.projects.update_project_description")}
						</DialogDescription>
					</DialogHeader>
					<form
						className="flex flex-col gap-2"
						onSubmit={form.handleSubmit(handleUpdate)}
					>
						<Controller
							control={form.control}
							name="title"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>{t("input.title")}</FieldLabel>
									<Input
										value={field.value}
										onChange={field.onChange}
										placeholder={t("placeholder.project_title")}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="description"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>{t("input.description")}</FieldLabel>
									<Textarea
										value={field.value}
										onChange={field.onChange}
										placeholder={t("placeholder.project_description")}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="languages"
							render={({ field }) => {
								const currentIds = field.value || [];

								const toggleSelection = (id: string, name: string) => {
									const currentIds = form.getValues("languages") || [];
									const isSelected = currentIds.includes(id);

									if (isSelected) {
										form.setValue(
											"languages",
											currentIds.filter((v: string) => v !== id),
										);
									} else {
										form.setValue("languages", [...currentIds, id]);
										// Adiciona ao cache apenas se tivermos o nome (vindo da busca ou do projeto)
										if (
											name &&
											!selectedLanguages.find((obj) => obj.id === id)
										) {
											setSelectedLanguages((prev) => [...prev, { id, name }]);
										}
									}
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
																const lang =
																	languagesList.find((l) => l.id === id) ||
																	selectedLanguages.find(
																		(obj) => obj.id === id,
																	);

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
														{languageIsLoading && (
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
						<Controller
							control={form.control}
							name="prod_url"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>{t("input.prod_url")}</FieldLabel>
									<Input
										value={field.value ?? ""}
										onChange={field.onChange}
										type="url"
										inputMode="url"
										autoComplete="off"
										placeholder={t("placeholder.project_prod_url")}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="github_url"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>{t("input.github_url")}</FieldLabel>
									<Input
										value={field.value ?? ""}
										onChange={field.onChange}
										type="url"
										inputMode="url"
										autoComplete="off"
										placeholder={t("placeholder.project_github_url")}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<div className="flex w-full justify-end mt-4 gap-2">
							<Button type="submit" disabled={isPending}>
								{isPending ? <Spinner /> : t("general.update")}
							</Button>
							<Button type="button" variant={"outline"} onClick={closeUpdate}>
								{t("general.cancel")}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
			<ManageProjectGallery
				profileId={profileId}
				projectId={selectedProject?.id as string}
				open={manageGalleryModalIsOpen}
				onOpenChange={setManageGalleryModalIsOpen}
			/>
		</div>
	);
}
