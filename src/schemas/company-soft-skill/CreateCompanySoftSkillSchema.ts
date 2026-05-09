import z from "zod/v3";

export const CreateCompanySoftSkillSchema = z.object({
    soft_skills: z.string().array()
})

export type ICreateCompanySoftSkillSchema = z.infer<typeof CreateCompanySoftSkillSchema>