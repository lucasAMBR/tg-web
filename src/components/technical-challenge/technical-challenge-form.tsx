import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ChevronDownIcon, Paperclip, XIcon } from "lucide-react";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getIndexStepAppliesQueryKey } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { getShowJobVacancyQueryKey } from "@/api/generated/job-vacancy/job-vacancy";
import type { TechnicalChallengeResource } from "@/api/generated/models";
import {
	getShowTechnicalChallengeQueryKey,
	useStoreTechnicalChallenge,
	useUpdateTechnicalChallenge,
} from "@/api/generated/technical-challenge/technical-challenge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
	GUIDE_DOCUMENT_EXTENSIONS,
	type ITechnicalChallengeSchema,
	TechnicalChallengeSchema,
} from "@/schemas/technical-challenge/TechnicalChallengeSchema";
import { acceptsZipSubmission } from "@/types/technical-challenge";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	formatDateOnly,
	parseLocalDateFromIso,
	toIsoDateOnly,
} from "@/utils/date-only";
import { onError } from "@/utils/on-error";

interface TechnicalChallengeFormProps {
	vacancyId: string;
	/** Ausente no cadastro, presente na edição do desafio já criado. */
	challenge?: TechnicalChallengeResource;
	onSaved: () => void;
	onCancel: () => void;
}

/** Enunciado do desafio técnico montado pela empresa. */
export default function TechnicalChallengeForm({
	vacancyId,
	challenge,
	onSaved,
	onCancel,
}: TechnicalChallengeFormProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const isUpdate = !!challenge;

	const form = useForm<ITechnicalChallengeSchema>({
		resolver: zodResolver(TechnicalChallengeSchema),
		defaultValues: challenge
			? {
					title: challenge.title,
					description: challenge.description,
					rules: challenge.rules ?? "",
					due_date: toIsoDateOnly(challenge.due_date ?? ""),
					accepts_zip_submission: acceptsZipSubmission(challenge),
				}
			: {
					title: "",
					description: "",
					rules: "",
					due_date: "",
					accepts_zip_submission: false,
				},
	});

	const { mutateAsync: createChallenge, isPending: isCreating } =
		useStoreTechnicalChallenge();

	const { mutateAsync: updateChallenge, isPending: isUpdating } =
		useUpdateTechnicalChallenge();

	const isPending = isCreating || isUpdating;

	const submit = async (data: ITechnicalChallengeSchema) => {
		try {
			if (challenge) {
				await updateChallenge({
					id: challenge.id,
					data: {
						title: data.title,
						description: data.description,
						rules: data.rules || undefined,
						due_date: data.due_date,
						accepts_zip_submission: data.accepts_zip_submission,
					},
				});

				CustomToaster.successToast(
					t("toast.success.technical_challenge_updated"),
				);
			} else {
				await createChallenge({
					jobVacancyId: vacancyId,
					data: {
						title: data.title,
						description: data.description,
						rules: data.rules || undefined,
						due_date: data.due_date,
						accepts_zip_submission: data.accepts_zip_submission,
						guide_document: data.guide_document,
					},
				});

				CustomToaster.successToast(
					t("toast.success.technical_challenge_created"),
				);
			}

			// O cadastro tira a vaga de `awaiting_technical_challenge` e cria as entregas
			queryClient.invalidateQueries({
				queryKey: getShowTechnicalChallengeQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({
				queryKey: getShowJobVacancyQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({
				queryKey: getIndexStepAppliesQueryKey(vacancyId),
			});

			onSaved();
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-6">
			<div className="flex flex-col gap-4">
				<Controller
					control={form.control}
					name="title"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>{t("technical_challenge.form.title")}</FieldLabel>
							<Input
								{...field}
								placeholder={t("technical_challenge.form.title_placeholder")}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="description"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>
								{t("technical_challenge.form.description")}
							</FieldLabel>
							<Textarea
								{...field}
								rows={8}
								placeholder={t(
									"technical_challenge.form.description_placeholder",
								)}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="rules"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>{t("technical_challenge.form.rules")}</FieldLabel>
							<Textarea
								{...field}
								rows={5}
								placeholder={t("technical_challenge.form.rules_placeholder")}
								aria-invalid={fieldState.invalid}
							/>
							<p className="text-sm text-muted-foreground">
								{t("technical_challenge.form.rules_description")}
							</p>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="due_date"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel>{t("technical_challenge.form.due_date")}</FieldLabel>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant={"outline"}
										className={cn(
											"w-full justify-between text-left font-normal sm:w-72",
											!field.value && "text-muted-foreground",
										)}
									>
										{field.value ||
											t("technical_challenge.form.due_date_placeholder")}
										<ChevronDownIcon className="h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={parseLocalDateFromIso(field.value ?? "")}
										onSelect={(date) =>
											field.onChange(date ? formatDateOnly(date) : "")
										}
										// A API exige uma data futura (`after:today`)
										disabled={(date) =>
											date <= new Date(new Date().toDateString())
										}
									/>
								</PopoverContent>
							</Popover>
							<p className="text-sm text-muted-foreground">
								{t("technical_challenge.form.due_date_description")}
							</p>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="accepts_zip_submission"
					render={({ field }) => (
						<div className="flex flex-row items-start gap-3">
							<Switch
								id="accepts-zip-submission"
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
							<div className="flex flex-col gap-1">
								<FieldLabel htmlFor="accepts-zip-submission">
									{t("technical_challenge.form.accepts_zip_submission")}
								</FieldLabel>
								<p className="text-sm text-muted-foreground">
									{t(
										"technical_challenge.form.accepts_zip_submission_description",
									)}
								</p>
							</div>
						</div>
					)}
				/>
				{/* Na edição o guia tem endpoints próprios, fora do formulário */}
				{!isUpdate && (
					<Controller
						control={form.control}
						name="guide_document"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>
									{t("technical_challenge.form.guide_document")}
								</FieldLabel>
								<input
									type="file"
									className="hidden"
									ref={fileInputRef}
									accept={GUIDE_DOCUMENT_EXTENSIONS.join(",")}
									onChange={(event) =>
										field.onChange(event.target.files?.[0] ?? undefined)
									}
								/>
								<div className="flex flex-row flex-wrap items-center gap-2">
									<Button
										type="button"
										variant={"secondary"}
										onClick={() => fileInputRef.current?.click()}
									>
										<Paperclip />
										{t("technical_challenge.form.attach_guide")}
									</Button>
									{field.value && (
										<>
											<span className="text-sm text-muted-foreground break-all">
												{field.value.name}
											</span>
											<Button
												type="button"
												size={"icon"}
												variant={"ghost"}
												aria-label={t("general.remove")}
												onClick={() => {
													field.onChange(undefined);

													if (fileInputRef.current) {
														fileInputRef.current.value = "";
													}
												}}
											>
												<XIcon />
											</Button>
										</>
									)}
								</div>
								<p className="text-sm text-muted-foreground">
									{t("technical_challenge.form.guide_document_description")}
								</p>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
				)}
			</div>
			<div className="flex flex-row flex-wrap justify-end gap-2">
				<Button type="button" variant={"secondary"} onClick={onCancel}>
					{t("general.cancel")}
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? <Spinner /> : t("general.save")}
				</Button>
			</div>
		</form>
	);
}
