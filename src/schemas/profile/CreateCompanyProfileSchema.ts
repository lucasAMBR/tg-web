import { isoDateOnlyField } from "@/schemas/helpers/iso-date-only-field";
import z from "zod/v3";

export const CreateCompanyProfileSchema = z.object({
    name: z
        .string()
        .min(3, "The name must have at least 3 characters")
        .max(255, "Name have a maximum lenght of 255 characters!"),
    bio: z
        .string()
        .min(10, "Bio must have at least 10 characters")
        .max(510, "Name have a maximum lenght of 510 characters!"),
    phone: z
        .string()
        .regex(
            /^\+55[1-9]{2}9[0-9]{8}$/,
            "The phone must have the following format: +5535999999999",
        ),
    cnpj: z
        .string()
        .min(14, "CNPJ must have at least 14 characters!")
        .max(18, "CNPJ must have a maximum length of 18 characters!"),
    founding_date: isoDateOnlyField(),
    operational_segment: z
            .string()
})

export type ICreateCompanyProfileSchema = z.infer<typeof CreateCompanyProfileSchema>