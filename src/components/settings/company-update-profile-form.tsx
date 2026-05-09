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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEnumOperationalSegments } from "@/api/generated/enums/enums";
import { useUpdateCompanyProfile } from "@/api/generated/profiles-doc/profiles-doc";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";

export default function CompanyUpdateProfileForm(){
    
    const { user, hydrateUser } = useAuthStore();

    console.log(user);

    const { data: operationalSegments, isLoading } = useEnumOperationalSegments();

    const segmentsList = operationalSegments?.data ?? [];

    const form = useForm<ICreateCompanyProfileSchema>({
        resolver: zodResolver(CreateCompanyProfileSchema),
        defaultValues: {
            name: user?.company_profile?.name ?? "",
            bio: user?.company_profile?.bio ?? "",
            phone: user?.company_profile?.phone ?? "",
            cnpj: user?.company_profile?.cnpj ?? "",
            founding_date: user?.company_profile?.fouding_date ?? "",
            operational_segment: user?.company_profile?.operational_segment ?? "",
        }
    })

    const {mutate: updateProfile, isPending} = useUpdateCompanyProfile();

    const update = (data: ICreateCompanyProfileSchema) => {
        updateProfile({ company: user?.company_profile?.id as string, data }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);
                hydrateUser();
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    
    return (
        <form
            onSubmit={form.handleSubmit(update)}
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
            <Button disabled={isPending || !form.formState.isDirty} type="submit">{isPending ? <Spinner /> : "Update"}</Button>
        </form>
    );
}