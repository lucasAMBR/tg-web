import { getIndexAdditionalCoursesQueryKey, useStoreAdditionalCourse } from "@/api/generated/additional-courses-doc/additional-courses-doc";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCertificationParams } from "@/hooks/filters/use-certification-params";
import { CreateCertificationSchema, type ICreateCertificationSchema } from "@/schemas/certifications/CreateCertificationSchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { File, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface CreateCertificationCardProps {
    profileId: string
}
export default function CreateCertificationCard({ profileId }: CreateCertificationCardProps) {

    const queryClient = useQueryClient();

    const { page, perPage, search, setFilterParams } = useCertificationParams();

    const [creationIsOpen, setCreationIsOpen] = useState<boolean>(false)

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<ICreateCertificationSchema>({
        resolver: zodResolver(CreateCertificationSchema),
        defaultValues: {
            name: "",
            provider: "",
            certificate: undefined
        }
    });

    const {
        mutate: createCertification,
        isPending
    } = useStoreAdditionalCourse();

    const create = (data: ICreateCertificationSchema) => {
        createCertification({ data }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);
                form.reset();
                queryClient.invalidateQueries({
                    queryKey: getIndexAdditionalCoursesQueryKey({
                        dev_profile_id: profileId, 
                        page, 
                        per_page: perPage, 
                        search})
                });

                setFilterParams({page: 1, perPage: 10, search: ""});
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    return (
        <Card className="p-4">
            <div className="flex flex-row justify-between items-center">
                <h2 className="font-bold text-lg">Add new certification</h2>
                <Button size={'icon'} onClick={() => setCreationIsOpen(!creationIsOpen)}><Plus className={creationIsOpen ? 'rotate-45 transition-all duration-75' : 'transition-all duration-75'} /></Button>
            </div>
            {creationIsOpen && (
                <form onSubmit={form.handleSubmit(create)} className="flex flex-col gap-3">
                    <div className="flex gap-4">
                    <Controller 
                        control={form.control}
                        name="name"
                        render={({field, fieldState}) => (
                            <Field className="flex-2">
                                <FieldLabel>Certification name</FieldLabel>
                                <Input
                                    placeholder="AWS certification"
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
                                <FieldLabel>Certification provider</FieldLabel>
                                <Input
                                    placeholder="Amazon"
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
                                <Label>Certificate</Label>

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
                                        <p className="text-sm">Select a PDF file</p>
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
                                                    Change
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
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Button disabled={isPending || !form.formState.isDirty}>{isPending ? <Spinner /> : "Register"}</Button>
                </form>
            )}
        </Card>
    );
}