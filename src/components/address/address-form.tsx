import {
	RegisterAddressSchema,
	type IRegisterAddressSchema,
} from "@/schemas/address/RegisterAddressSchema";
import { env } from "@/utils/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import Required from "../global/required-field";
import { Button } from "../ui/button";
import { useStoreAddress } from "@/api/generated/addresses-doc/addresses-doc";
import { CustomToaster } from "@/utils/custom-toaster";
import { redirect, useNavigate } from "@tanstack/react-router";
import type { UserRole } from "@/types/AuthenticatedUser";
import { useAuthStore } from "@/stores/auth-store";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { useTranslation } from "react-i18next";

export default function AddressForm() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const { hydrateUser } = useAuthStore();

	const [address, setAddress] = useState({
		street: "",
		district: "",
		city: "",
		state: "",
	});

	const { mutate: registerAddress, isPending } = useStoreAddress();

	const form = useForm<IRegisterAddressSchema>({
		resolver: zodResolver(RegisterAddressSchema),
		defaultValues: {
			cep: "",
			number: "",
		},
	});

	const cep = form.watch("cep");

	useEffect(() => {
		if (!cep || cep.length < 8) return;

		async function fetchAddress() {
			const res = await fetch(
				`${env.VITE_AWESOME_API_URL}/${cep}?token=${env.VITE_AWESOME_API_KEY}`,
			);

			const data = await res.json();

			setAddress({
				street: data.address,
				district: data.district,
				city: data.city,
				state: data.state,
			});
		}

		fetchAddress();
	}, [cep]);

	const createAddress = (data: IRegisterAddressSchema) => {
		registerAddress(
			{ data },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.address_created"));

					const { user, isAuthenticated } = useAuthStore.getState();

					if (isAuthenticated && user) {
						const role = user.role[0] as UserRole;

						const homeRoutes: Record<UserRole, string> = {
							dev: "/home/dev",
							company: "/home/company",
							client: "/home/client",
							admin: "/admin-land/dashboard",
						};

						hydrateUser();

						navigate({ to: homeRoutes[role] || "/dashboard" });
					}
				},
				onError: (error) => {
					const apiError = error as AxiosError<ApiError>;

					CustomToaster.errorToast(
						apiError.response?.data.message ?? "Something goes wrong!",
					);
				},
			},
		);
	};

	return (
		<form
			onSubmit={form.handleSubmit(createAddress)}
			className="w-full max-w-[700px] flex flex-col gap-4"
		>
			<div className="flex gap-2">
				<Controller
					control={form.control}
					name="cep"
					render={({ field, fieldState }) => (
						<Field className="flex-1">
							<FieldLabel>
								{t("input.cep")} <Required />
							</FieldLabel>
							<Input
								{...field}
								aria-invalid={fieldState.invalid}
								id="cep"
								placeholder={t("placeholder.cep")}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Field className="flex-3">
					<FieldLabel>{t("input.street")}</FieldLabel>
					<Input
						value={address.street}
						readOnly
						placeholder={t("placeholder.street")}
						className="cursor-not-allowed"
						disabled
					/>
				</Field>
			</div>
			<div className="flex gap-2">
				<Field className="flex-4">
					<FieldLabel>{t("input.district")}</FieldLabel>
					<Input
						value={address.district}
						readOnly
						placeholder={t("placeholder.district")}
						className="cursor-not-allowed"
						disabled
					/>
				</Field>
				<Field className="flex-1">
					<FieldLabel>{t("input.city")}</FieldLabel>
					<Input
						value={address.city}
						readOnly
						placeholder={t("placeholder.city")}
						className="cursor-not-allowed"
						disabled
					/>
				</Field>
				<Field className="flex-1">
					<FieldLabel>{t("input.state")}</FieldLabel>
					<Input
						value={address.state}
						readOnly
						placeholder={t("placeholder.state")}
						className="cursor-not-allowed"
						disabled
					/>
				</Field>
			</div>
			<div className="flex gap-2">
				<Controller
					control={form.control}
					name="number"
					render={({ field, fieldState }) => (
						<Field className="flex-1">
							<FieldLabel>
								{t("input.number")} <Required />
							</FieldLabel>
							<Input
								{...field}
								aria-invalid={fieldState.invalid}
								id="number"
								placeholder={t("placeholder.number")}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="complement"
					render={({ field, fieldState }) => (
						<Field className="flex-4">
							<FieldLabel>{t("input.complement")}</FieldLabel>
							<Input
								{...field}
								aria-invalid={fieldState.invalid}
								id="complement"
								placeholder={t("placeholder.complement")}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</div>
			<Button type="submit" className="mt-6">
				{t("general.register")}
			</Button>
			<Button type="button" variant={"outline"}>
				{t("general.skip")}
			</Button>
		</form>
	);
}
