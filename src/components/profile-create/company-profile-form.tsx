import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

import { format } from "date-fns";
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

export default function CompanyProfileForm() {
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
                onSuccess: (success) => {
                    CustomToaster.successToast(success.message);

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
                                Name <Required />
                            </FieldLabel>
                            <Input
                                {...field}
                                name="name"
                                placeholder="Your name"
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
                            <FieldLabel htmlFor="cpf">
                                CNPJ <Required />
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
                                Phone <Required />
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
                            <FieldLabel htmlFor="birthdate">
                                Founding date <Required />
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
                                            format(field.value, "yyyy-MM-dd")
                                        ) : (
                                            <span>Selecione uma data</span>
                                        )}
                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={new Date(field.value)}
                                        onSelect={(date) =>
                                            field.onChange(date ? format(date, "yyyy-MM-dd") : "")
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
                name="operational_segment"
                render={({ field, fieldState }) => (
                    <Field className="flex-1">
                        <FieldLabel htmlFor="seniority_level">
                            Operational Segment <Required />
                        </FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pick your company segment" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoading && <Spinner />}
                                {!isLoading &&
                                    segmentsList.length > 0 &&
                                    segmentsList.map((item) => (
                                        <SelectItem value={item.value}>{item.label}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <FieldError errors={[fieldState.error]} />
                    </Field>
                )}
            />
            <Button disabled={isPending}>{isPending ? <Spinner /> : "Create"}</Button>
            <AlertDialog open={addresAlertModal} onOpenChange={setAddressAlertModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Address Creation</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        <p>
                            You can skip this step, but for On-site or Hybrid jobs you need to
                            have an registered address on the platform for our algorithm
                            recommend jobs near to you
                        </p>
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => navigate({ to: "/home" })}>
                            Skip
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => navigate({ to: "/create/address" })}
                        >
                            Create address
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    );
}
