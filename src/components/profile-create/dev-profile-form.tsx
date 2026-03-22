import { CreateDevProfileSchema, type ICreateDevProfileSchema } from "@/schemas/profile/CreateDevProfileSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { BadgeQuestionMark, ChevronDownIcon, CircleAlert } from "lucide-react"
import { Calendar } from "../ui/calendar"

import { format } from "date-fns";
import { cn } from "@/lib/utils"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useEnumSeniority } from "@/api/generated/enums/enums"
import Required from "../global/required-field"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Spinner } from "../ui/spinner"
import { useStoreDevProfile } from "@/api/generated/profiles-doc/profiles-doc"
import { CustomToaster } from "@/utils/custom-toaster"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { onError } from "@/utils/on-error"
import type { AxiosError } from "axios"
import type { ApiError } from "@/utils/api-error"
import { useNavigate } from "@tanstack/react-router"
import { PhoneInput } from "../global/inputs/phone-input"
import { CpfInput } from "../global/inputs/cpf-input"
import { sanitizePhone } from "@/utils/formatter"

export default function DevProfileForm(){

    const navigate = useNavigate();

    const [addresAlertModal, setAddressAlertModal] = useState<boolean>(false); 

    const {
        data: seniorityLevels, 
        isLoading 
    } = useEnumSeniority();

    const seniorityList = seniorityLevels?.data ?? [];

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
            seniority_level: ""
        }
    })

    const {
        mutateAsync: createProfile,
        isPending
    } = useStoreDevProfile()

    const create = async (data: ICreateDevProfileSchema) => {
        await createProfile({ data }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);

                setAddressAlertModal(true)
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    return(
        <form onSubmit={form.handleSubmit(create)} className="w-full max-w-[700px] flex flex-col gap-4">
                <div className="flex gap-2">
                <Controller
                    control={form.control}
                    name="name"
                    render={({field, fieldState}) => (
                        <Field className="flex-2">
                            <FieldLabel htmlFor="name">Name <Required /></FieldLabel>
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
                    render={({ field: { onChange, value, ref, ...fieldProps }, fieldState }) => (
                        <Field className="flex-1">
                            <FieldLabel htmlFor="cpf">CPF <Required /></FieldLabel>
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
                        render={({ field: { onChange, value, ref, ...fieldProps }, fieldState }) => (
                            <Field className="flex-1">
                                <FieldLabel htmlFor="phone">Phone <Required /></FieldLabel>
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
                        render={({field, fieldState}) => (
                            <Field className="flex-1">
                                <FieldLabel htmlFor="birthdate">Birthdate <Required /></FieldLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant="outline"
                                        className={cn(
                                            "w-[212px] justify-between text-left font-normal",
                                            !field.value && "text-muted-foreground"
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
                                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                            captionLayout="dropdown"
                                            disabled={(date) =>
                                                date < new Date("1900-01-01")
                                            }
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
                    render={({field, fieldState}) => (
                        <Field className="flex-1">
                            <FieldLabel htmlFor="cpf">Bio <Required /></FieldLabel>
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
                    render={({field, fieldState}) => (
                        <Field className="flex-1">
                            <FieldLabel htmlFor="seniority_level">Seniority Level <Required /></FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pick your seniority level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoading && 
                                        <Spinner />
                                    }
                                    {!isLoading && seniorityList.length > 0 && seniorityList.map((item) => (
                                        <SelectItem value={item.value}>
                                            {item.label}
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
                    render={({field, fieldState}) => (
                        <Field className="flex flex-row my-2">
                            <Switch id="open_to_work" checked={field.value} onCheckedChange={field.onChange} />
                            <FieldLabel htmlFor="open_to_work">
                                Open to work 
                                <Tooltip>
                                    <TooltipTrigger>
                                        <BadgeQuestionMark className="w-4"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tell our algorithm that you are available for job openings; without this information, our intelligent algorithm will not recommend you for positions.</p>
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
                    render={({field, fieldState}) => (
                        <Field className="flex flex-row my-2">
                            <Switch id="open_to_relocation" checked={field.value} onCheckedChange={field.onChange} />
                            <FieldLabel htmlFor="open_to_relocation">
                                Open to relocation 
                                <Tooltip>
                                    <TooltipTrigger>
                                        <BadgeQuestionMark className="w-4"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tell our algorithm that you are available to relocate to another city, state, or country for a job opening.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </FieldLabel>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />
                </div>
                <Button disabled={isPending}>{ isPending ? <Spinner /> : "Create"}</Button>
                <AlertDialog open={addresAlertModal} onOpenChange={setAddressAlertModal}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Address Creation</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription>
                            <p>You can skip this step, but for On-site or Hybrid jobs you need to have an registered address on the platform for our algorithm recommend jobs near to you</p>
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => navigate({to: "/home/dev"})}>Skip</AlertDialogCancel>
                            <AlertDialogAction onClick={() => navigate({to: "/create/address"})}>Create address</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
        </form>
    )
}