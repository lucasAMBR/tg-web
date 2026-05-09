import z from "zod/v3";

export const CreateCompanyProjectSchema = z.object({
    title: z
        .string()
        .min(3, "The title must have at least 3 characters")
        .max(255, "The maximum title size is 255 characters"),
    description: z.string(),
    languages: z.string().array(),
});

export type ICreateCompanyProjectSchema = z.infer<typeof CreateCompanyProjectSchema>