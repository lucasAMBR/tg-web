import z from "zod/v3";
import type {
	AnswerDevScreeningQuestionnaireRequestAnswersItem,
	ScreeningQuestionnaireResource,
	ScreeningQuestionResource,
} from "@/api/generated/models";
import { ScreeningQuestionTypeEnum } from "@/api/generated/models";
import { getOrderedQuestions } from "@/types/screening-questionnaire";

/**
 * O formulário guarda os dois formatos de resposta em todas as perguntas e o
 * envio descarta o que não faz sentido para o tipo — assim a troca de pergunta
 * não perde o que já foi preenchido.
 */
const DevScreeningAnswerSchema = z.object({
	question_id: z.string(),
	response: z
		.string()
		.max(5000, "A resposta pode ter no máximo 5000 caracteres"),
	option_ids: z.array(z.string()),
});

const BaseAnswerScreeningQuestionnaireSchema = z.object({
	answers: z.array(DevScreeningAnswerSchema),
});

export type IAnswerScreeningQuestionnaireSchema = z.infer<
	typeof BaseAnswerScreeningQuestionnaireSchema
>;

function questionWasAnswered(
	question: ScreeningQuestionResource,
	answer: IAnswerScreeningQuestionnaireSchema["answers"][number],
): boolean {
	return question.type === ScreeningQuestionTypeEnum.essay
		? answer.response.trim() !== ""
		: answer.option_ids.length > 0;
}

/**
 * As regras dependem do tipo de cada pergunta, então o schema é montado a partir
 * do questionário recebido — as mesmas validações que a API aplica no envio.
 */
export function buildAnswerScreeningQuestionnaireSchema(
	questions: ScreeningQuestionResource[],
) {
	return BaseAnswerScreeningQuestionnaireSchema.superRefine(
		({ answers }, ctx) => {
			answers.forEach((answer, index) => {
				const question = questions.find(
					(item) => item.id === answer.question_id,
				);

				if (!question) return;

				const isEssay = question.type === ScreeningQuestionTypeEnum.essay;

				if (!questionWasAnswered(question, answer)) {
					// As opcionais podem ficar em branco: a API só ignora a resposta
					if (question.is_required) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							path: ["answers", index, isEssay ? "response" : "option_ids"],
							message: "Esta pergunta é obrigatória",
						});
					}

					return;
				}

				if (
					question.type === ScreeningQuestionTypeEnum.single_choice &&
					answer.option_ids.length > 1
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ["answers", index, "option_ids"],
						message: "Esta pergunta aceita apenas uma alternativa",
					});
				}
			});
		},
	);
}

/** Uma entrada por pergunta, na ordem definida pela empresa. */
export function buildAnswerDefaultValues(
	questionnaire?: ScreeningQuestionnaireResource,
): IAnswerScreeningQuestionnaireSchema {
	return {
		answers: getOrderedQuestions(questionnaire).map((question) => ({
			question_id: question.id,
			response: "",
			option_ids: [],
		})),
	};
}

/**
 * Payload do envio: as perguntas em branco ficam de fora e cada resposta leva só
 * o formato do seu tipo, que é o que a API aceita.
 */
export function toAnswerPayload(
	data: IAnswerScreeningQuestionnaireSchema,
	questions: ScreeningQuestionResource[],
): AnswerDevScreeningQuestionnaireRequestAnswersItem[] {
	return data.answers.flatMap<AnswerDevScreeningQuestionnaireRequestAnswersItem>(
		(answer) => {
			const question = questions.find((item) => item.id === answer.question_id);

			if (!question || !questionWasAnswered(question, answer)) return [];

			return question.type === ScreeningQuestionTypeEnum.essay
				? [
						{
							question_id: answer.question_id,
							response: answer.response.trim(),
						},
					]
				: [{ question_id: answer.question_id, option_ids: answer.option_ids }];
		},
	);
}
