import z from "zod/v3";

export const SoftSkillItemSchema = z.object({
    soft_skill_id: z.string().uuid(),
    soft_skill_level_response_id: z.string().uuid(),
});

export const RegisterDevSoftSkillsSchema = z.object({
  soft_skills: z.array(SoftSkillItemSchema).min(1),
});

export type IRegisterDevSoftSkillSchema = z.infer<typeof RegisterDevSoftSkillsSchema>