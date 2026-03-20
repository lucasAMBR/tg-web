import { useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from "../ui/field";
import { Button } from "../ui/button";
import { CheckIcon, ChevronLeft, ChevronRight, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"

import { RegisterSchema, type IRegisterSchema } from "@/schemas/register/RegisterSchema";
import { useAuthRegister } from "@/api/generated/auth/auth";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { Spinner } from "../ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

export default function RegisterSteps() {
    
    const navigate = useNavigate();

    const [step, setStep] = useState<"role" | "data">('role')

    const requirements = useMemo(() => [
        { regex: /.{8,}/, text: 'At least 8 characters' },
        { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
        { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
        { regex: /[0-9]/, text: 'At least 1 number' },
        {
            regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
            text: 'At least 1 special character'
        }
    ], []);

    const {
        mutate,
        isPending,
    } = useAuthRegister();

    const form = useForm<IRegisterSchema>({
        resolver: zodResolver(RegisterSchema),
        shouldUnregister: false,
        defaultValues: {
            email: "",
            password: "",
            role: "dev"
        }
    })

    const passwordValue = useWatch({
        control: form.control,
        name: "password",
        defaultValue: ""
    });

    const passwordTooShort = passwordValue.length < 8;

    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => setIsVisible(prevState => !prevState)

    const strength = requirements.map(req => ({
        met: req.regex.test(passwordValue),
        text: req.text
    }))

    const strengthScore = useMemo(() => {
        return strength.filter(req => req.met).length
    }, [strength])


    const getColor = (score: number) => {
        if (score === 0) return 'bg-border'
        if (score <= 1) return 'bg-destructive'
        if (score <= 2) return 'bg-orange-500 '
        if (score <= 3) return 'bg-amber-500'
        if (score === 4) return 'bg-yellow-400'

        return 'bg-green-500'
    }

    const getText = (score: number) => {
        if (score === 0) return 'Enter a password'
        if (score <= 2) return 'Weak password'
        if (score <= 3) return 'Medium password'
        if (score === 4) return 'Strong password'

        return 'Very strong password'
    }

    const register = (data: IRegisterSchema) => {
        mutate({ data }, {
            onSuccess: ( success ) => {
                CustomToaster.successToast(success.message);
            },
            onError: (error) => {
                const apiError = error as AxiosError<ApiError>;

                CustomToaster.errorToast(apiError.response?.data.message ?? "Something goes wrong!");
            }
        })
    }

    const redirectToLogin = () => {
        navigate({to: "/auth/login"});
    }

    return(
        <div className="flex flex-col items-center justify-center">
            <form id="login-form" onSubmit={form.handleSubmit(register)} className="flex flex-col items-center justify-center w-[500px]">
            {step === "role" ? (
                <>
                    <h1 className="text-4xl font-[Agbalumo] text-primary">Tell us about yourself</h1>
                    <p className="max-w-120 text-center text-sm mt-2">Select your role to help us customize your experience and match you with the right opportunities.</p>
                    <Controller
                        control={form.control}
                        name="role"
                        render={({field}) => (
                            <RadioGroup 
                                onValueChange={field.onChange}
                                value={field.value}
                                className="gap-2 my-6 w-full p-0"
                            >
                                <FieldLabel htmlFor="dev" className="m-0 p-0">
                                    <Field className="cursor-pointer hover:bg-primary/5" orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Developer</FieldTitle>
                                            <FieldDescription>I'm a developer looking for new career opportunities.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="dev" id="dev"/>
                                    </Field>
                                </FieldLabel>
                                <FieldLabel htmlFor="company" className="m-0 p-0">
                                    <Field className="cursor-pointer hover:bg-primary/5" orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Company</FieldTitle>
                                            <FieldDescription>I'm a recruiter or manager looking for technical talent.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="company" id="company"/>
                                    </Field>
                                </FieldLabel>
                                <FieldLabel htmlFor="client" className="m-0 p-0">
                                    <Field className="cursor-pointer hover:bg-primary/5" orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>Client</FieldTitle>
                                            <FieldDescription>I'm an individual looking to hire developers for freelance projects.</FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem value="client" id="client"/>
                                    </Field>
                                </FieldLabel>
                            </RadioGroup>
                        )} />
                    <Button type="button" className="w-full" onClick={() => setStep("data")}>Next <ChevronRight /></Button>
                    <p className="text-sm flex gap-1 mt-1">Already have an account? <span onClick={redirectToLogin} className="underline text-primary cursor-pointer">Sing In</span></p>
                </>
            ): (
                <>
                    <h1 className="text-4xl font-[Agbalumo] text-primary">Set up your account</h1>
                    <p className="max-w-120 text-center text-sm mt-2">Create your credentials to get full access to the platform and start your journey.</p>
                    <div className="flex flex-col gap-4 mt-6 w-full">
                        <Controller
                            control={form.control}
                            name="email"
                            render={({field, fieldState}) => (
                                <Field>
                                    <FieldLabel className="w-full" htmlFor="email">E-mail</FieldLabel>
                                    <Input
                                        {...field} 
                                        aria-invalid={fieldState.invalid}
                                        name="email" 
                                        className="w-full"
                                        placeholder="john_doe@email.com" 
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                        )}/>
                        <Controller
                            control={form.control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <Field className='w-full'>
                                    <FieldLabel htmlFor={"password"}>Password</FieldLabel>
                                    <div className='relative'>
                                        <Input
                                            {...field}
                                            id={"password"}
                                            type={isVisible ? 'text' : 'password'}
                                            placeholder='••••••••'
                                            className='pr-9'
                                        />
                                        <Button
                                            type="button"
                                            variant='ghost'
                                            size='icon'
                                            onClick={toggleVisibility}
                                            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
                                        >
                                        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                                        <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
                                        </Button>
                                    </div>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <div className='mb-4 flex h-1 w-full gap-1'>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                        <span
                                            key={index}
                                            className={cn(
                                            'h-full flex-1 rounded-full transition-all duration-500 ease-out',
                                            index < strengthScore ? getColor(strengthScore) : 'bg-border'
                                            )}
                                        />
                                        ))}
                                    </div>

                                    <p className='text-foreground text-sm font-medium'>{getText(strengthScore)}. Must contain:</p>

                                    <ul className='mb-4 space-y-1.5'>
                                        {strength.map((req, index) => (
                                        <li key={index} className='flex items-center gap-2'>
                                            {req.met ? (
                                            <CheckIcon className='size-4 text-green-600 dark:text-green-400' />
                                            ) : (
                                            <XIcon className='text-muted-foreground size-4' />
                                            )}
                                            <span className={cn('text-xs', req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>
                                            {req.text}
                                            <span className='sr-only'>{req.met ? ' - Requirement met' : ' - Requirement not met'}</span>
                                            </span>
                                        </li>
                                        ))}
                                    </ul>
                                </Field>
                        )} />
                        <div className="flex gap-3 items-center mb-8">
                        <Checkbox /> <Label>I agree with the platform <span className="underline text-primary cursor-pointer">usage terms</span> and <span className="underline text-primary cursor-pointer">privacy policy</span></Label>
                        </div>
                        <div className="w-full flex flex-col justify-center items-center gap-2">
                            <Button type="button" className="w-full" variant={"outline"} onClick={() => setStep("role")}> <ChevronLeft /> Back to roles</Button>
                            <Button type="submit" className="w-full" disabled={isPending || passwordTooShort}>{isPending ? <Spinner /> : "Register"}</Button>
                            <p className="text-sm flex gap-1">Already have an account? <span onClick={redirectToLogin} className="underline text-primary cursor-pointer">Sing In</span></p>
                        </div>
                    </div>
                </>
            )}
            </form>
        </div>
    );
}