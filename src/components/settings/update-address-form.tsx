import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import Required from "../global/required-field";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { env } from "@/utils/env";
import { Button } from "../ui/button";
import { RegisterAddressSchema, type IRegisterAddressSchema } from "@/schemas/address/RegisterAddressSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthUserAddressQueryKey, useAuthUserAddress, useUpdateAddress } from "@/api/generated/addresses-doc/addresses-doc";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { Spinner } from "../ui/spinner";

export default function UpdateAddressForm() {

    const queryClient = useQueryClient();

    const { data, isLoading } = useAuthUserAddress();

    const {
        mutate: update,
        isPending
    } = useUpdateAddress();

    const addressDefault = data?.data;

    const [address, setAddress] = useState({
        street: "",
        district: "",
        city: "",
        state: "",
    });
    
    const form = useForm<IRegisterAddressSchema>({
        resolver: zodResolver(RegisterAddressSchema),
        defaultValues: {
            cep: addressDefault?.cep ?? "",
            number: addressDefault?.number ?? "",
            complement: addressDefault?.complement ?? ""
        }
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
    if (addressDefault) {
        form.reset({
            cep: addressDefault.cep ?? "",
            number: addressDefault.number ?? "",
            complement: addressDefault.complement ?? ""
        });
    }
}, [addressDefault, form]);

    const updateAddress = (data: IRegisterAddressSchema) => {
        update({ addressId: addressDefault?.id as string, data }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);
                queryClient.invalidateQueries({ queryKey: getAuthUserAddressQueryKey() });
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        });
    }

    if (!addressDefault) return null;

    return(
        <form
                onSubmit={form.handleSubmit(updateAddress)}
                className="w-full flex flex-col gap-4"
            >
                <div className="flex gap-2">
                    <Controller
                        control={form.control}
                        name="cep"
                        render={({ field, fieldState }) => (
                            <Field className="flex-1">
                                <FieldLabel>
                                    CEP <Required />
                                </FieldLabel>
                                <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    id="cep"
                                    placeholder="Insert your zipcode"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Field className="flex-3">
                        <FieldLabel>Street</FieldLabel>
                        <Input
                            value={address.street}
                            readOnly
                            placeholder="Street"
                            className="cursor-not-allowed disabled:bg-muted"
                            disabled
                        />
                    </Field>
                </div>
                <div className="flex gap-2">
                    <Field className="flex-4">
                        <FieldLabel>District</FieldLabel>
                        <Input
                            value={address.district}
                            readOnly
                            placeholder="District"
                            className="cursor-not-allowed disabled:bg-muted"
                            disabled
                        />
                    </Field>
                    <Field className="flex-1">
                        <FieldLabel>City</FieldLabel>
                        <Input
                            value={address.city}
                            readOnly
                            placeholder="City"
                            className="cursor-not-allowed disabled:bg-muted"
                            disabled
                        />
                    </Field>
                    <Field className="flex-1">
                        <FieldLabel>State</FieldLabel>
                        <Input
                            value={address.state}
                            readOnly
                            placeholder="State"
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
                                    Number <Required />
                                </FieldLabel>
                                <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    id="number"
                                    placeholder="Number"
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
                                <FieldLabel>Complement</FieldLabel>
                                <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    id="complement"
                                    placeholder="Complement"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <Button disabled={!form.formState.isDirty || isPending} type="submit" className="mt-6">
                    {isPending ? <Spinner /> : "Update"}
                </Button>
            </form>
    );
}