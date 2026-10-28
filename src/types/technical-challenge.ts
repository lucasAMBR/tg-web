import type {
	DevJobVacancyResource,
	DevTechnicalChallengeResource,
	TechnicalChallengeResource,
} from "@/api/generated/models";

/** Arquivo único guardado pela API (documento guia ou zip da entrega). */
export interface ChallengeMedia {
	id: number;
	name: string;
	path: string;
	url: string;
	size: number;
}

/**
 * Entrega do desafio na candidatura. A API só carrega a relação quando a
 * candidatura entrou na etapa `technical_challenge`, então vem ausente nas demais.
 */
export function getDevTechnicalChallenge(
	apply: DevJobVacancyResource,
): DevTechnicalChallengeResource | undefined {
	return apply.technical_challenge ?? undefined;
}

export function challengeWasDelivered(
	devChallenge?: DevTechnicalChallengeResource,
): boolean {
	return devChallenge?.status === "delivered";
}

/**
 * O contrato tipa os arquivos como `anyOf`, então o acesso passa por aqui para
 * devolver `undefined` quando a empresa (ou o dev) não anexou nada.
 */
export function getChallengeMedia(media: unknown): ChallengeMedia | undefined {
	if (!media || typeof media !== "object") return undefined;

	const file = media as Partial<ChallengeMedia>;

	return file.url ? (file as ChallengeMedia) : undefined;
}

export function getGuideDocument(
	challenge?: TechnicalChallengeResource,
): ChallengeMedia | undefined {
	return getChallengeMedia(challenge?.guide_document);
}

export function getSubmissionFile(
	devChallenge?: DevTechnicalChallengeResource,
): ChallengeMedia | undefined {
	return getChallengeMedia(devChallenge?.submission_file);
}

/**
 * O contrato gera `accepts_zip_submission` como string, mas a API responde com
 * o booleano do banco — as duas formas precisam ser aceitas.
 */
export function acceptsZipSubmission(
	challenge?: TechnicalChallengeResource,
): boolean {
	const accepts = challenge?.accepts_zip_submission as unknown;

	return accepts === true || accepts === "1" || accepts === "true";
}

/** Já enviado a algum candidato: o enunciado trava para edição e remoção. */
export function challengeWasSentToCandidates(
	challenge?: TechnicalChallengeResource,
): boolean {
	return (challenge?.dev_challenges_count ?? 0) > 0;
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

export function getChallengeTitle(
	challenge: TechnicalChallengeResource,
	language: string,
): string {
	return translatedText(
		language,
		challenge.title,
		challenge.title_pt,
		challenge.title_en,
	);
}

export function getChallengeDescription(
	challenge: TechnicalChallengeResource,
	language: string,
): string {
	return translatedText(
		language,
		challenge.description,
		challenge.description_pt,
		challenge.description_en,
	);
}

export function getChallengeRules(
	challenge: TechnicalChallengeResource,
	language: string,
): string {
	return translatedText(
		language,
		challenge.rules,
		challenge.rules_pt,
		challenge.rules_en,
	);
}

/** Tamanho do arquivo em KB/MB, usado nos botões de download. */
export function formatFileSize(size?: number): string {
	if (!size) return "";

	const megabytes = size / 1024 / 1024;

	if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`;

	return `${Math.max(1, Math.round(size / 1024))} KB`;
}
