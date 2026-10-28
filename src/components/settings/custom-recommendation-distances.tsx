import { Controller, useForm } from "react-hook-form";
import { Slider } from "@/components/ui/slider"
import { Field, FieldLabel } from "../ui/field";
import { Card, CardFooter } from "../ui/card";
import { UpdateMaxJobRadiusPreferences, type IUpdateMaxJobRadiusPreferences } from "@/schemas/settings/UpdateMaxJobRadiusPreference";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RecommendationPreferenceResource } from "@/api/generated/models";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDevRecommendationPreferenceQueryKey, useUpdateRecommendationPreferences } from "@/api/generated/recommendation-preference/recommendation-preference";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { Button } from "../ui/button";
import { RotateCcw, Save } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useTranslation } from "react-i18next";

interface CustomRecommendationDistancesProps{
    profileId: string,
    initialData: RecommendationPreferenceResource
}

export default function CustomRecommendationDistances({ profileId, initialData }: CustomRecommendationDistancesProps) {

    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const {
        mutate: updatePreferences,
        isPending
    } = useUpdateRecommendationPreferences();

    const form = useForm<IUpdateMaxJobRadiusPreferences>({
        resolver: zodResolver(UpdateMaxJobRadiusPreferences),
        defaultValues: {
            on_site_job_radius: initialData.on_site_job_radius ?? 10,
            hybrid_jobs_radius: initialData.hybrid_jobs_radius ?? 10
        },
        values: {
            on_site_job_radius: initialData.on_site_job_radius ?? 10,
            hybrid_jobs_radius: initialData.hybrid_jobs_radius ?? 10
        }
    });

    const onSiteRadius = form.watch('on_site_job_radius');
    const hybridRadius = form.watch('hybrid_jobs_radius');
    
    const sendPreferences = (data: IUpdateMaxJobRadiusPreferences) => {
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

    const valueIsEqualDefault = onSiteRadius === 20 && hybridRadius === 40;

    const reset = () => {
        updatePreferences({ devProfileId: profileId, data: { 
            on_site_job_radius: 20, 
            hybrid_jobs_radius: 40
            } 
        }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.recommendation_preferences_restored"));

                queryClient.invalidateQueries({ queryKey: getGetDevRecommendationPreferenceQueryKey(profileId) });

                form.reset({ 
                    on_site_job_radius: 20, 
                    hybrid_jobs_radius: 40
                })
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    return(
        <Card className="p-6 flex-1">
        <form onSubmit={form.handleSubmit(sendPreferences)} className="flex flex-col gap-8">
            <Controller
                control={form.control}
                name="on_site_job_radius"
                render={({ field: { value, onChange } }) => (
                    <Field>
                        <FieldLabel>{t("enum.employment_type.on_site")}: {value + " Km"}</FieldLabel>
                        <Slider
                            value={[value]}           
                            onValueChange={(vals) => {
                                const hardLimit = 10; 
                                const newValue = vals[0] < hardLimit ? hardLimit : vals[0];
                                onChange(newValue);
                            }}
                            min={0}
                            max={150}
                            step={5}
                            className="w-full"
                        />
                    </Field>
                )}
            />
            <Controller
                control={form.control}
                name="hybrid_jobs_radius"
                render={({ field: { value, onChange } }) => (
                    <Field>
                        <FieldLabel>{t("enum.employment_type.hybrid")}: {value + " Km"}</FieldLabel>
                        <Slider
                            value={[value]}           
                            onValueChange={(vals) => {
                                const hardLimit = 10; 
                                const newValue = vals[0] < hardLimit ? hardLimit : vals[0];
                                onChange(newValue);
                            }}
                            min={0}
                            max={150}
                            step={5}
                            className="w-full"
                        />
                    </Field>
                )}
            />
            <CardFooter className="gap-2 justify-end p-0">
                <Button type="button" onClick={reset} variant={"outline"} disabled={valueIsEqualDefault} ><RotateCcw /> {t("general.reset")}</Button>
                <Button type="submit" disabled={ isPending || !form.formState.isDirty }>{ isPending ? <Spinner /> : <> <Save /> {t("general.save")} </> }</Button>
            </CardFooter>
        </form>
        </Card>
    );
}