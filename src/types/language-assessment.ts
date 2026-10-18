import type {
	DevJobVacancyResource,
	DevLanguageAssessmentAnswerResource,
	DevLanguageAssessmentResource,
	LanguageAssessmentQuestionOptionResource,
	LanguageAssessmentQuestionResource,
	LanguageAssessmentResource,
} from "@/api/generated/models";
import { LanguageAssessmentQuestionTypeEnum } from "@/api/generated/models";

/**
 * O contrato gerado tipa os números e os booleanos da prova como `string`, mas a
 * API responde com os valores do banco (`weight`, `score`, `is_correct`...). Os
 * helpers abaixo aceitam as duas formas.
 */
function toNumber(value: unknown): number | undefined {
	if (value === null || value === undefined || value === "") return undefined;

	const parsed = Number(value);

	return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value: unknown): boolean | undefined {
	if (value === null || value === undefined || value === "") return undefined;

	return value === true || value === 1 || value === "1" || value === "true";
}

/**
 * Prova do candidato na candidatura. A API carrega a relação na etapa
 * `language_assessment` (e na espera dela), então vem ausente nas demais.
 */
export function getLanguageAssessment(
	apply: DevJobVacancyResource,
): DevLanguageAssessmentResource | undefined {
	return apply.language_assessment ?? undefined;
}

export function assessmentWasAnswered(
	devAssessment?: DevLanguageAssessmentResource,
): boolean {
	return devAssessment?.status === "answered";
}

/** Já enviada a algum candidato: a prova trava para edição e remoção. */
export function assessmentWasSentToCandidates(
	assessment?: LanguageAssessmentResource,
): boolean {
	return (assessment?.dev_assessments_count ?? 0) > 0;
}

/** Nota da prova entregue, `undefined` enquanto o candidato não responde. */
export function getAssessmentScore(
	devAssessment: DevLanguageAssessmentResource,
): {
	score?: number;
	maxScore?: number;
} {
	return {
		score: toNumber(devAssessment.score),
		maxScore: toNumber(devAssessment.max_score),
	};
}

/**
 * Veredito contra a nota de corte. `null` quando a empresa não definiu corte —
 * a prova só pontua — ou enquanto ela não foi entregue.
 */
export function getAssessmentVerdict(
	devAssessment: DevLanguageAssessmentResource,
): boolean | null {
	return toBoolean(devAssessment.passed) ?? null;
}

/** Nota de corte da prova, ausente quando a empresa não definiu uma. */
export function getPassingScore(
	assessment?: LanguageAssessmentResource,
): number | undefined {
	return toNumber(assessment?.passing_score);
}

/** Quanto a pergunta vale. A API usa peso `1` quando a empresa não informa. */
export function getQuestionWeight(
	question: LanguageAssessmentQuestionResource,
): number {
	return toNumber(question.weight) ?? 1;
}

/** Soma dos pesos de todas as perguntas, inclusive as que ficarem em branco. */
export function getMaxScore(assessment?: LanguageAssessmentResource): number {
	return (
		assessment?.max_score ??
		(assessment?.questions ?? []).reduce(
			(total, question) => total + getQuestionWeight(question),
			0,
		)
	);
}

/** Itens na ordem definida pela empresa, independente do que a API devolveu. */
export function sortByOrder<T extends { order: unknown }>(items: T[]): T[] {
	return [...items].sort(
		(item, nextItem) =>
			(toNumber(item.order) ?? 0) - (toNumber(nextItem.order) ?? 0),
	);
}

export function getOrderedQuestions(
	assessment?: LanguageAssessmentResource,
): LanguageAssessmentQuestionResource[] {
	return sortByOrder(assessment?.questions ?? []);
}

export function getOrderedOptions(
	question?: LanguageAssessmentQuestionResource,
): LanguageAssessmentQuestionOptionResource[] {
	return sortByOrder(question?.options ?? []);
}

export function getQuestionType(
	question: LanguageAssessmentQuestionResource,
): LanguageAssessmentQuestionTypeEnum {
	return question.type as LanguageAssessmentQuestionTypeEnum;
}

/** As perguntas de escolha guardam as alternativas; a escrita nunca tem. */
export function questionAcceptsOptions(
	type: LanguageAssessmentQuestionTypeEnum,
): boolean {
	return type !== LanguageAssessmentQuestionTypeEnum.text;
}

/**
 * Se a alternativa é a certa. O gabarito só existe no payload da empresa e no do
 * dev que já entregou a prova — antes disso o campo nem vem, e a alternativa
 * não pode ser tratada como errada.
 */
export function optionIsCorrect(
	option: LanguageAssessmentQuestionOptionResource,
): boolean {
	return toBoolean(option.is_correct) === true;
}

/** Respostas aceitas da pergunta escrita, com a mesma ressalva do gabarito. */
export function getExpectedAnswers(
	question: LanguageAssessmentQuestionResource,
): string[] {
	return question.expected_answers ?? [];
}

/** Resposta entregue para a pergunta, ausente nas que o dev deixou em branco. */
export function findAnswer(
	answers: DevLanguageAssessmentAnswerResource[] | undefined,
	questionId: string,
): DevLanguageAssessmentAnswerResource | undefined {
	return answers?.find(
		(answer) => answer.language_assessment_question_id === questionId,
	);
}

export function answerIsCorrect(
	answer?: DevLanguageAssessmentAnswerResource,
): boolean {
	return toBoolean(answer?.is_correct) === true;
}

export function getEarnedScore(
	answer?: DevLanguageAssessmentAnswerResource,
): number {
	return toNumber(answer?.earned_score) ?? 0;
}
