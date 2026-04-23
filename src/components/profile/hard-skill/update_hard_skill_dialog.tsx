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
				onSuccess: (success) => {
					CustomToaster.successToast(success.message);

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
					<DialogTitle>Register new Hard Skill</DialogTitle>
					<DialogDescription>
						Register a new hard skill to help our recommendation system find the
						perfect job for you!
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
									<FieldLabel>Language / Framework</FieldLabel>
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
														Select industry category
													</span>
												)}
												<ChevronsUpDownIcon className="opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
											<Command shouldFilter={false}>
												<CommandInput
													placeholder="Search framework..."
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
															<CommandEmpty>No languages found</CommandEmpty>
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
									<FieldLabel>Skill Level</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue placeholder="Select your skill level" />
										</SelectTrigger>
										<SelectContent position="popper">
											{levelIsLoading && levelList.length === 0 && (
												<SelectItem value="adsadasdasd" disabled>
													<Spinner />
												</SelectItem>
											)}
											{levelList.map((level) => (
												<SelectItem value={level.value}>
													{level.label}
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
							Cancel
						</Button>
						<Button disabled={isPending}>
							{isPending ? <Spinner /> : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
