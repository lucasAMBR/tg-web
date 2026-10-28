import type { StoreDevProfileRequest } from "@/api/generated/models";
import {
	CreateDevProfileSchema,
	type ICreateDevProfileSchema,
} from "@/schemas/profile/CreateDevProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { BadgeQuestionMark, ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

import { formatDateOnly, parseLocalDateFromIso } from "@/utils/date-only";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { useEnumDevSpecialty, useEnumSeniority } from "@/api/generated/enum/enum";
import Required from "../global/required-field";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Spinner } from "../ui/spinner";
import { useStoreDevProfile } from "@/api/generated/profile/profile";
import { CustomToaster } from "@/utils/custom-toaster";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { useNavigate } from "@tanstack/react-router";
import { PhoneInput } from "../global/inputs/phone-input";
import { CpfInput } from "../global/inputs/cpf-input";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "react-i18next";
import { useUserUserUpdate1 } from "@/api/generated/user/user";
import { ProfilePicInput } from "../global/inputs/profile-pic-input";

export default function DevProfileForm() {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const { user, hydrateUser } = useAuthStore();

	const [addresAlertModal, setAddressAlertModal] = useState<boolean>(false);
	const [profilePic, setProfilePic] = useState<File | null>(null);

	const { data: seniorityLevels, isLoading: isSeniorityLoading } = useEnumSeniority();
	const { data: devSpecialties, isLoading: isSpecialtyLoading } = useEnumDevSpecialty();

	const seniorityList = seniorityLevels?.data ?? [];
	const specialtyList = devSpecialties?.data ?? [];

	const form = useForm<ICreateDevProfileSchema>({
		resolver: zodResolver(CreateDevProfileSchema),
		defaultValues: {
			cpf: "",
			name: "",
			bio: "",
			phone: "",
			open_to_relocation: false,
			open_to_work: true,
			birthdate: new Date().toString(),
			seniority_level: "",
			specialty: "",
		},
	});

	const { mutateAsync: createProfile, isPending } = useStoreDevProfile();
	const { mutateAsync: updateUser, isPending: isUploadingProfilePic } =
		useUserUserUpdate1();

	const create = async (data: ICreateDevProfileSchema) => {
		await createProfile(
			{ data: data as StoreDevProfileRequest },
			{
				onSuccess: async () => {
					CustomToaster.successToast(t("toast.success.profile_dev_created"));

					if (profilePic) {
						await updateUser(
							{ id: user?.id as string, data: { profile_pic: profilePic } },
							{
								onError: (error) => {
									onError(error as AxiosError<ApiError>);
								},
							},
						).catch(() => null);
					}

					await hydrateUser();

					setAddressAlertModal(true);
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<form
			onSubmit={form.handleSubmit(create)}
			className="w-full max-w-[700px] flex flex-col gap-4"
		>
			<Field className="mb-4">
				<FieldLabel>{t("input.profile_pic")}</FieldLabel>
				<ProfilePicInput value={profilePic} onChange={setProfilePic} />
			</Field>
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
								format="+## (##) #####-####"
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
						<FieldLabel htmlFor="cpf">
							Bio <Required />
						</FieldLabel>
						<Textarea
							{...field}
							name="bio"
							placeholder="Bio"
							aria-invalid={fieldState.invalid}
						/>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
			<Controller
				control={form.control}
				name="seniority_level"
				render={({ field, fieldState }) => (
					<Field className="flex-1">
						<FieldLabel htmlFor="seniority_level">
							{t("input.seniority_level")} <Required />
						</FieldLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger>
								<SelectValue placeholder={t("placeholder.seniority_level")} />
							</SelectTrigger>
							<SelectContent>
								{isSeniorityLoading && <Spinner />}
								{!isSeniorityLoading &&
									seniorityList.length > 0 &&
									seniorityList.map((item) => (
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
			<Controller
				control={form.control}
				name="specialty"
				render={({ field, fieldState }) => (
					<Field className="flex-1">
						<FieldLabel htmlFor="specialty">
							{t("input.specialty")} <Required />
						</FieldLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger>
								<SelectValue placeholder={t("placeholder.specialty")} />
							</SelectTrigger>
							<SelectContent>
								{isSpecialtyLoading && <Spinner />}
								{!isSpecialtyLoading &&
									specialtyList.length > 0 &&
									specialtyList.map((item) => (
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
			<div className="flex">
				<Controller
					control={form.control}
					name="open_to_work"
					render={({ field, fieldState }) => (
						<Field className="flex flex-row my-2">
							<Switch
								id="open_to_work"
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
							<FieldLabel htmlFor="open_to_work">
								{t("input.open_to_work")}
								<Tooltip>
									<TooltipTrigger>
										<BadgeQuestionMark className="w-4" />
									</TooltipTrigger>
									<TooltipContent>
										<p>
											{t("tooltip.open_to_work")}
										</p>
									</TooltipContent>
								</Tooltip>
							</FieldLabel>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="open_to_relocation"
					render={({ field, fieldState }) => (
						<Field className="flex flex-row my-2">
							<Switch
								id="open_to_relocation"
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
							<FieldLabel htmlFor="open_to_relocation">
								{t("input.open_to_relocation")}
								<Tooltip>
									<TooltipTrigger>
										<BadgeQuestionMark className="w-4" />
									</TooltipTrigger>
									<TooltipContent>
										<p>
											{t("tooltip.open_to_relocation")}
										</p>
									</TooltipContent>
								</Tooltip>
							</FieldLabel>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
			</div>
			<Button disabled={isPending || isUploadingProfilePic}>
				{isPending || isUploadingProfilePic ? <Spinner /> : t("general.create")}
			</Button>
			<AlertDialog open={addresAlertModal} onOpenChange={setAddressAlertModal}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("profile_create.address_modal.title")}</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogDescription>
						<p>{t("profile_create.address_modal.description")}</p>
					</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => navigate({ to: "/feed" })}>
							{t("general.skip")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => navigate({ to: "/create/address" })}
						>
							{t("general.create")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</form>
	);
}
