import z from "zod/v3";
import { LanguageAssessmentQuestionTypeEnum } from "@/api/generated/models";
import { isIsoDateOnlyOnOrBeforeToday } from "@/utils/date-only";

/** Mínimo de alternativas exigido pela API nas perguntas de escolha. */
export const MIN_QUESTION_OPTIONS = 2;

/** Peso usado pela API quando a empresa não informa nenhum. */
export const DEFAULT_QUESTION_WEIGHT = 1;

const LanguageAssessmentOptionSchema = z.object({
	// Presente só nas alternativas que já existem: sem `id` a API cria uma nova
	id: z.string().optional(),
	option: z
		.string()
		.trim()
		.min(1, "A alternativa é obrigatória")
		.max(500, "A alternativa pode ter no máximo 500 caracteres"),
	is_correct: z.boolean(),
});

/** Objeto em vez de string pura porque o `useFieldArray` só trabalha com objetos. */
const ExpectedAnswerSchema = z.object({
	value: z
		.string()
		.trim()
		.min(1, "A resposta aceita não pode ficar em branco")
		.max(255, "A resposta aceita pode ter no máximo 255 caracteres"),
});

const LanguageAssessmentQuestionSchema = z
	.object({
		// Mesma regra das alternativas: sem `id` a pergunta é criada
		id: z.string().optional(),
		question: z
			.string()
			.trim()
			.min(1, "A pergunta é obrigatória")
			.max(1000, "A pergunta pode ter no máximo 1000 caracteres"),
		type: z.nativeEnum(LanguageAssessmentQuestionTypeEnum),
		weight: z.coerce
			.number({ invalid_type_error: "O peso precisa ser um número" })
			.int("O peso precisa ser um número inteiro")
			.min(1, "O peso mínimo é 1")
			.max(100, "O peso máximo é 100"),
		options: z.array(LanguageAssessmentOptionSchema),
		expected_answers: z.array(ExpectedAnswerSchema),
	})
	// As mesmas regras de gabarito que a API valida no cadastro
	.superRefine((question, ctx) => {
		if (question.type === LanguageAssessmentQuestionTypeEnum.text) {
			if (question.expected_answers.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["expected_answers"],
					message:
						"A pergunta escrita precisa de pelo menos uma resposta aceita",
				});
			}

			return;
		}

		if (question.options.length < MIN_QUESTION_OPTIONS) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["options"],
				message: `As perguntas de escolha precisam de no mínimo ${MIN_QUESTION_OPTIONS} alternativas`,
			});

			return;
		}

		const correctCount = question.options.filter(
			(option) => option.is_correct,
		).length;

		if (correctCount === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["options"],
				message: "Marque pelo menos uma alternativa como certa",
			});
		} else if (
			question.type === LanguageAssessmentQuestionTypeEnum.single_choice &&
			correctCount > 1
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["options"],
				message: "A escolha única aceita só uma alternativa certa",
			});
		} else if (correctCount === question.options.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["options"],
				message: "Nem todas as alternativas podem estar certas",
			});
		}
	});

export const LanguageAssessmentSchema = z
	.object({
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
		language: z
			.string()
			.trim()
			.min(1, "O idioma é obrigatório")
			.max(50, "O idioma pode ter no máximo 50 caracteres"),
		// O campo vazio significa "sem nota de corte", então ele é texto no
		// formulário e vira número no envio (`toPassingScore`)
		passing_score: z
			.string()
			.trim()
			.refine((value) => value === "" || /^\d+$/.test(value), {
				message: "A nota de corte precisa ser um número inteiro",
			})
			.refine((value) => value === "" || Number(value) >= 1, {
				message: "A nota de corte mínima é 1",
			}),
		// A API exige uma data futura (`after:today`)
		due_date: z
			.string()
			.min(1, "O prazo de resposta é obrigatório")
			.refine((dueDate) => !isIsoDateOnlyOnOrBeforeToday(dueDate), {
				message: "O prazo de resposta precisa ser uma data futura",
			}),
		questions: z
			.array(LanguageAssessmentQuestionSchema)
			.min(1, "A prova precisa de no mínimo uma pergunta"),
	})
	.superRefine((assessment, ctx) => {
		const passingScore = toPassingScore(assessment.passing_score);

		if (passingScore === null) return;

		const maxScore = sumWeights(assessment.questions);

		if (passingScore > maxScore) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["passing_score"],
				message: `A nota de corte não pode passar da nota máxima (${maxScore})`,
			});
		}
	});

export type ILanguageAssessmentSchema = z.infer<
	typeof LanguageAssessmentSchema
>;

export type ILanguageAssessmentQuestionSchema =
	ILanguageAssessmentSchema["questions"][number];

/** Nota de corte do envio: `null` sem corte, o que também limpa a de uma prova salva. */
export function toPassingScore(value: string): number | null {
	return value.trim() === "" ? null : Number(value);
}

/** Nota máxima da prova: a soma dos pesos, como a API calcula. */
export function sumWeights(questions: { weight?: unknown }[]): number {
	return questions.reduce((total, question) => {
		const weight = Number(question.weight);

		return total + (Number.isFinite(weight) && weight > 0 ? weight : 0);
	}, 0);
}

/** Pergunta em branco usada ao adicionar uma linha no formulário. */
export function emptyQuestion(): ILanguageAssessmentQuestionSchema {
	return {
		question: "",
		type: LanguageAssessmentQuestionTypeEnum.single_choice,
		weight: DEFAULT_QUESTION_WEIGHT,
		options: [
			{ option: "", is_correct: false },
			{ option: "", is_correct: false },
		],
		expected_answers: [],
	};
}
