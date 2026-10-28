import type { RecommendationPreferenceResource } from "@/api/generated/models";
import { Card, CardFooter } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldTitle } from "../ui/field";
import { Controller, useForm } from "react-hook-form";
import { UpdateJobTypePreferences, type IUpdateJobTypePreferences } from "@/schemas/settings/UpdateJobTypePreferences";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { RotateCcw, Save } from "lucide-react";
import { getGetDevRecommendationPreferenceQueryKey, useUpdateRecommendationPreferences } from "@/api/generated/recommendation-preference/recommendation-preference";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { Spinner } from "../ui/spinner";
import { useTranslation } from "react-i18next";

interface CustomRecommendationJobTypeProps{
    profileId: string,
    initialData: RecommendationPreferenceResource
}

export default function CustomRecommendationJobType({ profileId, initialData }: CustomRecommendationJobTypeProps) {

    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const {
        mutate: updatePreferences,
        isPending
    } = useUpdateRecommendationPreferences();

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
            allow_clt: true,
            allow_contractor: true,
            allow_internship: false
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
                    name="allow_clt"
                    render={({ field }) => (
                         <Field orientation="horizontal">
                            <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                            />
                            <FieldContent>
                                <FieldTitle>{t("enum.contract_type.clt")}</FieldTitle>
                                <FieldDescription>
                                    {t("settings.recommendation.contract_type.clt_description")}
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
                                <FieldTitle>{t("enum.contract_type.contractor")}</FieldTitle>
                                <FieldDescription>
                                    {t("settings.recommendation.contract_type.contractor_description")}
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
                                <FieldTitle>{t("enum.contract_type.internship")}</FieldTitle>
                                <FieldDescription>
                                    {t("settings.recommendation.contract_type.internship_description")}
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    )}
                />
                <CardFooter className="gap-2 justify-end p-0">
                    <Button type="button" variant={"outline"} disabled={valuesAreEqualToDefault} onClick={reset}><RotateCcw /> {t("general.reset")}</Button>
                    <Button type="submit" disabled={ isPending || !form.formState.isDirty }>{ isPending ? <Spinner /> : <><Save /> {t("general.save")}</> }</Button>
                </CardFooter>
            </form>
        </Card>
    );
}