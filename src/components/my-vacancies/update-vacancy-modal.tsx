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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	getShowJobVacancyQueryKey,
	useUpdateJobVacancy,
} from "@/api/generated/job-vacancy/job-vacancy";
import { useIndexLanguage } from "@/api/generated/language/language";
import {
	ContractType,
	DevSpecialtyEnum,
	EmploymentType,
	HardSkillLevelsEnum,
	type JobVacancyResource,
	SeniorityLevelEnum,
} from "@/api/generated/models";
import { useIndexSoftSkill } from "@/api/generated/soft-skill/soft-skill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useDebounce from "@/hooks/use-debounce";
import {
	type IUpdateJobVacancySchema,
	UpdateJobVacancySchema,
} from "@/schemas/job-vacancy/UpdateJobVacancySchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

interface UpdateVacancyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	vacancy: JobVacancyResource;
}

// O formulário é preenchido com o conteúdo original da vaga, não com a tradução,
// já que é o conteúdo original que a API atualiza (e retraduz)
const buildDefaultValues = (
	vacancy: JobVacancyResource,
): IUpdateJobVacancySchema => ({
	title: vacancy.title ?? "",
	description: vacancy.description ?? "",
	employment_type: vacancy.employment_type,
	benefits: (vacancy.benefits ?? []) as string[],
	estimated_salary: Number(vacancy.estimated_salary ?? 0),
	contract_type: vacancy.contract_type,
	seniority_level: vacancy.seniority_level,
	specialties: vacancy.specialties as DevSpecialtyEnum,
	languages: (vacancy.languages ?? []).map((language) => ({
		current_languages_id: language.id,
		languages_id: language.id,
		language_level:
			(language.language_level as HardSkillLevelsEnum) ??
			HardSkillLevelsEnum.intermediate,
	})),
	soft_skills: (vacancy.soft_skills ?? []).map((softSkill) => ({
		current_soft_skills_id: softSkill.id,
		soft_skills_id: softSkill.id,
	})),
});

