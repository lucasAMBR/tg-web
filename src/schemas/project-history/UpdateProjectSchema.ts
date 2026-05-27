import z from "zod/v3";

const optionalProjectUrlNullable = (field: string) =>
	z
		.string()
		.default("")
		.transform((s) => {
			const t = s.trim();
			return t === "" ? null : t;
		})
		.pipe(
			z.union([
				z.null(),
				z.string().url({ message: `${field} must be a valid URL` }),
			]),
		);

export const UpdateProjectSchema = z.object({
	title: z
		.string()
		.min(3, "The title must have at least 3 characters")
		.max(255, "The title have a limit of 255 characters"),
	description: z.string(),
	languages: z.string().array(),
	prod_url: optionalProjectUrlNullable("Production URL"),
	github_url: optionalProjectUrlNullable("GitHub URL"),
});

export type IUpdateProjectSchema = z.infer<typeof UpdateProjectSchema>;
