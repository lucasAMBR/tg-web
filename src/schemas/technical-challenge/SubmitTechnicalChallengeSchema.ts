import z from "zod/v3";
import { MAX_CHALLENGE_FILE_SIZE } from "./TechnicalChallengeSchema";

export const SubmitTechnicalChallengeSchema = z.object({
	repository_url: z
		.string()
		.trim()
		.min(1, "O repositório é obrigatório")
		.url("O repositório precisa ser uma url válida")
		.max(255, "O repositório pode ter no máximo 255 caracteres"),
	// Aceito só quando o desafio libera o envio do projeto compactado
	submission_file: z
		.instanceof(File)
		.optional()
		.refine((file) => !file || file.size <= MAX_CHALLENGE_FILE_SIZE, {
			message: "O arquivo pode ter no máximo 10MB",
		})
		.refine((file) => !file || file.name.toLowerCase().endsWith(".zip"), {
			message: "O arquivo precisa ser um .zip",
		}),
});

export type ISubmitTechnicalChallengeSchema = z.infer<
	typeof SubmitTechnicalChallengeSchema
>;
