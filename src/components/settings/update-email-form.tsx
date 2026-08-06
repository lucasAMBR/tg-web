import z from "zod/v3";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth-store";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useEffect, useState } from "react";
import { useUpdateUser } from "@/api/generated/user/user";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { ApiError } from "@/utils/api-error";
import type { AxiosError } from "axios";
import { Spinner } from "../ui/spinner";
import { useTranslation } from "react-i18next";

const EmailChangeSchema = z.object({
    email: z.string().email()
})

type IEmailChangeSchema = z.infer<typeof EmailChangeSchema>

export default function UpdateEmailForm(){
    const { t } = useTranslation();
    const {
        user,
        hydrateUser
    } = useAuthStore();

    const form = useForm<IEmailChangeSchema>({
        resolver: zodResolver(EmailChangeSchema),
        defaultValues: {
            email: user?.email ?? ""
        }
    })

    const [ open, setOpen ] = useState<boolean>(false);

    const handleClose = () => {
        form.reset();
        setOpen(false);
    }

    const {
        mutate,
        isPending
    } = useUpdateUser();

    const handleUpdate = (data: IEmailChangeSchema) => {
        mutate({id: user?.id as string, data}, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.email_updated"));
                hydrateUser()

                handleClose();
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        });
    }

    useEffect(() => {
            if (user && !form.formState.isDirty) {
                form.reset({ email: user.email})
            }
    }, [user, form]);

    const FORM_ID = "update-email-form";

    return(
        <form id={FORM_ID} onSubmit={form.handleSubmit(handleUpdate)}>
            <div className='flex items-end gap-2'>
                <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>E-mail</FieldLabel>
                            <Input 
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={t("placeholder.email")} 
                            />
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button type="button" disabled={!form.formState.isDirty}>{t("general.change")}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("general.are_you_sure")}</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p className="text-sm text-muted-foreground">{t("settings.account.change_associated_email.change_email_confirmation")}</p>
                        <AlertDialogFooter>
                            <Button type="button" variant={"outline"} onClick={handleClose}>{t("general.cancel")}</Button>
                            <Button type="submit" form={FORM_ID} variant={"destructive"} disabled={isPending}>{isPending ? <Spinner /> : t("settings.account.change_associated_email.yes_change_my_email") }</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </form>
    );
}