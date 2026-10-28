import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Controller, type FieldPath, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	useStoreFreelanceProposal,
	useUpdateFreelanceProposal,
} from "@/api/generated/freelance-proposal/freelance-proposal";
import type { StoreFreelanceProposalRequest } from "@/api/generated/models";
import Required from "@/components/global/required-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	invalidateFreelanceData,
	setCachedMyProposal,
} from "@/hooks/use-freelance-lists";
import {
	buildFreelanceProposalSchema,
	type IFreelanceProposalSchema,
} from "@/schemas/freelance-proposal/FreelanceProposalSchema";
import {
	FREELANCE_ESTIMATED_HOURS_MAX,
	FREELANCE_HOURLY_RATE_MAX,
	FREELANCE_PROPOSAL_MESSAGE_MAX_LENGTH,
	FREELANCE_PROPOSAL_TOTAL_MAX,
	FreelancePricingType,
	type FreelanceProposal,
	formatFreelanceMoney,
	getFreelanceLocale,
} from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	freelanceErrorMessageKey,
	freelanceFieldErrors,
} from "@/utils/freelance-error";

type FormPath = FieldPath<IFreelanceProposalSchema>;

const FORM_FIELDS: ReadonlySet<string> = new Set([
	"pricing_type",
	"total_price",
	"hourly_rate",
	"estimated_hours",
	"message",
]);

function toFormValues(
	proposal: FreelanceProposal | null | undefined,
): Partial<IFreelanceProposalSchema> {
	if (!proposal) {
		return { pricing_type: FreelancePricingType.fixed, message: "" };
	}

	const isHourly = proposal.pricing_type === FreelancePricingType.hourly;

	return {
		pricing_type: isHourly
			? FreelancePricingType.hourly
			: FreelancePricingType.fixed,
		total_price: isHourly ? undefined : Number(proposal.total_price),
		hourly_rate: proposal.hourly_rate
			? Number(proposal.hourly_rate)
			: undefined,
		estimated_hours: proposal.estimated_hours ?? undefined,
		message: proposal.message ?? "",
	};
}

/**
 * O contrato gerado marca `total_price`, `hourly_rate` e `estimated_hours` como
 * obrigatórios, mas a API usa `exclude_unless` e ignora os da outra forma de
 * cobrança. Vai só o que vale para a forma escolhida.
 */
function toPayload(values: IFreelanceProposalSchema) {
	const message = values.message.trim() || null;

	const payload =
		values.pricing_type === FreelancePricingType.hourly
			? {
					pricing_type: values.pricing_type,
					hourly_rate: values.hourly_rate,
					estimated_hours: values.estimated_hours,
					message,
				}
			: {
					pricing_type: values.pricing_type,
					total_price: values.total_price,
					message,
				};

	return payload as unknown as StoreFreelanceProposalRequest;
}

function parseNumber(value: string): number | undefined {
	return value === "" ? undefined : Number(value);
}

interface FreelanceProposalFormProps {
	vacancyId: string;
	/** Na edição, o orçamento pendente do dev. */
	proposal?: FreelanceProposal | null;
	onDone?: () => void;
	onCancel?: () => void;
}

