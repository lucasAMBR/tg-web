import z from "zod/v3";
import { isIsoDateOnlyOnOrBeforeToday } from "@/utils/date-only";

/** Limite de upload aceito pela API, tanto no guia quanto na entrega. */
export const MAX_CHALLENGE_FILE_SIZE = 10 * 1024 * 1024;

export const GUIDE_DOCUMENT_EXTENSIONS = [
	".pdf",
	".doc",
	".docx",
	".md",
	".txt",
	".zip",
];

export const TechnicalChallengeSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "O título é obrigatório")
		.max(255, "O título pode ter no máximo 255 caracteres"),
	description: z
		.string()
		.trim()
		.min(1, "O enunciado é obrigatório")
		.max(5000, "O enunciado pode ter no máximo 5000 caracteres"),
	rules: z
		.string()
		.trim()
		.max(5000, "As regras podem ter no máximo 5000 caracteres")
		.optional(),
	// A API exige uma data futura (`after:today`)
	due_date: z
		.string()
		.min(1, "O prazo de entrega é obrigatório")
		.refine((dueDate) => !isIsoDateOnlyOnOrBeforeToday(dueDate), {
			message: "O prazo de entrega precisa ser uma data futura",
		}),
	accepts_zip_submission: z.boolean(),
	// Só no cadastro: depois o guia tem endpoints próprios
	guide_document: z
		.instanceof(File)
		.optional()
		.refine((file) => !file || file.size <= MAX_CHALLENGE_FILE_SIZE, {
			message: "O documento guia pode ter no máximo 10MB",
		}),
});

export type ITechnicalChallengeSchema = z.infer<
	typeof TechnicalChallengeSchema
>;
