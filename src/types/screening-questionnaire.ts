import type {
	DevJobVacancyResource,
	DevScreeningAnswerResource,
	DevScreeningQuestionnaireResource,
	ScreeningQuestionnaireResource,
	ScreeningQuestionOptionResource,
	ScreeningQuestionResource,
} from "@/api/generated/models";
import { ScreeningQuestionTypeEnum } from "@/api/generated/models";

/**
 * O contrato tipa `status` como enum, mas o recurso chega sem as relações quando
 * a candidatura ainda não está na etapa de perguntas de triagem.
 */
export type ScreeningQuestionnaireStatus = "pending" | "answered";

/**
 * Preenchimento do questionário na candidatura. A API só carrega a relação na
 * etapa `screening_questions`, então vem ausente nas demais.
 */
export function getScreeningQuestionnaire(
	apply: DevJobVacancyResource,
): DevScreeningQuestionnaireResource | undefined {
	return apply.screening_questionnaire ?? undefined;
}

export function screeningWasAnswered(
	devQuestionnaire?: DevScreeningQuestionnaireResource,
): boolean {
	return devQuestionnaire?.status === "answered";
}

/** As perguntas de escolha guardam as alternativas; a dissertativa nunca tem. */
export function questionAcceptsOptions(
	type: ScreeningQuestionTypeEnum,
): boolean {
	return type !== ScreeningQuestionTypeEnum.essay;
}

export function questionAcceptsManyOptions(
	type: ScreeningQuestionTypeEnum,
): boolean {
	return type === ScreeningQuestionTypeEnum.multiple_choice;
}

/**
 * Perguntas na ordem definida pela empresa, independente do que a API devolveu.
 * O contrato gerado tipa `order` como string, mas a API manda o inteiro do banco.
 */
export function getOrderedQuestions(
	questionnaire?: ScreeningQuestionnaireResource,
): ScreeningQuestionResource[] {
	return [...(questionnaire?.questions ?? [])].sort(
		(question, nextQuestion) =>
			Number(question.order) - Number(nextQuestion.order),
	);
}

export function getOrderedOptions(
	question?: ScreeningQuestionResource,
): ScreeningQuestionOptionResource[] {
	return [...(question?.options ?? [])].sort(
		(option, nextOption) => Number(option.order) - Number(nextOption.order),
	);
}

/**
 * Texto traduzido do idioma atual, com o conteúdo original como fallback
 * enquanto a tradução não termina (`translation_status` ainda em `pending`).
 */
function translatedText(
	language: string,
	original: string | null | undefined,
	pt: string | null | undefined,
	en: string | null | undefined,
): string {
	const translated = language === "en" ? en : pt;

	return translated ?? original ?? "";
}

export function getQuestionnaireTitle(
	questionnaire: ScreeningQuestionnaireResource,
	language: string,
): string {
	return translatedText(
		language,
		questionnaire.title,
		questionnaire.title_pt,
		questionnaire.title_en,
	);
}

export function getQuestionnaireDescription(
	questionnaire: ScreeningQuestionnaireResource,
	language: string,
): string {
	return translatedText(
		language,
		questionnaire.description,
		questionnaire.description_pt,
		questionnaire.description_en,
	);
}

export function getQuestionText(
	question: ScreeningQuestionResource,
	language: string,
): string {
	return translatedText(
		language,
		question.question,
		question.question_pt,
		question.question_en,
	);
}

export function getOptionText(
	option: ScreeningQuestionOptionResource,
	language: string,
): string {
	return translatedText(
		language,
		option.option,
		option.option_pt,
		option.option_en,
	);
}

/** Resposta enviada para a pergunta, ausente nas opcionais que o dev pulou. */
export function findAnswer(
	answers: DevScreeningAnswerResource[] | undefined,
	questionId: string,
): DevScreeningAnswerResource | undefined {
	return answers?.find((answer) => answer.screening_question_id === questionId);
}
