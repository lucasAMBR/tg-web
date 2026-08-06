import { getGetCompanyStackQueryKey, useSyncCompanyStack } from "@/api/generated/profile/profile";
import { useIndexLanguage } from "@/api/generated/language/language";
import type { LanguageResource } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { SyncCompanyStack, type ISyncCompanyStack } from "@/schemas/company-stack/SyncCompanyStack";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import useDebounce from "@/hooks/use-debounce";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { CheckIcon, ChevronsUpDownIcon, Loader2, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreateCompanyStackDialogProps {
    profileId: string
    open: boolean
    initialData?: LanguageResource[]
    openChange: (open: boolean) => void
}

export default function CreateCompanyStackDialog({ profileId, initialData, open, openChange }: CreateCompanyStackDialogProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [languageSearchTerm, setLanguageSearchTerm] = useState("");
    const debounceSearchTerm = useDebounce(languageSearchTerm, 500);
    
    // O estado inicial pode ser vazio, o useEffect cuidará de preenchê-lo
    const [selectedLanguages, setSelectedLanguages] = useState<{ id: string; name: string }[]>([]);

    const { data: languages, isLoading: languageIsLoading } = useIndexLanguage({
        search: debounceSearchTerm,
    });
    const languagesList = languages?.data.data ?? [];

    const { mutate: syncStack, isPending } = useSyncCompanyStack();

    const form = useForm<ISyncCompanyStack>({
        resolver: zodResolver(SyncCompanyStack),
        defaultValues: {
            languages: []
        }
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                languages: initialData.map((lang) => lang.id)
            });
            
            setSelectedLanguages(
                initialData.map((lang) => ({ id: lang.id, name: lang.name }))
            );
        } else if (!open) {
            form.reset({ languages: [] });
            setSelectedLanguages([]);
            setLanguageSearchTerm("");
        }
    }, [open, initialData, form]);

    const handleSync = (data: ISyncCompanyStack) => {
        syncStack({ id: profileId, data }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.company_stack_updated"));
                queryClient.invalidateQueries({ queryKey: getGetCompanyStackQueryKey(profileId) });
                openChange(false);
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={openChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("company_profile.stack.register_title")}</DialogTitle>
                    <DialogDescription>{t("company_profile.stack.register_description")}</DialogDescription>
                </DialogHeader>
                <Card className="p-4">
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSync)}>
                        <Controller
                            control={form.control}
                            name="languages"
                            render={({ field }) => {
                                const currentIds = field.value || [];

                                const toggleSelection = (id: string, name: string) => {
                                    const isSelected = currentIds.includes(id);
                                    if (isSelected) {
                                        form.setValue("languages", currentIds.filter((v: string) => v !== id));
                                    } else {
                                        form.setValue("languages", [...currentIds, id]);
                                        if (name && !selectedLanguages.find((obj) => obj.id === id)) {
                                            setSelectedLanguages((prev) => [...prev, { id, name }]);
                                        }
                                    }
                                };
                                return (
                                    <Field>
                                        <FieldLabel>{t("input.language_framework")}</FieldLabel>
                                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className="h-auto w-full justify-between hover:bg-transparent">
                                                    <div className="flex flex-wrap items-center gap-1 pr-2.5">
                                                        {currentIds.length > 0 ? (
                                                            currentIds.map((id) => {
                                                                const lang = languagesList.find((l) => l.id === id) || selectedLanguages.find((obj) => obj.id === id);
                                                                return (
                                                                    <Badge key={id} variant="secondary" className="rounded-sm">
                                                                        {lang?.name || id}
                                                                        <span className="ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelection(id, lang?.name || ""); }}>
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
                                                        {languageIsLoading && <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin size-4" /></div>}
                                                        <CommandEmpty>{t("no_data.no_languages")}</CommandEmpty>
                                                        <CommandGroup>
                                                            {languagesList?.map((lang) => (
                                                                <CommandItem key={lang.id} value={lang.id} onSelect={() => toggleSelection(lang.id, lang.name)}>
                                                                    {lang.name}
                                                                    {currentIds.includes(lang.id) && <CheckIcon className="ml-auto size-4" />}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </Field>
                                );
                            }}
                        />
                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? <Spinner /> : t("general.save")}
                        </Button>
                    </form>
                </Card>
            </DialogContent>
        </Dialog>
    );
}