import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import Required from "../global/required-field";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { env } from "@/utils/env";
import { Button } from "../ui/button";
import { RegisterAddressSchema, type IRegisterAddressSchema } from "@/schemas/address/RegisterAddressSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    getAuthUserAddressQueryKey,
    useAuthUserAddress,
    useStoreAddress,
    useUpdateAddress,
} from "@/api/generated/addresses-doc/addresses-doc";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { Spinner } from "../ui/spinner";
import { useTranslation } from "react-i18next";

export default function UpdateAddressForm() {
    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const { data: response, isLoading } = useAuthUserAddress();

    const { mutate: store, isPending: isStoring } = useStoreAddress();
    const { mutate: update, isPending: isUpdating } = useUpdateAddress();

    const hasAddress = response?.data?.has_address ?? false;
    const savedAddress = hasAddress ? response?.data?.address : undefined;
    const isPending = isStoring || isUpdating;

    const [address, setAddress] = useState({
        street: "",
        district: "",
        city: "",
        state: "",
    });

    const form = useForm<IRegisterAddressSchema>({
        resolver: zodResolver(RegisterAddressSchema),
        defaultValues: {
            cep: savedAddress?.cep ?? "",
            number: savedAddress?.number ?? "",
            complement: savedAddress?.complement ?? "",
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

    useEffect(() => {
        if (!savedAddress) return;

        form.reset({
            cep: savedAddress.cep ?? "",
            number: savedAddress.number ?? "",
            complement: savedAddress.complement ?? "",
        });

        setAddress({
            street: savedAddress.street ?? "",
            district: savedAddress.district ?? "",
            city: savedAddress.city ?? "",
            state: savedAddress.state ?? "",
        });
    }, [savedAddress, form]);

    const mutationOptions = (isUpdate: boolean) => ({
        onSuccess: () => {
            CustomToaster.successToast(
                t(isUpdate ? "toast.success.address_updated" : "toast.success.address_created"),
            );
            queryClient.invalidateQueries({ queryKey: getAuthUserAddressQueryKey() });
        },
        onError: (error: unknown) => {
            onError(error as AxiosError<ApiError>);
        },
    });

    const onSubmit = (formData: IRegisterAddressSchema) => {
        if (hasAddress && savedAddress) {
            update({ addressId: savedAddress.id, data: formData }, mutationOptions(true));
            return;
        }

        store({ data: formData }, mutationOptions(false));
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
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
                        className="cursor-not-allowed disabled:bg-muted"
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
                        className="cursor-not-allowed disabled:bg-muted"
                        disabled
                    />
                </Field>
                <Field className="flex-1">
                    <FieldLabel>{t("input.city")}</FieldLabel>
                    <Input
                        value={address.city}
                        readOnly
                        placeholder={t("placeholder.city")}
                        className="cursor-not-allowed disabled:bg-muted"
                        disabled
                    />
                </Field>
                <Field className="flex-1">
                    <FieldLabel>{t("input.state")}</FieldLabel>
                    <Input
                        value={address.state}
                        readOnly
                        placeholder={t("placeholder.state")}
                        className="cursor-not-allowed disabled:bg-muted"
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
            <Button
                disabled={(hasAddress && !form.formState.isDirty) || isPending}
                type="submit"
                className="mt-6"
            >
                {isPending ? <Spinner /> : hasAddress ? t("general.update") : t("general.save")}
            </Button>
        </form>
    );
}