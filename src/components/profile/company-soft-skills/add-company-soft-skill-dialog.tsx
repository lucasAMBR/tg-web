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
import { useTranslation } from "react-i18next";

interface AddCompanySoftSkillDialogProps {
	profileId: string;
	open: boolean;
	initialData?: CompanySoftSkillModel[];
	openChange: (open: boolean) => void;
}

export default function AddCompanySoftSkillDialog({
	profileId,
	open,
	initialData,
	openChange,
}: AddCompanySoftSkillDialogProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [softSkillSearchTerm, setSoftSkillSearchTerm] = useState("");
	const [selectedSoftSkills, setSelectedSoftSkills] = useState<{ id: string; i18nKey: string }[]>([]);

	const { mutate: storeCompanySoftSkill, isPending } = useStoreCompanySoftSkill();

	const { data: softSkills, isLoading } = useIndexSoftSkill();

	const softSkillsList = softSkills?.data ?? [];

	const form = useForm<ICreateCompanySoftSkillSchema>({
		resolver: zodResolver(CreateCompanySoftSkillSchema),
		defaultValues: {
			soft_skills: [],
		},
	});

	useEffect(() => {
		if (open && initialData) {
			form.reset({
				soft_skills: initialData.map((skill) => skill.soft_skill_id),
			});
			setSelectedSoftSkills(
				initialData.map((skill) => ({
					id: skill.soft_skill_id,
					i18nKey: skill.soft_skill.i18n_name_key,
				})),
			);
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
		storeCompanySoftSkill(
			{ company: profileId, data },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.company_soft_skill_added"));
					queryClient.invalidateQueries({ queryKey: getIndexCompanySoftSkillsQueryKey(profileId) });
					openChange(false);
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	const isUpdate = Boolean(initialData?.length);

	const getSoftSkillLabel = (id: string) => {
		const fromList = softSkillsList.find((skill) => skill.id === id);
		if (fromList) return t(fromList.i18n_name_key);
		const selected = selectedSoftSkills.find((skill) => skill.id === id);
		if (selected) return t(selected.i18nKey);
		return id;
	};

	return (
		<Dialog open={open} onOpenChange={openChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isUpdate
							? t("company_profile.soft_skills.update_title")
							: t("company_profile.soft_skills.add_title")}
					</DialogTitle>
				</DialogHeader>
				<Card className="p-4">
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
						<Controller
							control={form.control}
							name="soft_skills"
							render={({ field }) => {
								const currentIds = field.value || [];
								const filteredSkills = softSkillsList.filter((skill) =>
									t(skill.i18n_name_key).toLowerCase().includes(softSkillSearchTerm.toLowerCase()),
								);

								const toggleSelection = (id: string, i18nKey: string) => {
									const isSelected = currentIds.includes(id);

									if (isSelected) {
										form.setValue(
											"soft_skills",
											currentIds.filter((value: string) => value !== id),
										);
										return;
									}

									form.setValue("soft_skills", [...currentIds, id]);
									if (i18nKey && !selectedSoftSkills.find((skill) => skill.id === id)) {
										setSelectedSoftSkills((prev) => [...prev, { id, i18nKey }]);
									}
								};

								return (
									<Field>
										<FieldLabel>{t("company_profile.soft_skills.title")}</FieldLabel>
										<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													role="combobox"
													className="h-auto w-full justify-between hover:bg-transparent"
												>
													<div className="flex flex-wrap items-center gap-1 pr-2.5">
														{currentIds.length > 0 ? (
															currentIds.map((id) => (
																<Badge key={id} variant="secondary" className="rounded-sm">
																	{getSoftSkillLabel(id)}
																	<span
																		className="ml-1 cursor-pointer"
																		onClick={(event) => {
																			event.stopPropagation();
																			toggleSelection(id, "");
																		}}
																	>
																		<XIcon className="size-3" />
																	</span>
																</Badge>
															))
														) : (
															<span className="text-muted-foreground">
																{t("company_profile.soft_skills.select_placeholder")}
															</span>
														)}
													</div>
													<ChevronsUpDownIcon className="shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-(--radix-popover-trigger-width) p-0">
												<Command shouldFilter={false}>
													<CommandInput
														placeholder={t("company_profile.soft_skills.search_placeholder")}
														value={softSkillSearchTerm}
														onValueChange={setSoftSkillSearchTerm}
													/>
													<CommandList>
														{isLoading && (
															<div className="flex items-center justify-center p-4">
																<Loader2 className="size-4 animate-spin" />
															</div>
														)}
														<CommandEmpty>
															{t("company_profile.soft_skills.no_soft_skill_found")}
														</CommandEmpty>
														<CommandGroup>
															{filteredSkills.map((skill) => (
																<CommandItem
																	key={skill.id}
																	value={skill.id}
																	onSelect={() => toggleSelection(skill.id, skill.i18n_name_key)}
																>
																	{t(skill.i18n_name_key)}
																	{currentIds.includes(skill.id) && (
																		<CheckIcon className="ml-auto size-4" />
																	)}
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
