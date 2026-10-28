import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getIndexStepAppliesQueryKey } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { useSetExerciseDevJobVacancyLiveCoding } from "@/api/generated/dev-job-vacancy-live-coding/dev-job-vacancy-live-coding";
import { getShowJobVacancyQueryKey } from "@/api/generated/job-vacancy/job-vacancy";
import type { DevJobVacancyLiveCodingResource } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
	type ILiveCodingExerciseSchema,
	LiveCodingExerciseSchema,
} from "@/schemas/live-coding/LiveCodingExerciseSchema";
import { liveCodingHasExercise } from "@/types/dev-job-vacancy-live-coding";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

interface LiveCodingExerciseModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	liveCoding: DevJobVacancyLiveCodingResource;
}

/**
 * Escrita do exercício pela empresa. O mesmo endpoint publica e corrige, então
 * o modal serve aos dois casos.
 */
export default function LiveCodingExerciseModal({
	open,
	onOpenChange,
	liveCoding,
}: LiveCodingExerciseModalProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const hasExercise = liveCodingHasExercise(liveCoding);

	const form = useForm<ILiveCodingExerciseSchema>({
		resolver: zodResolver(LiveCodingExerciseSchema),
		defaultValues: { statement: "", programming_language: "" },
	});

	const { reset } = form;

	// A edição parte do enunciado atual
	useEffect(() => {
		if (!open) return;

		reset({
			statement: liveCoding.statement ?? "",
			programming_language: liveCoding.programming_language ?? "",
		});
	}, [open, liveCoding, reset]);

	const { mutateAsync: setExercise, isPending } =
		useSetExerciseDevJobVacancyLiveCoding();

	const submit = async (data: ILiveCodingExerciseSchema) => {
		try {
			await setExercise({
				id: liveCoding.id,
				data: {
					statement: data.statement,
					// `null` explícito limpa a linguagem que já estava definida
					programming_language: data.programming_language || null,
				},
			});

			CustomToaster.successToast(t("toast.success.live_coding_exercise_saved"));

			// O último exercício publicado tira a vaga e as candidaturas da espera
			queryClient.invalidateQueries({
				queryKey: getShowJobVacancyQueryKey(liveCoding.job_vacancy_id),
			});
			queryClient.invalidateQueries({
				queryKey: getIndexStepAppliesQueryKey(liveCoding.job_vacancy_id),
			});

			onOpenChange(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{t(
							hasExercise
								? "live_coding.exercise_modal.title_edit"
								: "live_coding.exercise_modal.title_write",
						)}
					</DialogTitle>
					<DialogDescription>
						{t("live_coding.exercise_modal.description")}
					</DialogDescription>
				</DialogHeader>
				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit(submit)}
				>
					<Controller
						control={form.control}
						name="statement"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>
									{t("live_coding.exercise_modal.statement")}
								</FieldLabel>
								<Textarea
									{...field}
									rows={10}
									placeholder={t(
										"live_coding.exercise_modal.statement_placeholder",
									)}
									aria-invalid={fieldState.invalid}
								/>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<Controller
						control={form.control}
						name="programming_language"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>
									{t("live_coding.exercise_modal.programming_language")}
								</FieldLabel>
								<Input
									{...field}
									className="sm:w-72"
									placeholder={t(
										"live_coding.exercise_modal.programming_language_placeholder",
									)}
									aria-invalid={fieldState.invalid}
								/>
								<p className="text-sm text-muted-foreground">
									{t(
										"live_coding.exercise_modal.programming_language_description",
									)}
								</p>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<DialogFooter>
						<Button
							type="button"
							variant={"secondary"}
							onClick={() => onOpenChange(false)}
						>
							{t("general.cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? <Spinner /> : t("general.save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
