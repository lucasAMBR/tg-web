import { CreateCompanyProfileSchema, type ICreateCompanyProfileSchema } from "@/schemas/profile/CreateCompanyProfileSchema";
import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import Required from "../global/required-field";
import { Input } from "../ui/input";
import { CnpjInput } from "../global/inputs/cnpj-inputs";
import { PhoneInput } from "../global/inputs/phone-input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { formatDateOnly, parseLocalDateFromIso } from "@/utils/date-only";
import { useEnumOperationalSegments } from "@/api/generated/enums/enums";
import { useUpdateCompanyProfile } from "@/api/generated/profiles-doc/profiles-doc";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyProfileModel } from "@/api/generated/models";

type CompanyUpdateProfileFormProps = {
	profile?: Pick<
		CompanyProfileModel,
		"id" | "name" | "bio" | "phone" | "cnpj" | "fouding_date" | "operational_segment"
	>;
	onSuccess?: () => void;
};

export default function CompanyUpdateProfileForm({
	profile: profileProp,
	onSuccess,
}: CompanyUpdateProfileFormProps = {}) {
	const { t } = useTranslation();

	const { user, hydrateUser } = useAuthStore();
	const profile = profileProp ?? user?.company_profile;

	const { data: operationalSegments, isLoading } = useEnumOperationalSegments();

	const segmentsList = operationalSegments?.data ?? [];

	const form = useForm<ICreateCompanyProfileSchema>({
		resolver: zodResolver(CreateCompanyProfileSchema),
		defaultValues: {
			name: profile?.name ?? "",
			bio: profile?.bio ?? "",
			phone: profile?.phone ?? "",
			cnpj: profile?.cnpj ?? "",
			founding_date: profile?.fouding_date ?? "",
			operational_segment: profile?.operational_segment ?? "",
		},
	});

	useEffect(() => {
		if (profile && !form.formState.isDirty) {
			form.reset({
				name: profile.name ?? "",
				bio: profile.bio ?? "",
				phone: profile.phone ?? "",
				cnpj: profile.cnpj ?? "",
				founding_date: profile.fouding_date ?? "",
				operational_segment: profile.operational_segment ?? "",
			});
		}
	}, [profile, form]);

	const { mutate: updateProfile, isPending } = useUpdateCompanyProfile();

	const update = (data: ICreateCompanyProfileSchema) => {
		updateProfile(
			{ company: profile?.id as string, data },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.profile_company_updated"));
					onSuccess?.();
					if (!profileProp) hydrateUser();
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	if (!profile) return null;

	return (
		<form onSubmit={form.handleSubmit(update)} className="w-full max-w-[700px] flex flex-col gap-4">
			<div className="flex gap-2">
				<Controller
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<Field className="flex-2">
							<FieldLabel htmlFor="name">
								{t("input.company_name")} <Required />
							</FieldLabel>
							<Input
								{...field}
								name="name"
								placeholder={t("placeholder.company_name")}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="cnpj"
					render={({ field: { onChange, value, ref, ...fieldProps }, fieldState }) => (
						<Field className="flex-1">
							<FieldLabel htmlFor="cnpj">
								{t("input.cnpj")} <Required />
							</FieldLabel>
							<CnpjInput
								{...fieldProps}
								getInputRef={ref}
								value={value}
								format="##.###.###/####-##"
								onValueChange={(values) => {
									onChange(values.value ? `+${values.value}` : "");
								}}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
			</div>
			<div className="flex gap-2">
				<Controller
					control={form.control}
					name="phone"
					render={({ field: { onChange, value, ref, ...fieldProps }, fieldState }) => (
						<Field className="flex-1">
							<FieldLabel htmlFor="phone">
								{t("input.phone")} <Required />
							</FieldLabel>
							<PhoneInput
								{...fieldProps}
								getInputRef={ref}
								value={value}
								format="+## (##) #####-####"
								onValueChange={(values) => {
									onChange(values.value ? `+${values.value}` : "");
								}}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="founding_date"
					render={({ field, fieldState }) => (
						<Field className="flex-1">
							<FieldLabel htmlFor="founding_date">
								{t("input.founding_date")} <Required />
							</FieldLabel>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-[212px] justify-between text-left font-normal",
											!field.value && "text-muted-foreground",
										)}
									>
										{field.value ? field.value : <span>{t("placeholder.founding_date")}</span>}
										<ChevronDownIcon className="h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={parseLocalDateFromIso(field.value)}
										onSelect={(date) => field.onChange(date ? formatDateOnly(date) : "")}
										captionLayout="dropdown"
										disabled={(date) => date < new Date("1900-01-01")}
									/>
								</PopoverContent>
							</Popover>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
			</div>
			<Controller
				control={form.control}
				name="bio"
				render={({ field, fieldState }) => (
					<Field className="flex-1">
						<FieldLabel htmlFor="bio">
							{t("input.bio")} <Required />
						</FieldLabel>
						<Textarea
							{...field}
							name="bio"
							placeholder={t("placeholder.bio")}
							aria-invalid={fieldState.invalid}
						/>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
			<Controller
				control={form.control}
				name="operational_segment"
				render={({ field, fieldState }) => (
					<Field className="flex-1">
						<FieldLabel htmlFor="operational_segment">
							{t("input.operational_segment")} <Required />
						</FieldLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger>
								<SelectValue placeholder={t("placeholder.operational_segment")} />
							</SelectTrigger>
							<SelectContent>
								{isLoading && <Spinner />}
								{!isLoading &&
									segmentsList.length > 0 &&
									segmentsList.map((item) => (
										<SelectItem key={item.value} value={item.value}>
											{t(item.i18nKey)}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
			<Button disabled={isPending || !form.formState.isDirty} type="submit">
				{isPending ? <Spinner /> : t("general.update")}
			</Button>
		</form>
	);
}
