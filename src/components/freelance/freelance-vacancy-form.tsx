import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CheckIcon, ChevronsUpDownIcon, Loader2, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Controller,
	type FieldPath,
	useFieldArray,
	useForm,
	useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	useEnumDevSpecialty,
	useEnumFreelanceJobType,
	useEnumHardSkillLevel,
	useEnumSeniority,
} from "@/api/generated/enum/enum";
import {
	useStoreFreelanceJobVacancy,
	useUpdateFreelanceJobVacancy,
} from "@/api/generated/freelance-job-vacancy/freelance-job-vacancy";
import { useIndexLanguage } from "@/api/generated/language/language";
import {
	type DevSpecialtyEnum,
	type FreelanceJobTypeEnum,
	HardSkillLevelsEnum,
	type SeniorityLevelEnum,
} from "@/api/generated/models";
import Required from "@/components/global/required-field";
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
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
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
	invalidateFreelanceData,
	setCachedFreelanceVacancy,
} from "@/hooks/use-freelance-lists";
import {
	buildFreelanceJobVacancySchema,
	type IFreelanceJobVacancySchema,
} from "@/schemas/freelance-job-vacancy/FreelanceJobVacancySchema";
import {
	FREELANCE_BUDGET_MAX,
	FREELANCE_TITLE_MAX_LENGTH,
	type FreelanceVacancy,
	getFreelanceSpecialties,
} from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	freelanceErrorMessageKey,
	freelanceFieldErrors,
	isFreelanceStateConflict,
	isFreelanceUnavailable,
} from "@/utils/freelance-error";

type FormPath = FieldPath<IFreelanceJobVacancySchema>;

const FORM_FIELDS: ReadonlySet<string> = new Set([
	"title",
	"description",
	"job_type",
	"budget",
	"seniority_level",
	"specialties",
	"languages",
]);

const LANGUAGE_ROW_FIELDS: ReadonlySet<string> = new Set([
	"language_id",
	"language_level",
]);

/**
 * Converte a chave do 422 no campo do formulário. As linhas de `languages`
 * mostram o próprio erro (`languages.0.language_id`); em `specialties` o erro
 * de um item vai para o grupo, que é o que aparece na tela.
 */
function toFormPath(key: string): FormPath | null {
	const [root, index, field] = key.split(".");

	if (!FORM_FIELDS.has(root)) return null;

	if (root === "languages" && index !== undefined && field) {
		return LANGUAGE_ROW_FIELDS.has(field)
			? (`languages.${Number(index)}.${field}` as FormPath)
			: "languages";
	}

	return root as FormPath;
}

function toFormValues(
	vacancy: FreelanceVacancy | undefined,
): Partial<IFreelanceJobVacancySchema> {
	if (!vacancy) {
		return {
			title: "",
			description: "",
			specialties: [],
			languages: [],
		};
	}

	return {
		title: vacancy.title,
		description: vacancy.description,
		job_type: vacancy.job_type as FreelanceJobTypeEnum,
		// O `budget` só chega para o dono, que é quem abre a edição
		budget: vacancy.budget ? Number(vacancy.budget) : undefined,
		seniority_level: vacancy.seniority_level as SeniorityLevelEnum,
		specialties: getFreelanceSpecialties(vacancy) as DevSpecialtyEnum[],
		languages: (vacancy.languages ?? []).map((language) => ({
			language_id: language.id,
			language_level: language.language_level as HardSkillLevelsEnum,
		})),
	};
}

interface FreelanceVacancyFormProps {
	/** Presente na edição, que só abre com o freela `open`. */
	vacancy?: FreelanceVacancy;
	onSuccess: (vacancy: FreelanceVacancy) => void;
	onCancel: () => void;
}

