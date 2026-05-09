import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import z from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUser } from "@/api/generated/user/user";
import { useAuthStore } from "@/stores/auth-store";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { Spinner } from "../ui/spinner";

const PasswordChangeSchema = z
  .object({
    old_password: z
      .string()
      .min(1, "A senha atual é obrigatória."),
    
    new_password: z
      .string()
      .min(8, "A nova senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula.")
      .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula.")
      .regex(/[0-9]/, "Deve conter ao menos um número.")
      .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial."),
    
    new_password_confirmation: z
      .string()
      .min(1, "A confirmação da nova senha é obrigatória."),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "As novas senhas não coincidem.",
    path: ["new_password_confirmation"], // Define onde o erro será exibido
  })
  .refine((data) => data.new_password !== data.old_password, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["new_password"],
});

type IPasswordChangeSchema = z.infer<typeof PasswordChangeSchema>;

export default function PasswordChange(){

    const { user } = useAuthStore();

    const form = useForm<IPasswordChangeSchema>({
        resolver: zodResolver(PasswordChangeSchema),
        defaultValues: {
            old_password: "",
            new_password: "",
            new_password_confirmation: ""
        }
    });

    const {
        mutate,
        isPending
    } = useUpdateUser();

    const handleChange = (data: IPasswordChangeSchema) => {
        mutate({ user: user?.id as string, data }, {
            onSuccess: () => {
                CustomToaster.successToast("Password changed with success");
                form.reset();
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    return(
        <form onSubmit={form.handleSubmit(handleChange)} className="flex flex-col gap-3">
            <Controller 
                control={form.control}
                name="old_password"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>Actual password</FieldLabel>
                        <Input
                            value={field.value}
                            onChange={field.onChange} 
                            placeholder="Old password" 
                        />
                    </Field>
                )}
            />
            <Controller 
                control={form.control}
                name="new_password"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>New password</FieldLabel>
                        <Input
                            value={field.value}
                            onChange={field.onChange} 
                            placeholder="New password" 
                        />
                    </Field>
                )}
            />
            <Controller 
                control={form.control}
                name="new_password_confirmation"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>New password confirmation</FieldLabel>
                        <Input
                            value={field.value}
                            onChange={field.onChange} 
                            placeholder="New password confirmation" 
                        />
                    </Field>
                )}
            />
            <Button disabled={!form.formState.isDirty || isPending}>{ isPending ? <Spinner /> : "Change" }</Button>
        </form>
    );
}