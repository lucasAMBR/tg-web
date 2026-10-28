import type { TFunction } from "i18next";
import z from "zod/v3";
import { FreelanceProposalPricingTypeEnum } from "@/api/generated/models";
import {
	FREELANCE_ESTIMATED_HOURS_MAX,
	FREELANCE_HOURLY_RATE_MAX,
	FREELANCE_PROPOSAL_MESSAGE_MAX_LENGTH,
	FREELANCE_PROPOSAL_TOTAL_MAX,
} from "@/types/freelance";

/**
 * Orçamento do dev. O formulário guarda os campos das duas formas de cobrança,
 * para a troca entre elas não perder o que já foi digitado, e só valida os da
 * forma escolhida, como a API (`exclude_unless`).
 */
export function buildFreelanceProposalSchema(t: TFunction) {
	return z
		.object({
			pricing_type: z.nativeEnum(FreelanceProposalPricingTypeEnum),
			total_price: z.number().optional(),
			hourly_rate: z.number().optional(),
			estimated_hours: z.number().optional(),
			message: z
				.string()
				.max(
					FREELANCE_PROPOSAL_MESSAGE_MAX_LENGTH,
					t("freelance.proposal.errors.message_max"),
				),
		})
		.superRefine((values, ctx) => {
			const issue = (path: string, key: string) =>
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: [path],
					message: t(`freelance.proposal.errors.${key}`),
				});

			if (values.pricing_type === FreelanceProposalPricingTypeEnum.fixed) {
				const total = values.total_price;

				if (total === undefined || Number.isNaN(total)) {
					issue("total_price", "total_price_required");
				} else if (total <= 0) {
					issue("total_price", "total_price_min");
				} else if (total > FREELANCE_PROPOSAL_TOTAL_MAX) {
					issue("total_price", "total_price_max");
				}

				return;
			}

			const rate = values.hourly_rate;

			if (rate === undefined || Number.isNaN(rate)) {
				issue("hourly_rate", "hourly_rate_required");
			} else if (rate <= 0) {
				issue("hourly_rate", "hourly_rate_min");
			} else if (rate > FREELANCE_HOURLY_RATE_MAX) {
				issue("hourly_rate", "hourly_rate_max");
			}

			const hours = values.estimated_hours;

			if (hours === undefined || Number.isNaN(hours)) {
				issue("estimated_hours", "estimated_hours_required");
			} else if (!Number.isInteger(hours)) {
				issue("estimated_hours", "estimated_hours_integer");
			} else if (hours < 1) {
				issue("estimated_hours", "estimated_hours_min");
			} else if (hours > FREELANCE_ESTIMATED_HOURS_MAX) {
				issue("estimated_hours", "estimated_hours_max");
			}
		});
}

export type IFreelanceProposalSchema = z.infer<
	ReturnType<typeof buildFreelanceProposalSchema>
>;
