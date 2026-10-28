import z from "zod/v3";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const optionalProjectUrlOptional = (field: string) =>
	z
		.string()
		.default("")
		.transform((s) => {
			const t = s.trim();
			return t === "" ? undefined : t;
		})
		.pipe(
			z.union([
				z.undefined(),
				z.string().url({ message: `${field} must be a valid URL` }),
			]),
		);

export const CreateProjectSchema = z.object({
	title: z
		.string()
		.min(3, "The title must have at least 3 characters")
		.max(255, "The maximum title size is 255 characters"),
	description: z.string(),
	languages: z.string().array(),
	prod_url: optionalProjectUrlOptional("Production URL"),
	github_url: optionalProjectUrlOptional("GitHub URL"),
	images: z
		.array(z.instanceof(File))
		.max(6, "Máximo de 6 imagens")
		.refine(
			(files) => files.every((file) => file.size <= MAX_FILE_SIZE),
			"Each image have a maximum size of 5MB",
		),
});

export type ICreateProjectSchema = z.infer<typeof CreateProjectSchema>;
