import z from "zod/v3";
import {
	ContractType,
	DevSpecialtyEnum,
	EmploymentType,
	HardSkillLevelsEnum,
	SelectionProcessStageEnum,
	SeniorityLevelEnum,
} from "@/api/generated/models";

export const CreateJobVacancySchema = z.object({
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
	languages: z
		.array(
			z.object({
				languages_id: z.string().min(1),
				language_level: z.nativeEnum(HardSkillLevelsEnum),
			}),
		)
		.min(1, "Add at least one required language"),
	languages_desirable: z
		.array(z.string().min(1))
		.min(1, "Add at least one desirable language"),
	soft_skills: z
		.array(z.object({ soft_skills_id: z.string().min(1) }))
		.min(1, "Add at least one soft skill"),
	specialties: z.nativeEnum(DevSpecialtyEnum, {
		required_error: "Select one specialty",
	}),
	process_steps: z
		.array(
			z.object({
				step: z.nativeEnum(SelectionProcessStageEnum),
				order: z.number().min(1),
			}),
		)
		.min(1, "Add at least one selection process step"),
});

export type ICreateJobVacancySchema = z.infer<typeof CreateJobVacancySchema>;
