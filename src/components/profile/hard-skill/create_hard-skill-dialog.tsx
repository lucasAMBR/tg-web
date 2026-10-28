import type { StoreHardSkillRequest } from "@/api/generated/models";
import type { PropsWithChildren } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";
import { useMemo, useState } from "react";
import { useEnumHardSkillLevel } from "@/api/generated/enum/enum";
import { useIndexLanguage } from "@/api/generated/language/language";
import useDebounce from "@/hooks/use-debounce";
import { Controller, useForm } from "react-hook-form";
import {
	RegisterHardSkillSchema,
	type IRegisterHardSkillSchema,
} from "@/schemas/hard-skill/RegisterHardSkillSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "../../ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../../ui/command";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { ChevronsUpDownIcon, CircleCheckIcon } from "lucide-react";
import { Spinner } from "../../ui/spinner";
import {
	getIndexHardSkillQueryKey,
	useStoreHardSkill,
} from "@/api/generated/hard-skill/hard-skill";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import type { HardSkillResource } from "@/api/generated/models";
import { useTranslation } from "react-i18next";
interface RegisterHardSkillModalProps {
	profileId: string;
	existingHardSkills: HardSkillResource[];
}

export default function CreateHardSkillModal({
	profileId,
	existingHardSkills,
	children,
}: PropsWithChildren<RegisterHardSkillModalProps>) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const [open, setOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

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
			language_id: "",
			skill_level: "",
		},
	});

	const filteredLanguageList = useMemo(() => {
		if (!language?.data.data) return [];

		const usedIds = new Set(existingHardSkills.map((s) => s.language.id));

		return language.data.data.filter((lang) => !usedIds.has(lang.id));
	}, [language, existingHardSkills]);

	const { mutate: registerHardSkill, isPending } = useStoreHardSkill();

	const register = (data: IRegisterHardSkillSchema) => {
		registerHardSkill(
			{ data: data as StoreHardSkillRequest },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.hard_skill_created"));

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
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("dev_profile.hard_skills.create_hard_skill")}</DialogTitle>
					<DialogDescription>{t("dev_profile.hard_skills.create_hard_skill_description")}</DialogDescription>
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
													filteredLanguageList.find(
														(framework) => framework.id === field.value,
													)?.name
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
							{isPending ? <Spinner /> : t("general.add")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
