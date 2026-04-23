import z from "zod/v3";

export const RegisterAddressSchema = z.object({
	cep: z
		.string()
		.min(8, "The CEP minimum size is 8 numbers")
		.max(8, "The CEP maximum size is 8 numbers"),
	number: z
		.string()
		.min(1, "The number must have at least one digit")
		.max(6, "number have a limit of 6 digits"),
	complement: z
		.string()
		.max(255, "Complement maximo size is 255 characters")
		.optional(),
});

export type IRegisterAddressSchema = z.infer<typeof RegisterAddressSchema>;
