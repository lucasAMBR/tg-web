import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { isoDateOnlyField } from "@/schemas/helpers/iso-date-only-field";
import { formatDateOnly, parseLocalDateFromIso } from "@/utils/date-only";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import Required from "../global/required-field";
import { Spinner } from "../ui/spinner";
import { useUpdateClientProfile } from "@/api/generated/profile/profile";
import type { UpdateClientProfileRequest } from "@/api/generated/models/updateClientProfileRequest";
import { CustomToaster } from "@/utils/custom-toaster";
import { useEffect } from "react";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { PhoneInput } from "../global/inputs/phone-input";
import { CpfInput } from "../global/inputs/cpf-input";
import { useAuthStore } from "@/stores/auth-store";
import z from "zod/v3";
import { useTranslation } from "react-i18next";

function digitsOnlyCpf(cpf: string | undefined): string {
	return (cpf ?? "").replace(/\D/g, "");
}

const UpdateClientProfileSchema = z.object({
	cpf: z.string().length(11, "CPF must have 11 characters!"),
	name: z
		.string()
		.min(3, "The name must have at least 3 characters")
		.max(255, "Name have a maximum lenght of 255 characters!"),
	bio: z
		.string()
		.min(10, "Bio must have at least 10 characters")
		.max(510, "Name have a maximum lenght of 510 characters!"),
	phone: z
		.string()
		.regex(
			/^\+55[1-9]{2}9[0-9]{8}$/,
			"The phone must have the following format: +5535999999999",
		),
	birthdate: isoDateOnlyField(),
});

type IUpdateClientProfileSchema = z.infer<typeof UpdateClientProfileSchema>;

function toUpdateBody(data: IUpdateClientProfileSchema): UpdateClientProfileRequest {
	const cpfDigits = digitsOnlyCpf(data.cpf);
	return {
		name: data.name,
		bio: data.bio,
		phone: data.phone,
		birthdate: data.birthdate,
		cpf: cpfDigits,
	};
}

export default function ClientUpdateProfileForm() {
	const { t } = useTranslation();
	const { user, hydrateUser } = useAuthStore();
	const { mutate: updateProfile, isPending } = useUpdateClientProfile();

	const form = useForm<IUpdateClientProfileSchema>({
		resolver: zodResolver(UpdateClientProfileSchema),
		defaultValues: {
			name: user?.client_profile?.name ?? "",
			cpf: digitsOnlyCpf(user?.client_profile?.cpf),
			phone: user?.client_profile?.phone ?? "",
			birthdate: user?.client_profile?.birthdate ?? "",
			bio: user?.client_profile?.bio ?? "",
		},
	});

	useEffect(() => {
		if (user?.client_profile && !form.formState.isDirty) {
			form.reset({
				name: user.client_profile.name ?? "",
				cpf: digitsOnlyCpf(user.client_profile.cpf),
				phone: user.client_profile.phone ?? "",
				birthdate: user.client_profile.birthdate ?? "",
				bio: user.client_profile.bio ?? "",
			});
		}
	}, [user, form]);

	const submit = (data: IUpdateClientProfileSchema) => {
		const id = user?.client_profile?.id;
		if (!id) return;

		updateProfile(
			{ id, data: toUpdateBody(data) },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.profile_client_updated"));
					hydrateUser();
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	if (!user?.client_profile) return null;

	return (
		<form
			onSubmit={form.handleSubmit(submit)}
			className="w-full flex flex-col gap-4 max-w-[700px]"
		>
			<div className="flex gap-2">
				<Controller
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<Field className="flex-2">
							<FieldLabel htmlFor="name">
								{t("input.name")} <Required />
							</FieldLabel>
							<Input
								{...field}
								name="name"
								placeholder={t("placeholder.name")}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="cpf"
					render={({
						field: { onChange, value, ref, ...fieldProps },
						fieldState,
					}) => (
						<Field className="flex-1">
							<FieldLabel htmlFor="cpf">
								CPF <Required />
							</FieldLabel>
							<CpfInput
								{...fieldProps}
								getInputRef={ref}
								value={value}
								format="###.###.###-##"
								onValueChange={(values) => {
									onChange(values.value ?? "");
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
					render={({
						field: { onChange, value, ref, ...fieldProps },
						fieldState,
					}) => (
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
					name="birthdate"
					render={({ field, fieldState }) => (
						<Field className="flex-1">
							<FieldLabel htmlFor="birthdate">
								{t("input.birthdate")} <Required />
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
										{field.value ? (
											field.value
										) : (
											<span>{t("placeholder.birthdate")}</span>
										)}
										<ChevronDownIcon className="h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={parseLocalDateFromIso(field.value)}
										onSelect={(date) =>
											field.onChange(date ? formatDateOnly(date) : "")
										}
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
			<Button
				type="submit"
				disabled={!form.formState.isDirty || isPending}
			>
				{isPending ? <Spinner /> : t("general.update")}
			</Button>
		</form>
	);
}
