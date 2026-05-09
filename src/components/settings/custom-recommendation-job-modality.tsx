import type { RecommendationPreferencesModel } from "@/api/generated/models";
import { Card, CardFooter } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldTitle } from "../ui/field";
import { UpdateJobModalityPreferences, type IUpdateJobModalityPreferences } from "@/schemas/settings/UpdateJobModalityPreferences";
import { getGetDevRecommendationPreferenceQueryKey, useUpdateRecommedationPreferences } from "@/api/generated/recommendation-preferences/recommendation-preferences";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { RotateCcw, Save } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface CustomRecommendationJobModality {
    profileId: string,
    initialData: RecommendationPreferencesModel
}

export default function CustomRecommendationJobModality({ profileId, initialData }: CustomRecommendationJobModality) {
    
    const queryClient = useQueryClient();

    const {
        mutate: updatePreferences,
        isPending
    } = useUpdateRecommedationPreferences();

    const form = useForm<IUpdateJobModalityPreferences>({
        resolver: zodResolver(UpdateJobModalityPreferences),
        defaultValues: {
            allow_on_site: initialData.allow_on_site ?? true,
            allow_hybrid: initialData.allow_hybrid ?? true,
            allow_remote: initialData.allow_remote ?? true,
        },
        values: {
            allow_on_site: initialData.allow_on_site ?? true,
            allow_hybrid: initialData.allow_hybrid ?? true,
            allow_remote: initialData.allow_remote ?? true,
        }
    });

    const onSite = form.watch('allow_on_site');
    const hybrid = form.watch('allow_hybrid');
    const remote = form.watch('allow_remote');

    const valuesAreEqualToDefault = onSite === true && hybrid === true && remote === true; 

    const sendPreferences = (data: IUpdateJobModalityPreferences) => {
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
            allow_on_site: true,
            allow_hybrid: true,
            allow_remote: true,
        } }, {
            onSuccess: () => {
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
                    name="allow_on_site"
                    render={({ field }) => (
                        <Field orientation="horizontal">
                            <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <FieldContent>
                                <FieldTitle>On Site</FieldTitle>
                                <FieldDescription>
                                    Receive recommendations for positions that require full-time presence at the company's office.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    )}
                />
                
                <Controller 
                    control={form.control}
                    name="allow_hybrid"
                    render={({ field }) => (
                        <Field orientation="horizontal">
                            <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <FieldContent>
                                <FieldTitle>Hybrid</FieldTitle>
                                <FieldDescription>
                                    Discover roles that offer a balance between remote work and in-office days.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    )} 
                />
                
                <Controller 
                    control={form.control}
                    name="allow_remote"
                    render={({ field }) => (
                         <Field orientation="horizontal">
                            <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <FieldContent>
                                <FieldTitle>Remote</FieldTitle>
                                <FieldDescription>
                                    Get matched with fully remote positions, allowing you to work from anywhere.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    )} 
                />
                <CardFooter className="gap-2 justify-end p-0">
                    <Button type="button" variant={"outline"} onClick={reset} disabled={valuesAreEqualToDefault}><RotateCcw /> Reset</Button>
                    <Button type="submit" disabled={ isPending || !form.formState.isDirty }>{ isPending ? <Spinner /> : <><Save /> Save</> }</Button>
                </CardFooter>
            </form>
        </Card>
    );
}