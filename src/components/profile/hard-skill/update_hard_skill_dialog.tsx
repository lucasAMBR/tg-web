import { useEnumHardSkillLevel } from "@/api/generated/enums/enums";
import {
	getIndexHardSkillQueryKey,
	useUpdateHardSkill,
} from "@/api/generated/hard-skill-doc/hard-skill-doc";
import { useIndexLanguage } from "@/api/generated/languages-doc/languages-doc";
import type { HardSkillModel } from "@/api/generated/models";
import useDebounce from "@/hooks/use-debounce";
import {
	RegisterHardSkillSchema,
	type IRegisterHardSkillSchema,
} from "@/schemas/hard-skill/RegisterHardSkillSchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";
import { Card } from "../../ui/card";
import { Field, FieldLabel } from "../../ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { ChevronsUpDownIcon, CircleCheckIcon } from "lucide-react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../../ui/command";
import { Spinner } from "../../ui/spinner";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { useTranslation } from "react-i18next";

interface UpdateHardSkillModalProps {
	hardSkill: HardSkillModel;
	profileId: string;
	existingHardSkills: HardSkillModel[];
	dialogIsOpen: boolean;
	setDialogOpen: (open: boolean) => void;
}

export default function UpdateHardskillModal({
	hardSkill,
	profileId,
	dialogIsOpen,
	setDialogOpen,
	existingHardSkills,
}: UpdateHardSkillModalProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const [open, setOpen] = useState(false);

	const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("");
	const debounceSearchTerm = useDebounce(languageSearchTerm, 500);

	const { data: hardSkillLevel, isLoading: levelIsLoading } =
		useEnumHardSkillLevel();

	const levelList = hardSkillLevel?.data ?? [];

	const { data: language, isLoading: languageIsLoading } = useIndexLanguage({
		search: debounceSearchTerm,
	});

	const form = useForm<IRegisterHardSkillSchema>({
		resolver: zodResolver(RegisterHardSkillSchema),
		defaultValues: {
			language_id: hardSkill.language.id,
			skill_level: hardSkill.skill_level,
		},
	});

	const filteredLanguageList = useMemo(() => {
		if (!language?.data.data) return [];

		const usedIds = new Set(
			existingHardSkills
				.filter((s) => s.id !== hardSkill.id)
				.map((s) => s.language.id),
		);

		return language.data.data.filter((lang) => !usedIds.has(lang.id));
	}, [language, existingHardSkills]);

	const { mutate: registerHardSkill, isPending } = useUpdateHardSkill();

	useEffect(() => {
		if (!dialogIsOpen) {
			form.reset({
				language_id: hardSkill.language.id,
				skill_level: hardSkill.skill_level,
			});
		}
	}, [dialogIsOpen]);

	const register = (data: IRegisterHardSkillSchema) => {
		registerHardSkill(
			{ id: hardSkill.id, data },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.hard_skill_updated"));

					queryClient.invalidateQueries({
						queryKey: getIndexHardSkillQueryKey({ dev_profile_id: profileId }),
					});

					setDialogOpen(false);
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<Dialog open={dialogIsOpen} onOpenChange={setDialogOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("dev_profile.hard_skills.update_hard_skill")}</DialogTitle>
					<DialogDescription>
						{t("dev_profile.hard_skills.update_hard_skill_description")}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(register)}
					className="flex flex-col gap-4"
				>
					<Card className="p-4">
						<Controller
							control={form.control}
							name="language_id"
							render={({ field }) => (
								<Field>
									<FieldLabel>{t("input.language_framework")}</FieldLabel>
									<Popover open={open} onOpenChange={setOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={open}
												className="w-full justify-between"
											>
												{field.value ? (
													(filteredLanguageList.find(
														(f) => f.id === field.value,
													)?.name ?? hardSkill.language.name)
												) : (
													<span className="text-muted-foreground">
														{t("placeholder.language_framework")}
													</span>
												)}
												<ChevronsUpDownIcon className="opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
											<Command shouldFilter={false}>
												<CommandInput
													placeholder={t("placeholder.project_language_search")}
													value={languageSearchTerm}
													onValueChange={setLanguageSearchTerm}
													className="h-9"
												/>
												<CommandList>
													{languageIsLoading &&
														filteredLanguageList.length === 0 && (
															<CommandEmpty className="flex items-center justify-center p-2">
																<Spinner />
															</CommandEmpty>
														)}
													{!languageIsLoading &&
														filteredLanguageList.length === 0 && (
															<CommandEmpty>{t("no_data.no_languages")}</CommandEmpty>
														)}
													<CommandGroup>
														{filteredLanguageList.map((framework) => (
															<CommandItem
																key={framework.id}
																value={framework.id}
																onSelect={(currentValue) => {
																	field.onChange(
																		currentValue === field.value
																			? ""
																			: currentValue,
																	);
																	setOpen(false);
																}}
															>
																{framework.name}
																<CircleCheckIcon
																	className={cn(
																		"ml-auto fill-primary stroke-white",
																		field.value === framework.id
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="skill_level"
							render={({ field }) => (
								<Field>
									<FieldLabel>{t("input.skill_level")}</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue placeholder={t("placeholder.skill_level")} />
										</SelectTrigger>
										<SelectContent position="popper">
											{levelIsLoading && levelList.length === 0 && (
												<SelectItem value="adsadasdasd" disabled>
													<Spinner />
												</SelectItem>
											)}
											{levelList.map((level) => (
												<SelectItem value={level.value}>
													{t(level.i18nKey)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						/>
					</Card>
					<DialogFooter className="flex gap-2 ">
						<Button
							type="button"
							onClick={() => setDialogOpen(false)}
							variant={"outline"}
							className="cursor-pointer"
						>
							{t("general.cancel")}
						</Button>
						<Button disabled={isPending}>
							{isPending ? <Spinner /> : t("general.update")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
