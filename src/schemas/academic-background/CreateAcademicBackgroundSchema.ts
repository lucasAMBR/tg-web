import z from "zod/v3";

const MAX_SIZE = 10 * 1024 * 1024;

export const CreateAcademicBackgroundSchema = z.object({
	degree: z
		.string()
		.min(3, "The degree name must have at least 3 characters")
		.max(255, "The max lenght of degree name is 255 characters"),
	degree_level: z
		.string()
		.min(3, "The degree level must have at least 3 characters")
		.max(255, "The max lenght of degree level is 255 characters"),
	institution: z
		.string()
		.min(3, "The institution name must have at least 3 characters")
		.max(255, "The max lenght of institution name is 255 characters"),
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

export type ICreateAcademicBackgroundSchema = z.infer<
	typeof CreateAcademicBackgroundSchema
>;
