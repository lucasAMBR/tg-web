import type { RecommendationPreferenceResource } from "@/api/generated/models";
import { Card, CardFooter } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldTitle } from "../ui/field";
import { UpdateJobModalityPreferences, type IUpdateJobModalityPreferences } from "@/schemas/settings/UpdateJobModalityPreferences";
import { getGetDevRecommendationPreferenceQueryKey, useUpdateRecommendationPreferences } from "@/api/generated/recommendation-preference/recommendation-preference";
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
import { useTranslation } from "react-i18next";

interface CustomRecommendationJobModality {
    profileId: string,
    initialData: RecommendationPreferenceResource
}

export default function CustomRecommendationJobModality({ profileId, initialData }: CustomRecommendationJobModality) {
    
    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const {
        mutate: updatePreferences,
        isPending
    } = useUpdateRecommendationPreferences();

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
        updatePreferences({ devProfileId: profileId, data }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.recommendation_preferences_updated"));

                queryClient.invalidateQueries({ queryKey: getGetDevRecommendationPreferenceQueryKey(profileId) });
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    const reset = () => {
        updatePreferences({ devProfileId: profileId, data: {
            allow_on_site: true,
            allow_hybrid: true,
            allow_remote: true,
        } }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.recommendation_preferences_restored"));

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
                                <FieldTitle>{t("enum.employment_type.on_site")}</FieldTitle>
                                <FieldDescription>
                                    {t("settings.recommendation.job_modality.on_site_description")}
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
                                <FieldTitle>{t("enum.employment_type.hybrid")}</FieldTitle>
                                <FieldDescription>
                                    {t("settings.recommendation.job_modality.hybrid_description")}
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
                                <FieldTitle>{t("enum.employment_type.remote")}</FieldTitle>
                                <FieldDescription>
                                    {t("settings.recommendation.job_modality.remote_description")}
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    )} 
                />
                <CardFooter className="gap-2 justify-end p-0">
                    <Button type="button" variant={"outline"} onClick={reset} disabled={valuesAreEqualToDefault}><RotateCcw /> {t("general.reset")}</Button>
                    <Button type="submit" disabled={ isPending || !form.formState.isDirty }>{ isPending ? <Spinner /> : <><Save /> {t("general.save")}</> }</Button>
                </CardFooter>
            </form>
        </Card>
    );
}