import type { TFunction } from "i18next";
import z from "zod/v3";
import {
	DevSpecialtyEnum,
	FreelanceJobTypeEnum,
	HardSkillLevelsEnum,
	SeniorityLevelEnum,
} from "@/api/generated/models";
import {
	FREELANCE_BUDGET_MAX,
	FREELANCE_TITLE_MAX_LENGTH,
} from "@/types/freelance";

interface BuildFreelanceJobVacancySchemaOptions {
	t: TFunction;
	/** Tipos com `requires_stack: true`, vindos de `/enum/freelance-job-type`. */
	stackJobTypes: ReadonlySet<string>;
}

/**
 * O mesmo schema serve para criar e editar: a edição manda o freela inteiro, e
 * `languages` sempre vai completo porque o PATCH substitui todas as linguagens.
 */
export function buildFreelanceJobVacancySchema({
	t,
	stackJobTypes,
}: BuildFreelanceJobVacancySchemaOptions) {
	return z
		.object({
			title: z
				.string()
				.trim()
				.min(1, t("freelance.form.errors.title_required"))
				.max(FREELANCE_TITLE_MAX_LENGTH, t("freelance.form.errors.title_max")),
			description: z
				.string()
				.trim()
				.min(1, t("freelance.form.errors.description_required")),
			job_type: z.nativeEnum(FreelanceJobTypeEnum, {
				errorMap: () => ({
					message: t("freelance.form.errors.job_type_required"),
				}),
			}),
			budget: z
				.number({
					required_error: t("freelance.form.errors.budget_required"),
					invalid_type_error: t("freelance.form.errors.budget_required"),
				})
				.gt(0, t("freelance.form.errors.budget_min"))
				.max(FREELANCE_BUDGET_MAX, t("freelance.form.errors.budget_max")),
			seniority_level: z.nativeEnum(SeniorityLevelEnum, {
				errorMap: () => ({
					message: t("freelance.form.errors.seniority_level_required"),
				}),
			}),
			specialties: z
				.array(z.nativeEnum(DevSpecialtyEnum))
				.min(1, t("freelance.form.errors.specialties_required")),
			languages: z.array(
				z.object({
					language_id: z.string().min(1),
					language_level: z.nativeEnum(HardSkillLevelsEnum, {
						errorMap: () => ({
							message: t("freelance.form.errors.language_level_required"),
						}),
					}),
				}),
			),
		})
		.superRefine((values, ctx) => {
			if (stackJobTypes.has(values.job_type) && values.languages.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["languages"],
					message: t("freelance.form.errors.languages_required"),
				});
			}

			const seen = new Set<string>();

			values.languages.forEach((language, index) => {
				if (seen.has(language.language_id)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ["languages", index, "language_id"],
						message: t("freelance.form.errors.language_duplicated"),
					});
				}

				seen.add(language.language_id);
			});
		});
}

export type IFreelanceJobVacancySchema = z.infer<
	ReturnType<typeof buildFreelanceJobVacancySchema>
>;
