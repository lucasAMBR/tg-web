import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import useDebounce from "@/hooks/use-debounce";
import { useIndexLanguage } from "@/api/generated/languages-doc/languages-doc";

// UI Components
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Card, CardFooter } from "@/components/ui/card";
import { CheckIcon, ChevronsUpDownIcon, Loader2, RotateCcw, Save, XIcon } from "lucide-react";
import { UpdateFlexibilityPreferences, type IUpdateFlexibilityPreferences } from "@/schemas/settings/UpdateStackFlexibilityPreference";
import type { RecommendationPreferencesModel } from "@/api/generated/models";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDevRecommendationPreferenceQueryKey, useUpdateRecommedationPreferences } from "@/api/generated/recommendation-preferences/recommendation-preferences";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { Spinner } from "../ui/spinner";

interface CustomStackRecommendationProps{
    profileId: string,
    initialData: RecommendationPreferencesModel
}

export default function CustomStackRecommendation({ profileId, initialData }: CustomStackRecommendationProps) {
    
    const queryClient = useQueryClient();

    const {
        mutate: updatePreferences,
        isPending
    } = useUpdateRecommedationPreferences();
    
    const [open, setOpen] = useState<boolean>(false);
    const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("");
    const debounceSearchTerm = useDebounce(languageSearchTerm, 500);

    // Cache para manter os nomes dos idiomas selecionados visíveis quando o termo de busca mudar
    const [selectedObjects, setSelectedObjects] = useState<{ id: string; name: string }[]>(
        initialData.blackListedLanguages ?? []
    );

    const form = useForm<IUpdateFlexibilityPreferences>({
        resolver: zodResolver(UpdateFlexibilityPreferences),
        defaultValues: {
            allow_stack_flexibility: initialData?.allow_stack_flexibility ?? false,
            languages_blacklist: initialData?.blackListedLanguages.map((l) => l.id) ?? [],
        },
        values: {
            allow_stack_flexibility: initialData?.allow_stack_flexibility ?? false,
            languages_blacklist: initialData?.blackListedLanguages.map((l) => l.id) ?? [],
        }
    });

    const flexibility = form.watch('allow_stack_flexibility');
    const blacklist = form.watch('languages_blacklist');

    const valuesAreEqualToDefault = flexibility === true && blacklist.length === 0;

    const { data: languages, isLoading } = useIndexLanguage({
        search: debounceSearchTerm,
    });

    const languagesList = languages?.data.data ?? [];

    const sendPreferences = (data: IUpdateFlexibilityPreferences) => {
        updatePreferences({ profileId: profileId, data }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);

                queryClient.invalidateQueries({ queryKey: getGetDevRecommendationPreferenceQueryKey(profileId) });

                form.reset(data);
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    const reset = () => {
        updatePreferences({ profileId: profileId, data: {
            allow_stack_flexibility: true,
            languages_blacklist: []
        } }, {
            onSuccess: () => {
                CustomToaster.successToast("Default configuration restored!");

                queryClient.invalidateQueries({ queryKey: getGetDevRecommendationPreferenceQueryKey(profileId) });

                form.reset( {
                    allow_stack_flexibility: true,
                    languages_blacklist: []
                });
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    return (
        <Card className="p-6 flex-1">
            <form onSubmit={form.handleSubmit(sendPreferences)} className="flex flex-col gap-8">
                
                {/* Switch de Flexibilidade */}
                <Controller
                    control={form.control}
                    name="allow_stack_flexibility"
                    render={({ field, fieldState }) => (
                        <Field className="flex flex-row items-center gap-4">
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <div className="flex flex-col">
                                <FieldLabel>Recommendation flexibility</FieldLabel>
                                <p className="text-sm text-muted-foreground">
                                    Enable this to discover roles beyond your exact tech stack. The algorithm will broaden your recommendations to include jobs where your core skills are transferable, even if the specific languages or frameworks differ.
                                </p>
                            </div>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                {/* Combobox de Blacklist */}
                <Controller
                    control={form.control}
                    name="languages_blacklist"
                    render={({ field, fieldState }) => {
                        const currentIds = field.value || [];

                        const toggleSelection = (id: string, name: string) => {
                            const isSelected = currentIds.includes(id);
                            let nextIds: string[];

                            if (isSelected) {
                                nextIds = currentIds.filter((v: string) => v !== id);
                            } else {
                                nextIds = [...currentIds, id];
                                // Adiciona ao cache se não existir, garantindo a exibição do nome
                                if (!selectedObjects.some((obj) => obj.id === id)) {
                                    setSelectedObjects((prev) => [...prev, { id, name }]);
                                }
                            }
                            
                            // Dispara a atualização realocando o array de IDs tipado
                            field.onChange(nextIds);
                        };

                        return (
                            <Field className="flex-1">
                                <FieldLabel>Stack blacklist</FieldLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="h-auto w-full justify-between hover:bg-transparent"
                                        >
                                            <div className="flex flex-wrap items-center gap-1 pr-2.5">
                                                {currentIds.length > 0 ? (
                                                    currentIds.map((id: string) => {
                                                        const lang =
                                                            languagesList.find((l) => l.id === id) ||
                                                            selectedObjects.find((obj) => obj.id === id);

                                                        return (
                                                            <Badge
                                                                key={id}
                                                                variant="secondary"
                                                                className="rounded-sm"
                                                            >
                                                                {lang?.name || id}
                                                                <span
                                                                    className="ml-1 cursor-pointer hover:bg-muted rounded-full"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
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
                                                    <span className="text-muted-foreground font-normal">
                                                        Select languages to avoid...
                                                    </span>
                                                )}
                                            </div>
                                            <ChevronsUpDownIcon className="opacity-50 shrink-0 size-4" />
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
                                                {isLoading && (
                                                    <div className="flex items-center justify-center p-4">
                                                        <Loader2 className="animate-spin size-4 mr-2" />
                                                    </div>
                                                )}
                                                {!isLoading && <CommandEmpty>No language found.</CommandEmpty>}
                                                <CommandGroup>
                                                    {languagesList?.map((lang) => (
                                                        <CommandItem
                                                            key={lang.id}
                                                            value={lang.id}
                                                            onSelect={() => toggleSelection(lang.id, lang.name)}
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
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        );
                    }}
                />
                <CardFooter className="gap-2 justify-end p-0">
                    <Button type="button" onClick={reset} variant={"outline"} disabled={valuesAreEqualToDefault}><RotateCcw /> Reset</Button>
                    <Button type="submit" disabled={ isPending || !form.formState.isDirty }>{ isPending ? <Spinner /> : <><Save /> Save</> }</Button>
                </CardFooter>
            </form>
        </Card>
    );
}