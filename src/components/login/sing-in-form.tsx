import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LoginSchema, type ILoginSchema } from "@/schemas/login/LoginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth-store";

export function SingInForm(){

    const navigate = useNavigate();

    const { signIn } = useAuthStore();

    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(prevState => !prevState)

    const form = useForm<ILoginSchema>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const login = async (data: ILoginSchema) => {
        try{
            await signIn(data);

            const { user } = useAuthStore.getState();

            console.log(user);

            if (!user) return;

            const role = user.role[0];

            const hasProfile = 
                (role === 'dev' && user.dev_profile) || 
                (role === 'company' && user.company_profile) ||
                (role === 'client' && user.client_profile);

            if (!hasProfile) {
                navigate({ to: `/create/profile/${role}` });
                return;
            }

            const homeRoutes = {
                dev: "/home/dev",
                company: "/home/company",
                client: "/home/client",
            };

            navigate({ to: homeRoutes[role] || "/dashboard" });
           
        }catch(error){

        }
    }

    return(
        <form className="flex flex-col items-center justify-center w-[500px]" onSubmit={form.handleSubmit(login)}>
            <h1 className="text-4xl font-[Anta] text-primary">Welcome back!</h1>
                <p className="max-w-120 font-[Anta] text-center text-sm text-accent-foreground/70 mt-2">We missed you</p>
                <div className="flex flex-col gap-8 mt-6 w-full">
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
                            </Field>
                    )} />
                    <Button type="submit">Sing In</Button>
                </div>
                <p className="text-sm flex gap-1 mt-1">Doesn't have an account? <span onClick={() => navigate({to: "/auth/register"})} className="underline text-primary cursor-pointer">Register here</span></p>
        </form>
    );
}