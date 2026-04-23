import z from "zod/v3";

export const UpdateProjectSchema = z.object({
	title: z
		.string()
		.min(3, "The title must have at least 3 characters")
		.max(255, "The title have a limit of 255 characters"),
	description: z.string(),
	languages: z.string().array(),
});

export type IUpdateProjectSchema = z.infer<typeof UpdateProjectSchema>;
