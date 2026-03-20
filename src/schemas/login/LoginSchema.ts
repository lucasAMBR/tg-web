import z from "zod/v3";

export const LoginSchema = z.object({
    email: z.string(),
    password: z.string()
})

export type ILoginSchema = z.infer<typeof LoginSchema>