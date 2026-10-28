import z from "zod/v3";

export const SubmitProficiencyTestSchema = z.object({
	chunks: z
		.array(
			z.object({
				time_taken: z.number().int().min(0),
				alt_tabs: z.number().int().min(0),
				responses: z
					.array(
						z.object({
							question_id: z.string().min(1),
							response_id: z.string().min(1),
						}),
					)
					.min(1),
			}),
		)
		.min(1),
});

export type ISubmitProficiencyTestSchema = z.infer<
	typeof SubmitProficiencyTestSchema
>;
