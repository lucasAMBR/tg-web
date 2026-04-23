import z from "zod/v3";

const MAX_SIZE = 10 * 1024 * 1024;

export const CreateCertificationSchema = z.object({
	name: z
		.string()
		.min(3, "The certification name must have at least 3 characters")
		.max(255, "The max lenght of certification name is 255"),
	provider: z
		.string()
		.min(3, "The certification provider name must have at least 3 characters")
		.max(255, "The max lenght of certification  provider name is 255"),
	certificate: z
		.instanceof(File)
		.optional()
		.refine((file) => !file || file.type === "application/pdf", {
			message: "The certificate must be a PDF file",
		})
		.refine((file) => !file || file.size <= MAX_SIZE, {
			message: "Certificate max size is 10 Mb",
		}),
});

export type ICreateCertificationSchema = z.infer<
	typeof CreateCertificationSchema
>;
