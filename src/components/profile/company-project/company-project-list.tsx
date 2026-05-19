import { getIndexCompanyProjectQueryKey, useDeleteCompanyProject, useIndexCompanyProject, useUpdateCompanyProject } from "@/api/generated/company-projects-doc/company-projects-doc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useCompanyProjectsParams } from "@/hooks/filters/use-company-project-filters";
import useDebounce from "@/hooks/use-debounce";
import { BrushCleaning, CheckIcon, ChevronsUpDownIcon, Folder, Loader2, Search, XIcon } from "lucide-react";

import DefaultPagination, {
	type GenericPagination,
} from "@/components/global/pagination";
import CompanyProjectCard from "./company-project-card";
import { useEffect, useState } from "react";
import type { CompanyProjectModel } from "@/api/generated/models";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { UpdateCompanyProjectSchema, type IUpdateCompanyProjectSchema } from "@/schemas/company-project/UpdateCompanyProjectSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useIndexLanguage } from "@/api/generated/languages-doc/languages-doc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface CompanyProjectsListProps{
    profileId: string;
}

export default function CompanyProjectList({ profileId }: CompanyProjectsListProps){

    const queryClient = useQueryClient();

    const {
        page,
        perPage,
        search,
        setFilterParams
    } = useCompanyProjectsParams();

    const debouncedSearch = useDebounce(search, 500);

    const clearFilters = () => {
        setFilterParams({page: 1, perPage: 10, search: ""});
    }

    const {
        data: projects,
        isPending
    } = useIndexCompanyProject({
        profile_id: profileId,
        page: page,
        per_page: perPage,
        search: debouncedSearch
    });

    const projectList = projects?.data.data ?? [];

    const [selectedProject, setSelectedProject] =
        useState<CompanyProjectModel | null>(null);

    const [deleteModalIsOpen, setDeleteIsOpen] = useState<boolean>(false);
    
    const openDelete = (project: CompanyProjectModel) => {
        setDeleteIsOpen(true);
        setSelectedProject(project);
    };

    const closeDelete = () => {
        setDeleteIsOpen(false);
        setSelectedProject(null);
    };

    const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false);
    
    const openUpdate = (project: CompanyProjectModel) => {
        setUpdateModalIsOpen(true);
        setSelectedProject(project);
    };

    const closeUpdate = () => {
        setUpdateModalIsOpen(false);
        setSelectedProject(null);
    };

    const { mutate: deleteProject, isPending: deleteIsPending } =
        useDeleteCompanyProject();

    const handleDelete = () => {
        if (!selectedProject) return;

        deleteProject( {companyProject: selectedProject.id} ,{
                onSuccess: (success) => {
                    CustomToaster.successToast(success.message);
                    queryClient.invalidateQueries({
                        queryKey: getIndexCompanyProjectQueryKey(),
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

    const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("");
    const debounceSearchTerm = useDebounce(languageSearchTerm, 500);
    
    const { data: languages, isLoading: languageIsLoading } = useIndexLanguage({
        search: debounceSearchTerm,
    });

    const languagesList = languages?.data.data ?? [];
    
    const [selectedLanguages, setSelectedLanguages] = useState<
        { id: string; name: string }[]
    >([]);

    const { mutate: updateProject } = useUpdateCompanyProject();

    const form = useForm<IUpdateCompanyProjectSchema>({
        resolver: zodResolver(UpdateCompanyProjectSchema),
        defaultValues: {
            title: selectedProject?.title ?? "",
            description: selectedProject?.description ?? "",
            languages:
                selectedProject?.languages.map((language) => language.id) ?? [],
        },
    });

    useEffect(() => {
        if (selectedProject) {
            // 1. Reset do formulário
            form.reset({
                title: selectedProject.title,
                description: selectedProject.description,
                languages: selectedProject.languages.map((l) => l.id),
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

    const handleUpdate = (data: IUpdateCompanyProjectSchema) => {
        if (!selectedProject) return;

        updateProject(
            { companyProject: selectedProject.id, data },
            {
                onSuccess: (success) => {
                    CustomToaster.successToast(success.message);

                    queryClient.invalidateQueries({
                        queryKey: getIndexCompanyProjectQueryKey(),
                    });

                    closeUpdate();
                },
            },
        );
    };

    return(
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
						placeholder="Search for an especific project, language, framework or description"
						className="peer pl-9"
					/>
				</div>
				<Button variant={"secondary"} onClick={clearFilters}>
					<BrushCleaning className="size-4" /> Clear
				</Button>
			</Card>
            {projectList.length === 0 && (
                <Card>
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant={"icon"}>
                                <Folder />
                            </EmptyMedia>
                            <EmptyTitle>No projects yet</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                </Card>
            )}
            {projectList.length > 0 && (
                <div className="flex flex-col gap-3">
                    {projectList.map((project) => (
                        <CompanyProjectCard 
                            project={project}
                            openDelete={openDelete}
                            openUpdate={openUpdate}
                        />
                    ))}
                </div>
            )}
            <Card className="p-4 bg-muted">
                <DefaultPagination
                    data={projects?.data.pagination as GenericPagination}
                    setPage={(p) => setFilterParams({ page: p })}
                    setPerPage={(pp) => setFilterParams({ perPage: pp })}
                />
            </Card>
            <AlertDialog open={deleteModalIsOpen} onOpenChange={setDeleteIsOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will delete permanently the
                            following project:
                            <span className="font-bold"> {selectedProject?.title}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDelete}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant={"destructive"}
                            onClick={handleDelete}
                            disabled={deleteIsPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteIsPending ? <Spinner /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={updateModalIsOpen} onOpenChange={setUpdateModalIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Project</DialogTitle>
                        <DialogDescription>
                            Here you can update your project data
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
                                    <FieldLabel>Title</FieldLabel>
                                    <Input
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Project title"
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
                                    <FieldLabel>Description</FieldLabel>
                                    <Textarea
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Project description"
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
                                        <FieldLabel>Languages / Frameworks</FieldLabel>
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
                                                                Select languages...
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ChevronsUpDownIcon className="opacity-50 shrink-0" />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="Search language..."
                                                        value={languageSearchTerm}
                                                        onValueChange={setLanguageSearchTerm}
                                                    />
                                                    <CommandList>
                                                        {languageIsLoading && (
                                                            <div className="flex items-center justify-center p-4">
                                                                <Loader2 className="animate-spin size-4 mr-2" />
                                                            </div>
                                                        )}
                                                        <CommandEmpty>No language found.</CommandEmpty>
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

                        <div className="flex w-full justify-end mt-4 gap-2">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? <Spinner /> : "Update"}
                            </Button>
                            <Button type="button" variant={"outline"} onClick={closeUpdate}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}