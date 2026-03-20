import z from "zod/v3";


export const RegisterSchema = z.object({
    email: z.string().min(5, "The email field must have at least 5 characters!"),
    password: z.string().min(8, "The password must have at least 8 characters!"),
    role: z.string()
});

export type IRegisterSchema = z.infer<typeof RegisterSchema>;

