import z from "zod/v3";

export const RegisterHardSkillSchema = z.object({
	language_id: z.string(),
	skill_level: z.string(),
});

export type IRegisterHardSkillSchema = z.infer<typeof RegisterHardSkillSchema>;
