import z from "zod/v3";
import {
	ContractType,
	DevSpecialtyEnum,
	EmploymentType,
	HardSkillLevelsEnum,
	SeniorityLevelEnum,
} from "@/api/generated/models";

// `current_*_id` guarda o vínculo já existente na vaga, permitindo que a API
// saiba se a linguagem/soft skill está sendo trocada ou adicionada
export const UpdateJobVacancySchema = z.object({
	title: z
		.string()
		.min(3, "The title must have at least 3 characters")
		.max(255, "The maximum title size is 255 characters"),
	description: z
		.string()
		.min(10, "The description must have at least 10 characters"),
	employment_type: z.nativeEnum(EmploymentType, {
		required_error: "Select an employment type",
	}),
	benefits: z.array(z.string().min(1)).min(1, "Add at least one benefit"),
	estimated_salary: z
		.number({ invalid_type_error: "Inform the estimated salary" })
		.positive("The estimated salary must be greater than zero"),
	contract_type: z.nativeEnum(ContractType, {
		required_error: "Select a contract type",
	}),
	seniority_level: z.nativeEnum(SeniorityLevelEnum, {
		required_error: "Select a seniority level",
	}),
	specialties: z.nativeEnum(DevSpecialtyEnum, {
		required_error: "Select one specialty",
	}),
	languages: z
		.array(
			z.object({
				current_languages_id: z.string().optional(),
				languages_id: z.string().min(1),
				language_level: z.nativeEnum(HardSkillLevelsEnum),
			}),
		)
		.min(1, "Add at least one required language"),
	soft_skills: z
		.array(
			z.object({
				current_soft_skills_id: z.string().optional(),
				soft_skills_id: z.string().min(1),
			}),
		)
		.min(1, "Add at least one soft skill"),
});

export type IUpdateJobVacancySchema = z.infer<typeof UpdateJobVacancySchema>;
