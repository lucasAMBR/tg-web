import z from "zod/v3";
import type {
	AnswerDevLanguageAssessmentRequestAnswersItem,
	LanguageAssessmentQuestionResource,
	LanguageAssessmentResource,
} from "@/api/generated/models";
import { LanguageAssessmentQuestionTypeEnum } from "@/api/generated/models";
import { getOrderedQuestions } from "@/types/language-assessment";

/**
 * O formulário guarda os dois formatos de resposta em todas as perguntas e o
 * envio descarta o que não faz sentido para o tipo.
 */
const DevLanguageAnswerSchema = z.object({
	question_id: z.string(),
	response: z
		.string()
		.max(1000, "A resposta pode ter no máximo 1000 caracteres"),
	option_ids: z.array(z.string()),
});

/** Em prova não existe pergunta obrigatória: a que ficar em branco vale zero. */
export const AnswerLanguageAssessmentSchema = z.object({
	answers: z.array(DevLanguageAnswerSchema),
});

export type IAnswerLanguageAssessmentSchema = z.infer<
	typeof AnswerLanguageAssessmentSchema
>;

type AnswerValues = IAnswerLanguageAssessmentSchema["answers"][number];

function isTextQuestion(question: LanguageAssessmentQuestionResource): boolean {
	return question.type === LanguageAssessmentQuestionTypeEnum.text;
}

function answerIsBlank(
	question: LanguageAssessmentQuestionResource,
	answer?: AnswerValues,
): boolean {
	if (!answer) return true;

	return isTextQuestion(question)
		? answer.response.trim() === ""
		: answer.option_ids.length === 0;
}

/** Uma entrada por pergunta, na ordem definida pela empresa. */
export function buildAnswerDefaultValues(
	assessment?: LanguageAssessmentResource,
): IAnswerLanguageAssessmentSchema {
	return {
		answers: getOrderedQuestions(assessment).map((question) => ({
			question_id: question.id,
			response: "",
			option_ids: [],
		})),
	};
}

/** Perguntas que o dev vai entregar em branco, para o aviso antes do envio. */
export function countBlankAnswers(
	data: IAnswerLanguageAssessmentSchema,
	questions: LanguageAssessmentQuestionResource[],
): number {
	return questions.filter((question) =>
		answerIsBlank(
			question,
			data.answers.find((answer) => answer.question_id === question.id),
		),
	).length;
}

/**
 * Payload do envio: cada resposta leva só o formato do seu tipo. As perguntas em
 * branco vão vazias — a API as ignora, e assim a lista nunca sai vazia (ela
 * exige no mínimo um item).
 */
export function toAnswerPayload(
	data: IAnswerLanguageAssessmentSchema,
	questions: LanguageAssessmentQuestionResource[],
): AnswerDevLanguageAssessmentRequestAnswersItem[] {
	return data.answers.flatMap<AnswerDevLanguageAssessmentRequestAnswersItem>(
		(answer) => {
			const question = questions.find((item) => item.id === answer.question_id);

			if (!question) return [];

			return isTextQuestion(question)
				? [
						{
							question_id: answer.question_id,
							response: answer.response.trim() || null,
						},
					]
				: [{ question_id: answer.question_id, option_ids: answer.option_ids }];
		},
	);
}