export default function FreelanceVacancyForm({
	vacancy,
	onSuccess,
	onCancel,
}: FreelanceVacancyFormProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const isEditing = !!vacancy;

	const { data: jobTypes, isLoading: jobTypesAreLoading } =
		useEnumFreelanceJobType();
	const jobTypeList = useMemo(() => jobTypes?.data ?? [], [jobTypes]);

	const { data: seniorities } = useEnumSeniority();
	const seniorityList = seniorities?.data ?? [];

	const { data: specialties } = useEnumDevSpecialty();
	const specialtyList = specialties?.data ?? [];

	const { data: levels } = useEnumHardSkillLevel();
	const levelList = levels?.data ?? [];

	const stackJobTypes = useMemo(
		() =>
			new Set(
				jobTypeList
					.filter((jobType) => jobType.requires_stack)
					.map((jobType) => jobType.value),
			),
		[jobTypeList],
	);

	const schema = useMemo(
		() => buildFreelanceJobVacancySchema({ t, stackJobTypes }),
		[t, stackJobTypes],
	);

	const form = useForm<IFreelanceJobVacancySchema>({
		resolver: zodResolver(schema),
		defaultValues: toFormValues(vacancy),
	});

	const {
		fields: languageRows,
		append: appendLanguage,
		remove: removeLanguage,
	} = useFieldArray({ control: form.control, name: "languages" });

	const selectedJobType = useWatch({ control: form.control, name: "job_type" });
	const languagesAreRequired =
		!!selectedJobType && stackJobTypes.has(selectedJobType);

	const [languagesOpen, setLanguagesOpen] = useState(false);
	const [languageSearchTerm, setLanguageSearchTerm] = useState("");
	const debouncedLanguageSearch = useDebounce(languageSearchTerm, 500);

	const { data: languages, isLoading: languagesAreLoading } = useIndexLanguage({
		search: debouncedLanguageSearch || undefined,
	});
	const languageList = languages?.data.data ?? [];

	const [languageNames, setLanguageNames] = useState<Record<string, string>>(
		() =>
			Object.fromEntries(
				(vacancy?.languages ?? []).map((language) => [
					language.id,
					language.name,
				]),
			),
	);

	const toggleLanguage = (id: string, name: string) => {
		const index = languageRows.findIndex((row) => row.language_id === id);

		if (index !== -1) {
			removeLanguage(index);

			return;
		}

		setLanguageNames((previous) => ({ ...previous, [id]: name }));

		appendLanguage({
			language_id: id,
			language_level: HardSkillLevelsEnum.intermediate,
		});
	};

	const { mutateAsync: storeVacancy, isPending: isStoring } =
		useStoreFreelanceJobVacancy();
	const { mutateAsync: updateVacancy, isPending: isUpdating } =
		useUpdateFreelanceJobVacancy();

	const isPending = isStoring || isUpdating;

	const applyServerErrors = (error: unknown) => {
		const fieldErrors = freelanceFieldErrors(error);

		if (!fieldErrors) {
			CustomToaster.errorToast(t(freelanceErrorMessageKey(error, "vacancy")));

			// O freela saiu do `open` (ou foi removido) enquanto o formulário estava
			// aberto: a tela recarrega e a edição fecha
			if (
				vacancy &&
				(isFreelanceStateConflict(error) || isFreelanceUnavailable(error))
			) {
				invalidateFreelanceData(queryClient, vacancy.id);
				onCancel();
			}

			return;
		}

		let unmappedMessage: string | undefined;
		let focused = false;

		for (const [key, messages] of Object.entries(fieldErrors)) {
			const path = toFormPath(key);
			const message = messages[0];

			if (!path) {
				unmappedMessage ??= message;
				continue;
			}

			form.setError(
				path,
				{ type: "server", message },
				{ shouldFocus: !focused },
			);
			focused = true;
		}

		if (unmappedMessage) CustomToaster.errorToast(unmappedMessage);
	};

	const submit = async (values: IFreelanceJobVacancySchema) => {
		try {
			const response = vacancy
				? await updateVacancy({ id: vacancy.id, data: values })
				: await storeVacancy({ data: values });

			CustomToaster.successToast(
				t(
					isEditing
						? "toast.success.freelance_vacancy_updated"
						: "toast.success.freelance_vacancy_created",
				),
			);

			// O embedding é refeito em fila depois de editar: por cerca de 1 minuto
			// as recomendações e o ranking ainda podem refletir a versão anterior
			if (vacancy) setCachedFreelanceVacancy(queryClient, response.data);
			invalidateFreelanceData(queryClient, response.data.id);

			onSuccess(response.data);
		} catch (error) {
			applyServerErrors(error);
		}
	};

	const languagesError =
		form.formState.errors.languages?.root?.message ??
		form.formState.errors.languages?.message;

	return (
		<form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4">
			<Controller
				control={form.control}
				name="title"
				render={({ field, fieldState }) => (
					<Field>
						<FieldLabel htmlFor="freelance-title">
							{t("freelance.form.title")} <Required />
						</FieldLabel>
						<Input
							{...field}
							id="freelance-title"
							maxLength={FREELANCE_TITLE_MAX_LENGTH}
							placeholder={t("freelance.form.title_placeholder")}
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
						<FieldLabel htmlFor="freelance-description">
							{t("freelance.form.description")} <Required />
						</FieldLabel>
						<Textarea
							{...field}
							id="freelance-description"
							rows={5}
							placeholder={t("freelance.form.description_placeholder")}
							aria-invalid={fieldState.invalid}
						/>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
			<div className="flex flex-col gap-4 sm:flex-row">
				<Controller
					control={form.control}
					name="job_type"
					render={({ field, fieldState }) => (
						<Field className="flex-1">
							<FieldLabel>
								{t("freelance.form.job_type")} <Required />
							</FieldLabel>
							<Select
								value={field.value ?? ""}
								onValueChange={(value) => {
									field.onChange(value);

									// O erro de "exige linguagem" depende do tipo, mas a
									// revalidação só olha o campo alterado
									if (form.formState.isSubmitted) form.trigger("languages");
								}}
								disabled={jobTypesAreLoading}
							>
								<SelectTrigger
									ref={field.ref}
									className="w-full"
									aria-invalid={fieldState.invalid}
								>
									<SelectValue
										placeholder={t("freelance.form.job_type_placeholder")}
									/>
								</SelectTrigger>
								<SelectContent>
									{jobTypeList.map((jobType) => (
										<SelectItem key={jobType.value} value={jobType.value}>
											{t(jobType.i18nKey, { defaultValue: jobType.label })}
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
					name="seniority_level"
					render={({ field, fieldState }) => (
						<Field className="flex-1">
							<FieldLabel>
								{t("freelance.form.seniority_level")} <Required />
							</FieldLabel>
							<Select value={field.value ?? ""} onValueChange={field.onChange}>
								<SelectTrigger
									ref={field.ref}
									className="w-full"
									aria-invalid={fieldState.invalid}
								>
									<SelectValue
										placeholder={t(
											"freelance.form.seniority_level_placeholder",
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{seniorityList.map((seniority) => (
										<SelectItem key={seniority.value} value={seniority.value}>
											{t(seniority.i18nKey, { defaultValue: seniority.label })}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
			</div>
			<Controller
				control={form.control}
				name="budget"
				render={({ field, fieldState }) => (
					<Field>
						<FieldLabel htmlFor="freelance-budget">
							{t("freelance.form.budget")} <Required />
						</FieldLabel>
						<Input
							ref={field.ref}
							id="freelance-budget"
							type="number"
							inputMode="decimal"
							min={0}
							max={FREELANCE_BUDGET_MAX}
							step="0.01"
							placeholder={t("freelance.form.budget_placeholder")}
							value={field.value ?? ""}
							onBlur={field.onBlur}
							onChange={(event) =>
								field.onChange(
									event.target.value === ""
										? undefined
										: Number(event.target.value),
								)
							}
							aria-invalid={fieldState.invalid}
							aria-describedby="freelance-budget-hint"
						/>
						<FieldDescription id="freelance-budget-hint">
							{t("freelance.form.budget_hint")}
						</FieldDescription>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
			<Controller
				control={form.control}
				name="specialties"
				render={({ field, fieldState }) => (
					<Field>
						<FieldLabel>
							{t("freelance.form.specialties")} <Required />
						</FieldLabel>
						<div className="flex flex-row flex-wrap gap-2">
							{specialtyList.map((specialty) => {
								const value = specialty.value as DevSpecialtyEnum;
								const isSelected = field.value.includes(value);

								return (
									<Button
										key={specialty.value}
										type="button"
										size={"sm"}
										variant={isSelected ? "default" : "outline"}
										aria-pressed={isSelected}
										onClick={() =>
											field.onChange(
												isSelected
													? field.value.filter((selected) => selected !== value)
													: [...field.value, value],
											)
										}
									>
										{isSelected && <CheckIcon />}
										{t(specialty.i18nKey, { defaultValue: specialty.label })}
									</Button>
								);
							})}
						</div>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
			<Field>
				<FieldLabel>
					{t("freelance.form.languages")} {languagesAreRequired && <Required />}
				</FieldLabel>
				{selectedJobType && (
					<FieldDescription>
						{languagesAreRequired
							? t("freelance.form.languages_required_hint")
							: t("freelance.form.languages_optional_hint")}
					</FieldDescription>
				)}
				<Popover open={languagesOpen} onOpenChange={setLanguagesOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							role="combobox"
							aria-expanded={languagesOpen}
							aria-invalid={!!languagesError}
							className="h-auto w-full justify-between hover:bg-transparent"
						>
							<span className="text-muted-foreground">
								{t("freelance.form.language_placeholder")}
							</span>
							<ChevronsUpDownIcon className="shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
						<Command shouldFilter={false}>
							<CommandInput
								placeholder={t("freelance.form.language_search")}
								value={languageSearchTerm}
								onValueChange={setLanguageSearchTerm}
							/>
							<CommandList>
								{languagesAreLoading && (
									<div className="flex items-center justify-center p-4">
										<Loader2 className="size-4 animate-spin" />
									</div>
								)}
								<CommandEmpty>{t("no_data.no_languages")}</CommandEmpty>
								<CommandGroup>
									{languageList.map((language) => (
										<CommandItem
											key={language.id}
											value={language.id}
											onSelect={() =>
												toggleLanguage(language.id, language.name)
											}
										>
											{language.name}
											{languageRows.some(
												(row) => row.language_id === language.id,
											) && <CheckIcon className="ml-auto size-4" />}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				{languageRows.length > 0 && (
					<div className="flex flex-col gap-2">
						{languageRows.map((row, index) => {
							const rowErrors = form.formState.errors.languages?.[index];

							return (
								<div key={row.id} className="flex flex-col gap-1">
									<div className="flex flex-row items-center gap-2">
										<span className="flex-1 truncate text-sm">
											{languageNames[row.language_id] ?? row.language_id}
										</span>
										<Controller
											control={form.control}
											name={`languages.${index}.language_level`}
											render={({ field, fieldState }) => (
												<Select
													value={field.value ?? ""}
													onValueChange={field.onChange}
												>
													<SelectTrigger
														ref={field.ref}
														className="w-48"
														aria-invalid={fieldState.invalid}
														aria-label={t("freelance.form.level_placeholder")}
													>
														<SelectValue
															placeholder={t(
																"freelance.form.level_placeholder",
															)}
														/>
													</SelectTrigger>
													<SelectContent>
														{levelList.map((level) => (
															<SelectItem key={level.value} value={level.value}>
																{t(level.i18nKey, {
																	defaultValue: level.label,
																})}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
										/>
										<Button
											type="button"
											size={"icon"}
											variant={"ghost"}
											aria-label={t("general.remove")}
											onClick={() => removeLanguage(index)}
										>
											<XIcon />
										</Button>
									</div>
									<FieldError
										errors={[
											rowErrors?.language_id,
											rowErrors?.language_level,
										].filter(Boolean)}
									/>
								</div>
							);
						})}
					</div>
				)}
				{languagesError && <FieldError>{languagesError}</FieldError>}
			</Field>
			<div className="flex w-full justify-end gap-2">
				<Button type="button" variant={"outline"} onClick={onCancel}>
					{t("general.cancel")}
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending && <Loader2 className="animate-spin" />}
					{isEditing ? t("freelance.form.save") : t("freelance.form.publish")}
				</Button>
			</div>
		</form>
	);
}
