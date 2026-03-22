import z from "zod/v3";

export const CreateDevProfileSchema = z.object({
    cpf: z.string()
        .min(11, "CPF must have at least 11 characters!")
        .max(14, "CPF have a maximum lenght of 14 characters!"),
    name: z.string()
        .min(3, "The name must have at least 3 characters")
        .max(255, "Name have a maximum lenght of 255 characters!"),
    bio: z.string().min(10, "Bio must have at least 10 characters")
        .max(510, "Name have a maximum lenght of 510 characters!"),
    phone: z.string()
        .regex(/^\+55[1-9]{2}9[0-9]{8}$/, "The phone must have the following format: +5535999999999"),
    open_to_relocation: z.boolean(),
    open_to_work: z.boolean(),
birthdate: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (esperado: YYYY-MM-DD)")
        .refine((dateStr) => {
            const date = new Date(dateStr);
            return !isNaN(date.getTime());
        }, {
            message: "Data inválida"
        })
        .refine((dateStr) => {
            const date = new Date(dateStr);
            return date <= new Date();
        }, {
            message: "A data de nascimento não pode ser no futuro!"
        }),

    seniority_level: z.string()
});

export type ICreateDevProfileSchema = z.infer<typeof CreateDevProfileSchema>;

