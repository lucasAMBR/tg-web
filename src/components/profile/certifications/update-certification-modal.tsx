import { getIndexAdditionalCoursesQueryKey, useUpdateAdditionalCourse } from "@/api/generated/additional-course/additional-course";
import type { AdditionalCourseResource } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCertificationParams } from "@/hooks/filters/use-certification-params";
import { CreateCertificationSchema, type ICreateCertificationSchema } from "@/schemas/certifications/CreateCertificationSchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { File } from "lucide-react";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface UpdateCertificationModalModal{
    profileId: string,
    certificate: AdditionalCourseResource | null,
    open: boolean,
    openChange: (open: boolean) => void,
    closeModal: () => void
}
export default function UpdateCertificationModal({profileId, certificate, open, openChange, closeModal}: UpdateCertificationModalModal){

    if (!certificate) return null;

    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const {
        page,
        perPage,
        search,
        setFilterParams
    } = useCertificationParams();

    const form = useForm<ICreateCertificationSchema>({
        resolver: zodResolver(CreateCertificationSchema),
        defaultValues: {
            name: certificate.name ?? "",
            provider: certificate.provider ?? "",
            certificate: undefined
        }
    })

    const {
        mutate: updateCertification,
        isPending
    } = useUpdateAdditionalCourse();

    const handleUpdate = (data: ICreateCertificationSchema) => {
        updateCertification({ id: certificate.id, data }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.certification_updated"));
                queryClient.invalidateQueries({
                    queryKey: getIndexAdditionalCoursesQueryKey({
                        dev_profile_id: profileId, 
                        page, 
                        per_page: perPage, 
                        search
                    })
                });

                setFilterParams({page: 1, perPage: 10, search: ""});

                closeModal();
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    return(
        <Dialog open={open} onOpenChange={openChange}>
            <DialogContent className="min-w-2/5">
                <DialogHeader>
                    <DialogTitle>{t("dev_profile.certifications.update_certification")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="flex flex-col gap-3">
                    <Card className="p-4">
                    <div className="flex gap-4">
                        <Controller 
                            control={form.control}
                            name="name"
                            render={({field, fieldState}) => (
                                <Field className="flex-2">
                                    <FieldLabel>{t("input.certification_name")}</FieldLabel>
                                    <Input
                                        placeholder={t("placeholder.certification_name")}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    <FieldError errors={[fieldState.error]}/>
                                </Field>
                            )}
                        />
                        <Controller 
                            control={form.control}
                            name="provider"
                            render={({field, fieldState}) => (
                                <Field className="flex-1">
                                    <FieldLabel>{t("input.certification_provider")}</FieldLabel>
                                    <Input
                                        placeholder={t("placeholder.certification_provider")}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    <FieldError errors={[fieldState.error]}/>
                                </Field>
                            )}
                        />
                        </div>
                        <Controller
                            control={form.control}
                            name="certificate"
                            render={({ field }) => (
                                <div className="flex flex-col gap-2">
                                    <Label>{t("input.certificate")}</Label>
    
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        id="certificate-input"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            field.onChange(file);
                                            e.target.value = "";
                                        }}
                                    />
    
                                    {!field.value && (
                                        <label
                                            htmlFor="certificate-input"
                                            className="w-full h-24 rounded-lg border-2 border-dashed border-primary/60 text-primary flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted"
                                        >
                                            <File />
                                            <p className="text-sm">{t("placeholder.certificate")}</p>
                                        </label>
                                    )}
    
                                    {field.value && (
                                        <div className="w-full p-3 rounded-lg border flex items-center justify-between">
                                            <span className="text-sm truncate max-w-[60%]">
                                                {field.value.name}
                                            </span>
    
                                            <div className="flex gap-2">
                                                {/* alterar */}
                                                <label htmlFor="certificate-input">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        {t("general.change")}
                                                    </Button>
                                                </label>
    
                                                {/* remover */}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        field.onChange(undefined);
    
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = "";
                                                        }
                                                    }}
                                                >
                                                    {t("general.remove")}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                        </Card>
                <DialogFooter>
                    <Button type="button" variant={"outline"}>{t("general.cancel")}</Button>
                    <Button type="submit" disabled={isPending || !form.formState.isDirty}>{t("general.update")}</Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}