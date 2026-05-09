import type { RecommendationPreferencesModel } from "@/api/generated/models";
import { Card, CardFooter } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldTitle } from "../ui/field";
import { Controller, useForm } from "react-hook-form";
import { UpdateJobTypePreferences, type IUpdateJobTypePreferences } from "@/schemas/settings/UpdateJobTypePreferences";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { RotateCcw, Save } from "lucide-react";
import { getGetDevRecommendationPreferenceQueryKey, useUpdateRecommedationPreferences } from "@/api/generated/recommendation-preferences/recommendation-preferences";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { Spinner } from "../ui/spinner";

interface CustomRecommendationJobTypeProps{
    profileId: string,
    initialData: RecommendationPreferencesModel
}

export default function CustomRecommendationJobType({ profileId, initialData }: CustomRecommendationJobTypeProps) {

    const queryClient = useQueryClient();

    const {
        mutate: updatePreferences,
        isPending
    } = useUpdateRecommedationPreferences();

    const form = useForm<IUpdateJobTypePreferences>({
        resolver: zodResolver(UpdateJobTypePreferences),
        defaultValues: {
            allow_clt: initialData.allow_clt ?? true,
            allow_contractor: initialData.allow_contractor ?? true,
            allow_internship: initialData.allow_internship ?? false
        },
        values: {
            allow_clt: initialData.allow_clt ?? true,
            allow_contractor: initialData.allow_contractor ?? true,
            allow_internship: initialData.allow_internship ?? false
        }
    });

    const clt = form.watch('allow_clt');
    const contractor = form.watch('allow_contractor');
    const internship = form.watch("allow_internship");

    const valuesAreEqualToDefault = clt === true && contractor === true && internship === false; 

    const sendPreferences = (data: IUpdateJobTypePreferences) => {
        updatePreferences({ profileId: profileId, data }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);

                queryClient.invalidateQueries({ queryKey: getGetDevRecommendationPreferenceQueryKey(profileId) });
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    const reset = () => {
        updatePreferences({ profileId: profileId, data: {
            allow_clt: true,
            allow_contractor: true,
            allow_internship: false
        } }, {
            onSuccess: (success) => {
                CustomToaster.successToast("Default configuration restored!");

                queryClient.invalidateQueries({ queryKey: getGetDevRecommendationPreferenceQueryKey(profileId) });
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    return (
        <Card className="p-4 flex-1">
            <form onSubmit={form.handleSubmit(sendPreferences)} className="flex flex-col gap-8">
                <Controller 
                    control={form.control}
                    name="allow_clt"
                    render={({ field }) => (
                         <Field orientation="horizontal">
                            <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                            />
                            <FieldContent>
                                <FieldTitle>CLT</FieldTitle>
                                <FieldDescription>
                                    Include traditional employment opportunities with standard labor rights and full corporate benefits.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    )}
                />
                
                <Controller 
                    control={form.control}
                    name="allow_contractor"
                    render={({ field }) => (
                        <Field orientation="horizontal">
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <FieldContent>
                                <FieldTitle>Contractor</FieldTitle>
                                <FieldDescription>
                                    Receive recommendations for contractor or B2B positions, providing services through your own legal entity.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    )}
                />
                
                <Controller 
                    control={form.control}
                    name="allow_internship"
                    render={({ field }) => (
                        <Field orientation="horizontal">
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <FieldContent>
                                <FieldTitle>Internship</FieldTitle>
                                <FieldDescription>
                                    Discover entry-level opportunities and training programs designed for students and junior professionals.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    )}
                />
                <CardFooter className="gap-2 justify-end p-0">
                    <Button type="button" variant={"outline"} disabled={valuesAreEqualToDefault} onClick={reset}><RotateCcw /> Reset</Button>
                    <Button type="submit" disabled={ isPending || !form.formState.isDirty }>{ isPending ? <Spinner /> : <><Save /> Save</> }</Button>
                </CardFooter>
            </form>
        </Card>
    );
}