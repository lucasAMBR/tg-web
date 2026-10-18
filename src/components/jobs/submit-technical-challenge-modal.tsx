import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Paperclip, XIcon } from "lucide-react";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSubmitDevTechnicalChallenge } from "@/api/generated/technical-challenge/technical-challenge";
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
import {
	type ISubmitTechnicalChallengeSchema,
	SubmitTechnicalChallengeSchema,
} from "@/schemas/technical-challenge/SubmitTechnicalChallengeSchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

interface SubmitTechnicalChallengeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Id da entrega (`technical_challenge.id` da candidatura). */
	devChallengeId: string;
	/** O zip só é aceito quando a empresa liberou o envio no enunciado. */
	acceptsZip: boolean;
}

/** Entrega da solução do desafio técnico pelo desenvolvedor. */
export default function SubmitTechnicalChallengeModal({
	open,
	onOpenChange,
	devChallengeId,
	acceptsZip,
}: SubmitTechnicalChallengeModalProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<ISubmitTechnicalChallengeSchema>({
		resolver: zodResolver(SubmitTechnicalChallengeSchema),
		defaultValues: { repository_url: "" },
	});

	const { mutateAsync: submitChallenge, isPending } =
		useSubmitDevTechnicalChallenge();

	const submit = async (data: ISubmitTechnicalChallengeSchema) => {
		try {
			await submitChallenge({
				id: devChallengeId,
				data: {
					repository_url: data.repository_url,
					// A API recusa o zip nos desafios que não o aceitam
					submission_file: acceptsZip ? data.submission_file : undefined,
				},
			});

			CustomToaster.successToast(
				t("toast.success.technical_challenge_delivered"),
			);

			// A entrega vem junto da candidatura, então a listagem inteira é refeita
			queryClient.invalidateQueries({ queryKey: ["/dev-vacancy/my-applies"] });

			form.reset();
			onOpenChange(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t("my_applies.technical_challenge.submit")}
					</DialogTitle>
					<DialogDescription>
						{t("my_applies.technical_challenge.submit_description")}
					</DialogDescription>
				</DialogHeader>
				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit(submit)}
				>
					<Controller
						control={form.control}
						name="repository_url"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>
									{t("my_applies.technical_challenge.repository_url")}
								</FieldLabel>
								<Input
									{...field}
									placeholder={t("my_applies.portfolio.url_placeholder")}
									aria-invalid={fieldState.invalid}
								/>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					{acceptsZip && (
						<Controller
							control={form.control}
							name="submission_file"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>
										{t("my_applies.technical_challenge.zip_optional")}
									</FieldLabel>
									<input
										type="file"
										className="hidden"
										ref={fileInputRef}
										accept=".zip"
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
											{t("my_applies.technical_challenge.attach_zip")}
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
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					)}
					<DialogFooter>
						<Button
							type="button"
							variant={"secondary"}
							onClick={() => onOpenChange(false)}
						>
							{t("general.cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? (
								<Spinner />
							) : (
								t("my_applies.technical_challenge.submit")
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
