import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import z from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserUserUpdate0 } from "@/api/generated/user/user";
import { useAuthStore } from "@/stores/auth-store";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { Spinner } from "../ui/spinner";
import { useTranslation } from "react-i18next";

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

    const { t } = useTranslation();

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
    } = useUserUserUpdate0();

    const handleChange = (data: IPasswordChangeSchema) => {
        mutate({ id: user?.id as string, data }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.password_updated"));
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
                render={({ field }) => (
                    <Field>
                        <FieldLabel>{t("input.old_password")}</FieldLabel>
                        <Input
                            value={field.value}
                            type="password"
                            onChange={field.onChange} 
                            placeholder={t("placeholder.old_password")} 
                        />
                    </Field>
                )}
            />
            <Controller 
                control={form.control}
                name="new_password"
                render={({ field }) => (
                    <Field>
                        <FieldLabel>{t("input.new_password")}</FieldLabel>
                        <Input
                            value={field.value}
                            type="password"
                            onChange={field.onChange} 
                            placeholder={t("placeholder.new_password")} 
                        />
                    </Field>
                )}
            />
            <Controller 
                control={form.control}
                name="new_password_confirmation"
                render={({ field }) => (
                    <Field>
                        <FieldLabel>{t("input.new_password_confirmation")}</FieldLabel>
                        <Input
                            value={field.value}
                            type="password"
                            onChange={field.onChange} 
                            placeholder={t("placeholder.new_password_confirmation")} 
                        />
                    </Field>
                )}
            />
            <Button disabled={!form.formState.isDirty || isPending}>{ isPending ? <Spinner /> : "Change" }</Button>
        </form>
    );
}