import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

import { formatDateOnly, parseLocalDateFromIso } from "@/utils/date-only";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useEnumOperationalSegments } from "@/api/generated/enums/enums";
import Required from "../global/required-field";
import { Spinner } from "../ui/spinner";
import { useStoreCompanyProfile } from "@/api/generated/profiles-doc/profiles-doc";
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
import { useAuthStore } from "@/stores/auth-store";
import { CreateCompanyProfileSchema, type ICreateCompanyProfileSchema } from "@/schemas/profile/CreateCompanyProfileSchema";
import { CnpjInput } from "../global/inputs/cnpj-inputs";
import { useTranslation } from "react-i18next";

export default function CompanyProfileForm() {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const { hydrateUser } = useAuthStore();

    const [addresAlertModal, setAddressAlertModal] = useState<boolean>(false);

    const { data: operationalSegments, isLoading } = useEnumOperationalSegments();

    const segmentsList = operationalSegments?.data ?? [];

    const form = useForm<ICreateCompanyProfileSchema>({
        resolver: zodResolver(CreateCompanyProfileSchema),
        defaultValues: {
            cnpj: "",
            name: "",
            bio: "",
            phone: "",
            founding_date: new Date().toString(),
            operational_segment: "",
        },
    });

    const { mutate: createProfile, isPending } = useStoreCompanyProfile();

    const create = async (data: ICreateCompanyProfileSchema) => {
        createProfile(
            { data },
            {
                onSuccess: () => {
                    CustomToaster.successToast(t("toast.success.profile_company_created"));

                    hydrateUser();

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
                    render={({
                        field: { onChange, value, ref, ...fieldProps },
                        fieldState,
                    }) => (
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
                                        {field.value ? (
                                            field.value
                                        ) : (
                                            <span>{t("placeholder.founding_date")}</span>
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
            <Button disabled={isPending}>
                {isPending ? <Spinner /> : t("general.create")}
            </Button>
            <AlertDialog open={addresAlertModal} onOpenChange={setAddressAlertModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("profile_create.address_modal.title")}
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        <p>{t("profile_create.address_modal.description")}</p>
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => navigate({ to: "/home" })}>
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
