import z from "zod/v3";

export const LiveCodingExerciseSchema = z.object({
	statement: z
		.string()
		.trim()
		.min(1, "O enunciado é obrigatório")
		.max(5000, "O enunciado pode ter no máximo 5000 caracteres"),
	programming_language: z
		.string()
		.trim()
		.max(50, "A linguagem pode ter no máximo 50 caracteres"),
});

export type ILiveCodingExerciseSchema = z.infer<
	typeof LiveCodingExerciseSchema
>;