export default function FreelanceProposalForm({
	vacancyId,
	proposal,
	onDone,
	onCancel,
}: FreelanceProposalFormProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const queryClient = useQueryClient();

	const isEditing = !!proposal;

	const schema = useMemo(() => buildFreelanceProposalSchema(t), [t]);

	const form = useForm<IFreelanceProposalSchema>({
		resolver: zodResolver(schema),
		defaultValues: toFormValues(proposal),
	});

	const pricingType = useWatch({ control: form.control, name: "pricing_type" });
	const hourlyRate = useWatch({ control: form.control, name: "hourly_rate" });
	const estimatedHours = useWatch({
		control: form.control,
		name: "estimated_hours",
	});

	const isHourly = pricingType === FreelancePricingType.hourly;

	// A API calcula o mesmo total (valor da hora × horas), com duas casas
	const hourlyTotal =
		hourlyRate && estimatedHours
			? Math.round(hourlyRate * estimatedHours * 100) / 100
			: undefined;

	const { mutateAsync: storeProposal, isPending: isStoring } =
		useStoreFreelanceProposal();
	const { mutateAsync: updateProposal, isPending: isUpdating } =
		useUpdateFreelanceProposal();

	const isPending = isStoring || isUpdating;

	const applyServerErrors = (error: unknown) => {
		const fieldErrors = freelanceFieldErrors(error);

		if (!fieldErrors) {
			CustomToaster.errorToast(t(freelanceErrorMessageKey(error, "proposal")));

			// O freela foi contratado, o dev já tinha orçamento ou o orçamento foi
			// decidido: o detalhe recarregado mostra o estado certo
			invalidateFreelanceData(queryClient, vacancyId);
			onCancel?.();

			return;
		}

		let unmappedMessage: string | undefined;
		let focused = false;

		for (const [key, messages] of Object.entries(fieldErrors)) {
			if (!FORM_FIELDS.has(key)) {
				unmappedMessage ??= messages[0];
				continue;
			}

			form.setError(
				key as FormPath,
				{ type: "server", message: messages[0] },
				{ shouldFocus: !focused },
			);
			focused = true;
		}

		if (unmappedMessage) CustomToaster.errorToast(unmappedMessage);
	};

	const submit = async (values: IFreelanceProposalSchema) => {
		try {
			const response = proposal
				? await updateProposal({ id: proposal.id, data: toPayload(values) })
				: await storeProposal({ id: vacancyId, data: toPayload(values) });

			CustomToaster.successToast(
				t(
					isEditing
						? "toast.success.freelance_proposal_updated"
						: "toast.success.freelance_proposal_sent",
				),
			);

			setCachedMyProposal(queryClient, vacancyId, response.data);
			invalidateFreelanceData(queryClient, vacancyId);

			onDone?.();
		} catch (error) {
			applyServerErrors(error);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4">
			<Controller
				control={form.control}
				name="pricing_type"
				render={({ field }) => (
					<Field>
						<FieldLabel>{t("freelance.proposal.pricing_type")}</FieldLabel>
						<ToggleGroup
							type="single"
							variant={"outline"}
							className="w-full"
							value={field.value}
							onValueChange={(value) => {
								if (value) field.onChange(value);
							}}
						>
							<ToggleGroupItem
								className="flex-1"
								value={FreelancePricingType.fixed}
							>
								{t("freelance.proposal.fixed")}
							</ToggleGroupItem>
							<ToggleGroupItem
								className="flex-1"
								value={FreelancePricingType.hourly}
							>
								{t("freelance.proposal.hourly")}
							</ToggleGroupItem>
						</ToggleGroup>
					</Field>
				)}
			/>

			{isHourly ? (
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-4 sm:flex-row">
						<Controller
							control={form.control}
							name="hourly_rate"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel htmlFor="proposal-hourly-rate">
										{t("freelance.proposal.hourly_rate")} <Required />
									</FieldLabel>
									<Input
										ref={field.ref}
										id="proposal-hourly-rate"
										type="number"
										inputMode="decimal"
										min={0}
										max={FREELANCE_HOURLY_RATE_MAX}
										step="0.01"
										value={field.value ?? ""}
										onBlur={field.onBlur}
										onChange={(event) =>
											field.onChange(parseNumber(event.target.value))
										}
										aria-invalid={fieldState.invalid}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="estimated_hours"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel htmlFor="proposal-estimated-hours">
										{t("freelance.proposal.estimated_hours")} <Required />
									</FieldLabel>
									<Input
										ref={field.ref}
										id="proposal-estimated-hours"
										type="number"
										inputMode="numeric"
										min={1}
										max={FREELANCE_ESTIMATED_HOURS_MAX}
										step="1"
										value={field.value ?? ""}
										onBlur={field.onBlur}
										onChange={(event) =>
											field.onChange(parseNumber(event.target.value))
										}
										aria-invalid={fieldState.invalid}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>
					<p className="text-sm font-medium" aria-live="polite">
						{t("freelance.proposal.total_preview", {
							total: formatFreelanceMoney(hourlyTotal ?? 0, locale),
						})}
					</p>
				</div>
			) : (
				<Controller
					control={form.control}
					name="total_price"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel htmlFor="proposal-total-price">
								{t("freelance.proposal.total_price")} <Required />
							</FieldLabel>
							<Input
								ref={field.ref}
								id="proposal-total-price"
								type="number"
								inputMode="decimal"
								min={0}
								max={FREELANCE_PROPOSAL_TOTAL_MAX}
								step="0.01"
								value={field.value ?? ""}
								onBlur={field.onBlur}
								onChange={(event) =>
									field.onChange(parseNumber(event.target.value))
								}
								aria-invalid={fieldState.invalid}
							/>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
			)}

			<Controller
				control={form.control}
				name="message"
				render={({ field, fieldState }) => (
					<Field>
						<FieldLabel htmlFor="proposal-message">
							{t("freelance.proposal.message")}
						</FieldLabel>
						<Textarea
							{...field}
							id="proposal-message"
							rows={4}
							maxLength={FREELANCE_PROPOSAL_MESSAGE_MAX_LENGTH}
							placeholder={t("freelance.proposal.message_placeholder")}
							aria-invalid={fieldState.invalid}
						/>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>

			<div className="flex w-full justify-end gap-2">
				{onCancel && (
					<Button type="button" variant={"outline"} onClick={onCancel}>
						{t("general.cancel")}
					</Button>
				)}
				<Button type="submit" disabled={isPending}>
					{isPending && <Loader2 className="animate-spin" />}
					{isEditing
						? t("freelance.proposal.save")
						: t("freelance.proposal.send")}
				</Button>
			</div>
		</form>
	);
}
