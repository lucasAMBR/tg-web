import z from "zod/v3";
import { ScreeningQuestionTypeEnum } from "@/api/generated/models";
import { isIsoDateOnlyOnOrBeforeToday } from "@/utils/date-only";

/** Mínimo de alternativas exigido pela API nas perguntas de escolha. */
export const MIN_QUESTION_OPTIONS = 2;

const ScreeningQuestionOptionSchema = z.object({
	// Presente só nas alternativas que já existem: sem `id` a API cria uma nova
	id: z.string().optional(),
	option: z
		.string()
		.trim()
		.min(1, "A alternativa é obrigatória")
		.max(500, "A alternativa pode ter no máximo 500 caracteres"),
});

const ScreeningQuestionSchema = z
	.object({
		// Mesma regra das alternativas: sem `id` a pergunta é criada
		id: z.string().optional(),
		question: z
			.string()
			.trim()
			.min(1, "A pergunta é obrigatória")
			.max(1000, "A pergunta pode ter no máximo 1000 caracteres"),
		type: z.nativeEnum(ScreeningQuestionTypeEnum),
		is_required: z.boolean(),
		options: z.array(ScreeningQuestionOptionSchema),
	})
	// As dissertativas não têm alternativas e as de escolha exigem no mínimo duas
	.superRefine((question, ctx) => {
		if (question.type === ScreeningQuestionTypeEnum.essay) return;

		if (question.options.length < MIN_QUESTION_OPTIONS) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["options"],
				message: `As perguntas de escolha precisam de no mínimo ${MIN_QUESTION_OPTIONS} alternativas`,
			});
		}
	});

export const ScreeningQuestionnaireSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "O título é obrigatório")
		.max(255, "O título pode ter no máximo 255 caracteres"),
	description: z
		.string()
		.trim()
		.max(2000, "A descrição pode ter no máximo 2000 caracteres")
		.optional(),
	// A API só usa o prazo no cadastro, quando a vaga já está aguardando o questionário
	due_date: z
		.string()
		.optional()
		.refine((dueDate) => !dueDate || !isIsoDateOnlyOnOrBeforeToday(dueDate), {
			message: "O prazo de resposta precisa ser uma data futura",
		}),
	questions: z
		.array(ScreeningQuestionSchema)
		.min(1, "O questionário precisa de no mínimo uma pergunta"),
});

export type IScreeningQuestionnaireSchema = z.infer<
	typeof ScreeningQuestionnaireSchema
>;

export type IScreeningQuestionSchema =
	IScreeningQuestionnaireSchema["questions"][number];

/** Pergunta em branco usada ao adicionar uma linha no formulário. */
export function emptyQuestion(): IScreeningQuestionSchema {
	return {
		question: "",
		type: ScreeningQuestionTypeEnum.essay,
		is_required: true,
		options: [],
	};
}
