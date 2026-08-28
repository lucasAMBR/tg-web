import type { RecommendationPreferenceResource } from "@/api/generated/models";
import { Card, CardFooter } from "../ui/card";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Switch } from "../ui/switch";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../ui/input-group";
import { Controller, useForm } from "react-hook-form";
import { UpdateMinRemunerationPreferences, type IUpdateMinRemunerationPreferences } from "@/schemas/settings/UpdateMinRemunerationPreference";
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

interface CustomRecommendationMinRemunerationProps{
    profileId: string,
    initialData: RecommendationPreferenceResource
}

export default function CustomRecommendationMinRemuneration({ profileId, initialData }: CustomRecommendationMinRemunerationProps) {

    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const {
        mutate: updatePreferences,
        isPending
    } = useUpdateRecommendationPreferences();

    const form = useForm<IUpdateMinRemunerationPreferences>({
        resolver: zodResolver(UpdateMinRemunerationPreferences),
        defaultValues: {
            min_remuneration: initialData?.min_remuneration ?? null
        },
        values: {
            min_remuneration: initialData?.min_remuneration ?? null
        }
    });

    const minRemuneration = form.watch('min_remuneration');

    const valuesAreEqualToDefault = minRemuneration === null;

    const sendPreferences = (data: IUpdateMinRemunerationPreferences) => {
        updatePreferences({ devProfileId: profileId, data }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.recommendation_preferences_updated"));

                queryClient.invalidateQueries({ queryKey: getGetDevRecommendationPreferenceQueryKey(profileId) });

                form.reset(data);
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    const reset = () => {
        updatePreferences({ devProfileId: profileId, data: {
            min_remuneration: null
        } }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.recommendation_preferences_restored"));

                queryClient.invalidateQueries({ queryKey: getGetDevRecommendationPreferenceQueryKey(profileId) });

                form.reset({ min_remuneration: null });
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    return (
        <Card className="p-6 flex-1">
            <form onSubmit={form.handleSubmit(sendPreferences)} className="flex flex-col gap-8">
                <Controller
                    control={form.control}
                    name="min_remuneration"
                    render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-6">
                            <Field className="flex flex-row items-center gap-4">
                                <Switch
                                    checked={field.value !== null}
                                    onCheckedChange={(checked) => field.onChange(checked ? 0 : null)}
                                />
                                <div className="flex flex-col">
                                    <FieldLabel>{t("settings.recommendation.min_remuneration.enable_title")}</FieldLabel>
                                    <p className="text-sm text-muted-foreground">
                                        {t("settings.recommendation.min_remuneration.enable_description")}
                                    </p>
                                </div>
                            </Field>

                            {field.value !== null && (
                                <Field>
                                    <FieldLabel>{t("input.min_remuneration")}</FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <InputGroupText>R$</InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            type="number"
                                            min={0}
                                            step={100}
                                            placeholder={t("placeholder.min_remuneration")}
                                            value={field.value}
                                            onChange={(e) => {
                                                const parsed = Number(e.target.value);
                                                field.onChange(e.target.value === "" || Number.isNaN(parsed) ? 0 : parsed);
                                            }}
                                        />
                                    </InputGroup>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        </div>
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
