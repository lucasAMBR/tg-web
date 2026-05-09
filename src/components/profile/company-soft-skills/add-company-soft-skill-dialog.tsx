import { getIndexCompanySoftSkillsQueryKey, useIndexSoftSkill, useStoreCompanySoftSkill } from "@/api/generated/soft-skill-doc/soft-skill-doc";
import type { CompanySoftSkillModel } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { CreateCompanySoftSkillSchema, type ICreateCompanySoftSkillSchema } from "@/schemas/company-soft-skill/CreateCompanySoftSkillSchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CheckIcon, ChevronsUpDownIcon, Loader2, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface AddCompanySoftSkillDialogProps{
    profileId: string;
    open: boolean;
    initialData?: CompanySoftSkillModel[];
    openChange: (open: boolean) => void
}
export default function AddCompanySoftSkillDialog({ profileId, open, initialData, openChange }: AddCompanySoftSkillDialogProps) {

    const queryClient = useQueryClient();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [softSkillSearchTerm, setSoftSkillSearchTerm] = useState("");
    const [selectedSoftSkills, setSelectedSoftSkills] = useState<{ id: string; name: string }[]>([]);

    const { mutate: storeCompanySoftSkill, isPending } = useStoreCompanySoftSkill();

    const { data: softSkills, isLoading } = useIndexSoftSkill();

    const softSkillsList = softSkills?.data ?? [];

    const form = useForm<ICreateCompanySoftSkillSchema>({
        resolver: zodResolver(CreateCompanySoftSkillSchema),
        defaultValues: {
            soft_skills: []
        }
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                soft_skills: initialData.map((skill) => skill.soft_skill_id),
            });
            setSelectedSoftSkills(initialData.map((skill) => ({ id: skill.soft_skill_id, name: skill.soft_skill.name})));
            return;
        }

        if (!open) {
            form.reset({ soft_skills: [] });
            setSelectedSoftSkills([]);
            setSoftSkillSearchTerm("");
            setPopoverOpen(false);
        }
    }, [open, initialData, form]);

    const handleSubmit = (data: ICreateCompanySoftSkillSchema) => {
        storeCompanySoftSkill({ company: profileId, data }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);
                queryClient.invalidateQueries({ queryKey: getIndexCompanySoftSkillsQueryKey(profileId) });
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
                    <DialogTitle>{initialData ? "Update Company Soft Skills" : "Add Company Soft Skills"}</DialogTitle>
                </DialogHeader>
                <Card className="p-4">
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
                        <Controller
                            control={form.control}
                            name="soft_skills"
                            render={({ field }) => {
                                const currentIds = field.value || [];
                                const filteredSkills = softSkillsList.filter((skill) =>
                                    skill.name.toLowerCase().includes(softSkillSearchTerm.toLowerCase()),
                                );

                                const toggleSelection = (id: string, name: string) => {
                                    const isSelected = currentIds.includes(id);

                                    if (isSelected) {
                                        form.setValue("soft_skills", currentIds.filter((value: string) => value !== id));
                                        return;
                                    }

                                    form.setValue("soft_skills", [...currentIds, id]);
                                    if (name && !selectedSoftSkills.find((skill) => skill.id === id)) {
                                        setSelectedSoftSkills((prev) => [...prev, { id, name }]);
                                    }
                                };

                                return (
                                    <Field>
                                        <FieldLabel>Valued skills</FieldLabel>
                                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className="h-auto w-full justify-between hover:bg-transparent">
                                                    <div className="flex flex-wrap items-center gap-1 pr-2.5">
                                                        {currentIds.length > 0 ? (
                                                            currentIds.map((id) => {
                                                                const softSkill = softSkillsList.find((skill) => skill.id === id) || selectedSoftSkills.find((skill) => skill.id === id);
                                                                return (
                                                                    <Badge key={id} variant="secondary" className="rounded-sm">
                                                                        {softSkill?.name || id}
                                                                        <span
                                                                            className="ml-1 cursor-pointer"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                toggleSelection(id, softSkill?.name || "");
                                                                            }}
                                                                        >
                                                                            <XIcon className="size-3" />
                                                                        </span>
                                                                    </Badge>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-muted-foreground">Select soft skills...</span>
                                                        )}
                                                    </div>
                                                    <ChevronsUpDownIcon className="shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="Search soft skill..."
                                                        value={softSkillSearchTerm}
                                                        onValueChange={setSoftSkillSearchTerm}
                                                    />
                                                    <CommandList>
                                                        {isLoading && (
                                                            <div className="flex items-center justify-center p-4">
                                                                <Loader2 className="size-4 animate-spin" />
                                                            </div>
                                                        )}
                                                        <CommandEmpty>No soft skill found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {filteredSkills.map((skill) => (
                                                                <CommandItem
                                                                    key={skill.id}
                                                                    value={skill.id}
                                                                    onSelect={() => toggleSelection(skill.id, skill.name)}
                                                                >
                                                                    {skill.name}
                                                                    {currentIds.includes(skill.id) && <CheckIcon className="ml-auto size-4" />}
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
                            {isPending ? <Spinner /> : initialData ? "Update Soft Skills" : "Save Soft Skills"}
                        </Button>
                    </form>
                </Card>
            </DialogContent>
        </Dialog>
    );
}