import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import Required from "../global/required-field";
import { Input } from "../ui/input";
import { CpfInput } from "../global/inputs/cpf-input";
import { PhoneInput } from "../global/inputs/phone-input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BadgeQuestionMark, ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useEnumSeniority } from "@/api/generated/enums/enums";
import { CreateDevProfileSchema, type ICreateDevProfileSchema } from "@/schemas/profile/CreateDevProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateDevProfile } from "@/api/generated/profiles-doc/profiles-doc";
import { CustomToaster } from "@/utils/custom-toaster";
import { useEffect } from "react";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";

export default function DevUpdateProfileForm(){

    const { user, hydrateUser } = useAuthStore();

    const { data: seniorityLevels, isLoading } = useEnumSeniority();

    const seniorityList = seniorityLevels?.data ?? [];

    const {
        mutate: updateProfile,
        isPending
    } = useUpdateDevProfile();

    const form = useForm<ICreateDevProfileSchema>({
        resolver: zodResolver(CreateDevProfileSchema),
        defaultValues: {
            name: user?.dev_profile?.name ?? "",
            cpf: user?.dev_profile?.cpf ?? "",
            phone: user?.dev_profile?.phone ?? "",
            birthdate: user?.dev_profile?.birthdate ?? "",
            bio: user?.dev_profile?.bio ?? "",
            seniority_level: user?.dev_profile?.seniority_level ?? "",
            open_to_work: user?.dev_profile?.open_to_work ?? false,
            open_to_relocation: user?.dev_profile?.open_to_relocation ?? false
        }
    })

    useEffect(() => {
    // Se o formulário ainda não foi alterado pelo usuário (dirty) 
    // e o usuário acabou de ser carregado, aí sim resetamos.
        if (user?.dev_profile && !form.formState.isDirty) {
            form.reset({
                name: user.dev_profile.name ?? "",
                cpf: user.dev_profile.cpf ?? "",
                phone: user.dev_profile.phone ?? "",
                birthdate: user.dev_profile.birthdate ?? "",
                bio: user.dev_profile.bio ?? "",
                seniority_level: user.dev_profile.seniority_level ?? "",
                open_to_work: user.dev_profile.open_to_work ?? false,
                open_to_relocation: user.dev_profile.open_to_relocation ?? false
            });
        }
    }, [user, form]);

    const create = (data: ICreateDevProfileSchema) => {
        updateProfile({ dev: user?.dev_profile?.id as string, data }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);
                
                hydrateUser();
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    if (!user || !user.dev_profile) return null;

    return(
        <form
                onSubmit={form.handleSubmit(create)}
                className="w-full flex flex-col gap-4"
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
                        name="birthdate"
                        render={({ field, fieldState }) => (
                            <Field className="flex-1">
                                <FieldLabel htmlFor="birthdate">
                                    Birthdate <Required />
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
                    name="seniority_level"
                    render={({ field, fieldState }) => (
                        <Field className="flex-1">
                            <FieldLabel htmlFor="seniority_level">
                                Seniority Level <Required />
                            </FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pick your seniority level" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {isLoading && <Spinner />}
                                    {!isLoading &&
                                        seniorityList.length > 0 &&
                                        seniorityList.map((item) => (
                                            <SelectItem value={item.value}>{item.label}</SelectItem>
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
                                    Open to work
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <BadgeQuestionMark className="w-4" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Tell our algorithm that you are available for job
                                                openings; without this information, our intelligent
                                                algorithm will not recommend you for positions.
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
                                    Open to relocation
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <BadgeQuestionMark className="w-4" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Tell our algorithm that you are available to relocate to
                                                another city, state, or country for a job opening.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </FieldLabel>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />
                </div>
                <Button disabled={!form.formState.isDirty || isPending}>{ isPending ? <Spinner /> : "Update" }</Button>
            </form>
    );
}