export default function UpdateVacancyModal({
	open,
	onOpenChange,
	vacancy,
}: UpdateVacancyModalProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const form = useForm<IUpdateJobVacancySchema>({
		resolver: zodResolver(UpdateJobVacancySchema),
		defaultValues: buildDefaultValues(vacancy),
	});

	const [benefitTerm, setBenefitTerm] = useState<string>("");

	const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("");
	const debouncedLanguageSearch = useDebounce(languageSearchTerm, 500);

	const [softSkillSearchTerm, setSoftSkillSearchTerm] = useState<string>("");
	const debouncedSoftSkillSearch = useDebounce(softSkillSearchTerm, 500);

	const [languagesOpen, setLanguagesOpen] = useState(false);
	const [softSkillsOpen, setSoftSkillsOpen] = useState(false);

	// Os nomes das linguagens/soft skills já vinculadas vêm da vaga; os demais
	// são guardados conforme o usuário seleciona itens na busca
	const [languageNames, setLanguageNames] = useState<Record<string, string>>(
		{},
	);
	const [softSkillNames, setSoftSkillNames] = useState<Record<string, string>>(
		{},
	);

	const { data: languages, isLoading: languagesAreLoading } = useIndexLanguage({
		search: debouncedLanguageSearch,
	});

	const languagesList = languages?.data.data ?? [];

	const { data: softSkills, isLoading: softSkillsAreLoading } =
		useIndexSoftSkill({ search: debouncedSoftSkillSearch });

	const softSkillsList = softSkills?.data ?? [];

	// Reabrir o modal precisa refletir os dados mais recentes da vaga
	useEffect(() => {
		if (!open) return;

		form.reset(buildDefaultValues(vacancy));

		setBenefitTerm("");

		setLanguageNames(
			Object.fromEntries(
				(vacancy.languages ?? []).map((language) => [
					language.id,
					language.name,
				]),
			),
		);

		setSoftSkillNames(
			Object.fromEntries(
				(vacancy.soft_skills ?? []).map((softSkill) => [
					softSkill.id,
					softSkill.i18n_name_key ? t(softSkill.i18n_name_key) : softSkill.name,
				]),
			),
		);
	}, [open, vacancy, form, t]);

	const { mutateAsync: updateJobVacancy, isPending } = useUpdateJobVacancy();

	const update = async (data: IUpdateJobVacancySchema) => {
		try {
			await updateJobVacancy({
				id: vacancy.id,
				data: {
					title: data.title,
					description: data.description,
					employment_type: data.employment_type,
					benefits: data.benefits,
					estimated_salary: data.estimated_salary,
					contract_type: data.contract_type,
					seniority_level: data.seniority_level,
					specialties: data.specialties,
					languages: data.languages.map((language) => ({
						...(language.current_languages_id
							? { current_languages_id: language.current_languages_id }
							: {}),
						new_languages_id: language.languages_id,
						language_level: language.language_level,
					})),
					soft_skills: data.soft_skills.map((softSkill) => ({
						...(softSkill.current_soft_skills_id
							? { current_soft_skills_id: softSkill.current_soft_skills_id }
							: {}),
						new_soft_skills_id: softSkill.soft_skills_id,
					})),
				},
			});

			CustomToaster.successToast(t("toast.success.job_vacancy_updated"));

			queryClient.invalidateQueries({
				queryKey: getShowJobVacancyQueryKey(vacancy.id),
			});
			queryClient.invalidateQueries({ queryKey: ["/job-vacancy"] });

			onOpenChange(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>{t("my_vacancies.actions.update_vacancy")}</DialogTitle>
					<DialogDescription>
						{t("my_vacancies.actions.update_vacancy_description")}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(update)}
					className="flex flex-col gap-4"
				>
					<Controller
						control={form.control}
						name="title"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>{t("input.title")}</FieldLabel>
								<Input
									{...field}
									placeholder={t("placeholder.job_vacancy_title")}
									aria-invalid={fieldState.invalid}
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
									{...field}
									placeholder={t("placeholder.job_vacancy_description")}
									aria-invalid={fieldState.invalid}
								/>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<div className="flex flex-col gap-4 sm:flex-row">
						<Controller
							control={form.control}
							name="employment_type"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel>{t("input.employment_type")}</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={t("placeholder.employment_type")}
											/>
										</SelectTrigger>
										<SelectContent>
											{Object.values(EmploymentType).map((employmentType) => (
												<SelectItem key={employmentType} value={employmentType}>
													{t(`enum.employment_type.${employmentType}`)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="contract_type"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel>{t("input.contract_modality")}</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={t("placeholder.contract_modality")}
											/>
										</SelectTrigger>
										<SelectContent>
											{Object.values(ContractType).map((contractType) => (
												<SelectItem key={contractType} value={contractType}>
													{t(`enum.contract_type.${contractType}`)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>
					<div className="flex flex-col gap-4 sm:flex-row">
						<Controller
							control={form.control}
							name="seniority_level"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel>{t("input.seniority_level")}</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={t("placeholder.filter_seniority_level")}
											/>
										</SelectTrigger>
										<SelectContent>
											{Object.values(SeniorityLevelEnum).map(
												(seniorityLevel) => (
													<SelectItem
														key={seniorityLevel}
														value={seniorityLevel}
													>
														{t(`enum.seniority_level.${seniorityLevel}`)}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="estimated_salary"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel>{t("input.estimated_salary")}</FieldLabel>
									<Input
										type="number"
										inputMode="decimal"
										min={0}
										step="0.01"
										placeholder={t("placeholder.estimated_salary")}
										value={field.value ?? ""}
										onChange={(event) =>
											field.onChange(
												event.target.value === ""
													? undefined
													: Number(event.target.value),
											)
										}
										aria-invalid={fieldState.invalid}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>
					<Controller
						control={form.control}
						name="specialties"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>{t("input.specialty")}</FieldLabel>
								<div className="flex flex-row flex-wrap gap-2">
									{Object.values(DevSpecialtyEnum).map((specialty) => {
										const isSelected = field.value === specialty;

										return (
											<Button
												key={specialty}
												type="button"
												size={"sm"}
												variant={isSelected ? "default" : "outline"}
												onClick={() => field.onChange(specialty)}
											>
												{t(`enum.dev_specialty.${specialty}`)}
											</Button>
										);
									})}
								</div>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<Controller
						control={form.control}
						name="benefits"
						render={({ field, fieldState }) => {
							const addBenefit = () => {
								const benefit = benefitTerm.trim();

								if (!benefit || field.value.includes(benefit)) return;

								field.onChange([...field.value, benefit]);
								setBenefitTerm("");
							};

							return (
								<Field>
									<FieldLabel>{t("input.benefits")}</FieldLabel>
									<div className="flex flex-row gap-2">
										<Input
											value={benefitTerm}
											placeholder={t("placeholder.benefit")}
											onChange={(event) => setBenefitTerm(event.target.value)}
											onKeyDown={(event) => {
												if (event.key !== "Enter") return;

												event.preventDefault();
												addBenefit();
											}}
										/>
										<Button
											type="button"
											variant={"secondary"}
											onClick={addBenefit}
										>
											<Plus /> {t("general.add")}
										</Button>
									</div>
									{field.value.length > 0 && (
										<div className="flex flex-row flex-wrap gap-2">
											{field.value.map((benefit) => (
												<Badge key={benefit} variant={"secondary"}>
													{benefit}
													<button
														type="button"
														className="ml-1 cursor-pointer"
														onClick={() =>
															field.onChange(
																field.value.filter(
																	(value) => value !== benefit,
																),
															)
														}
													>
														<XIcon className="size-3" />
													</button>
												</Badge>
											))}
										</div>
									)}
									<FieldError errors={[fieldState.error]} />
								</Field>
							);
						}}
					/>
					<Controller
						control={form.control}
						name="languages"
						render={({ field, fieldState }) => {
							const toggleLanguage = (id: string, name: string) => {
								const isSelected = field.value.some(
									(language) => language.languages_id === id,
								);

								if (isSelected) {
									field.onChange(
										field.value.filter(
											(language) => language.languages_id !== id,
										),
									);

									return;
								}

								setLanguageNames((previous) => ({ ...previous, [id]: name }));

								field.onChange([
									...field.value,
									{
										languages_id: id,
										language_level: HardSkillLevelsEnum.intermediate,
									},
								]);
							};

							return (
								<Field>
									<FieldLabel>{t("input.required_languages")}</FieldLabel>
									<Popover open={languagesOpen} onOpenChange={setLanguagesOpen}>
										<PopoverTrigger asChild>
											<Button
												type="button"
												variant="outline"
												role="combobox"
												className="h-auto w-full justify-between hover:bg-transparent"
											>
												<span className="text-muted-foreground">
													{t("placeholder.project_language_framework")}
												</span>
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
													{languagesAreLoading && (
														<div className="flex items-center justify-center p-4">
															<Loader2 className="animate-spin size-4" />
														</div>
													)}
													<CommandEmpty>
														{t("no_data.no_languages")}
													</CommandEmpty>
													<CommandGroup>
														{languagesList.map((language) => (
															<CommandItem
																key={language.id}
																value={language.id}
																onSelect={() =>
																	toggleLanguage(language.id, language.name)
																}
															>
																{language.name}
																{field.value.some(
																	(selected) =>
																		selected.languages_id === language.id,
																) && <CheckIcon className="ml-auto size-4" />}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									{field.value.length > 0 && (
										<div className="flex flex-col gap-2">
											{field.value.map((language, index) => (
												<div
													key={language.languages_id}
													className="flex flex-row items-center gap-2"
												>
													<span className="flex-1 truncate text-sm">
														{languageNames[language.languages_id] ??
															language.languages_id}
													</span>
													<Select
														value={language.language_level}
														onValueChange={(level) =>
															field.onChange(
																field.value.map((selected, selectedIndex) =>
																	selectedIndex === index
																		? {
																				...selected,
																				language_level:
																					level as HardSkillLevelsEnum,
																			}
																		: selected,
																),
															)
														}
													>
														<SelectTrigger className="w-48">
															<SelectValue
																placeholder={t("placeholder.skill_level")}
															/>
														</SelectTrigger>
														<SelectContent>
															{Object.values(HardSkillLevelsEnum).map(
																(level) => (
																	<SelectItem key={level} value={level}>
																		{t(`enum.hard_skill_levels.${level}`)}
																	</SelectItem>
																),
															)}
														</SelectContent>
													</Select>
													<Button
														type="button"
														size={"icon"}
														variant={"ghost"}
														onClick={() =>
															field.onChange(
																field.value.filter(
																	(_, selectedIndex) => selectedIndex !== index,
																),
															)
														}
													>
														<XIcon />
													</Button>
												</div>
											))}
										</div>
									)}
									<FieldError errors={[fieldState.error]} />
								</Field>
							);
						}}
					/>
					<Controller
						control={form.control}
						name="soft_skills"
						render={({ field, fieldState }) => {
							const toggleSoftSkill = (id: string, name: string) => {
								if (
									field.value.some(
										(softSkill) => softSkill.soft_skills_id === id,
									)
								) {
									field.onChange(
										field.value.filter(
											(softSkill) => softSkill.soft_skills_id !== id,
										),
									);

									return;
								}

								setSoftSkillNames((previous) => ({ ...previous, [id]: name }));

								field.onChange([...field.value, { soft_skills_id: id }]);
							};

							return (
								<Field>
									<FieldLabel>{t("input.soft_skills")}</FieldLabel>
									<Popover
										open={softSkillsOpen}
										onOpenChange={setSoftSkillsOpen}
									>
										<PopoverTrigger asChild>
											<Button
												type="button"
												variant="outline"
												role="combobox"
												className="h-auto w-full justify-between hover:bg-transparent"
											>
												<div className="flex flex-wrap items-center gap-1 pr-2.5">
													{field.value.length > 0 ? (
														field.value.map(({ soft_skills_id: id }) => (
															<Badge
																key={id}
																variant="secondary"
																className="rounded-sm"
															>
																{softSkillNames[id] ?? id}
																<button
																	type="button"
																	className="ml-1 cursor-pointer"
																	onClick={(event) => {
																		event.stopPropagation();
																		toggleSoftSkill(
																			id,
																			softSkillNames[id] ?? "",
																		);
																	}}
																>
																	<XIcon className="size-3" />
																</button>
															</Badge>
														))
													) : (
														<span className="text-muted-foreground">
															{t("placeholder.soft_skills")}
														</span>
													)}
												</div>
												<ChevronsUpDownIcon className="opacity-50 shrink-0" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
											<Command shouldFilter={false}>
												<CommandInput
													placeholder={t("placeholder.soft_skill_search")}
													value={softSkillSearchTerm}
													onValueChange={setSoftSkillSearchTerm}
												/>
												<CommandList>
													{softSkillsAreLoading && (
														<div className="flex items-center justify-center p-4">
															<Loader2 className="animate-spin size-4" />
														</div>
													)}
													<CommandEmpty>{t("general.no_results")}</CommandEmpty>
													<CommandGroup>
														{softSkillsList.map((softSkill) => {
															const name = softSkill.i18n_name_key
																? t(softSkill.i18n_name_key)
																: softSkill.name;

															return (
																<CommandItem
																	key={softSkill.id}
																	value={softSkill.id}
																	onSelect={() =>
																		toggleSoftSkill(softSkill.id, name)
																	}
																>
																	{name}
																	{field.value.some(
																		(selected) =>
																			selected.soft_skills_id === softSkill.id,
																	) && <CheckIcon className="ml-auto size-4" />}
																</CommandItem>
															);
														})}
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
					<DialogFooter>
						<Button
							type="button"
							variant={"outline"}
							onClick={() => onOpenChange(false)}
						>
							{t("general.cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="animate-spin" />}
							{t("general.save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
