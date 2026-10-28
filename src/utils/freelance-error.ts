import type { AxiosError } from "axios";
import {
	FREELANCE_ANALYSIS_MAX_RETRIES,
	FREELANCE_ANALYSIS_RETRY_DELAY,
} from "@/types/freelance";

/**
 * Envelope de erro da API: `{ error, message, data }`. No 422 de validação o
 * `data` traz `{ campo: [mensagens] }`, com chaves que podem ser aninhadas
 * (`languages.0.language_id`, `attachments.1`). Nos erros de regra de negócio
 * ele vem vazio.
 */
interface FreelanceErrorBody {
	message?: string;
	data?: Record<string, string[]> | string | unknown[] | null;
}

/**
 * Onde a ação aconteceu. O mesmo status quer dizer coisas diferentes em cada
 * tela, e o guia do módulo manda decidir pelo status mais o contexto, nunca
 * pelo texto de `message`, que está em inglês e pode mudar.
 */
export type FreelanceErrorContext =
	| "vacancy"
	| "proposal"
	| "accept"
	| "invite"
	| "complete"
	| "feed";

/** Campos que identificam o recurso da rota, não algo que o usuário digitou. */
const RESOURCE_FIELDS = ["id", "freelance_job_vacancy_id"];

function asAxiosError(error: unknown): AxiosError<FreelanceErrorBody> | null {
	if (typeof error !== "object" || error === null) return null;

	if (!("isAxiosError" in error)) return null;

	return error as AxiosError<FreelanceErrorBody>;
}

export function freelanceErrorStatus(error: unknown): number | undefined {
	return asAxiosError(error)?.response?.status;
}

function validationData(error: unknown): Record<string, string[]> | null {
	const response = asAxiosError(error)?.response;

	if (response?.status !== 422) return null;

	const data = response.data?.data;

	if (!data || Array.isArray(data) || typeof data !== "object") return null;

	return data;
}

/**
 * Erros de validação por campo, para mostrar embaixo do campo do formulário.
 * Os campos de identificação do recurso ficam de fora: viram "freela não
 * disponível".
 */
export function freelanceFieldErrors(
	error: unknown,
): Record<string, string[]> | null {
	const data = validationData(error);

	if (!data) return null;

	const fields = Object.entries(data).filter(
		([field]) => !RESOURCE_FIELDS.includes(field),
	);

	return fields.length > 0 ? Object.fromEntries(fields) : null;
}

/** O freela foi removido: a API responde 422 apontando o id da rota. */
export function isFreelanceUnavailable(error: unknown): boolean {
	const data = validationData(error);

	if (!data) return false;

	return Object.keys(data).some((field) => RESOURCE_FIELDS.includes(field));
}

/**
 * 422 de regra de negócio, sem erros por campo: o freela ou o orçamento mudou
 * de estado (foi contratado, concluído, já tem orçamento do dev...). A tela
 * recarrega o freela para mostrar o estado novo.
 */
export function isFreelanceStateConflict(error: unknown): boolean {
	if (freelanceErrorStatus(error) !== 422) return false;

	return validationData(error) === null;
}

/**
 * 409: o embedding ainda não foi gerado. Na recomendação de devs e no ranking
 * é o do freela; nos freelas recomendados para o dev, o do perfil dele.
 */
export function isFreelanceAnalysisPending(error: unknown): boolean {
	return freelanceErrorStatus(error) === 409;
}

const CONFLICT_MESSAGE_KEYS: Record<FreelanceErrorContext, string> = {
	vacancy: "freelance.errors.not_open",
	proposal: "freelance.errors.proposal_conflict",
	accept: "freelance.errors.accept_conflict",
	invite: "freelance.errors.invite_conflict",
	complete: "freelance.errors.not_in_progress",
	feed: "freelance.errors.feed_closed",
};

/**
 * Chave de tradução da mensagem a mostrar para o usuário. Erros de campo não
 * passam por aqui: eles vão embaixo do campo, via `freelanceFieldErrors`.
 */
export function freelanceErrorMessageKey(
	error: unknown,
	context: FreelanceErrorContext,
): string {
	if (isFreelanceUnavailable(error)) return "freelance.errors.unavailable";

	const status = freelanceErrorStatus(error);

	if (status === 422) return CONFLICT_MESSAGE_KEYS[context];

	if (status === 403) return "freelance.errors.forbidden";

	return "freelance.errors.unexpected";
}

/**
 * Opções de consulta das rotas que dependem do embedding do freela (devs
 * recomendados e ranking): no 409 tenta de novo a cada 20 s, no máximo 5
 * vezes. Os outros erros não se resolvem tentando de novo.
 */
export const freelanceAnalysisQueryOptions = {
	retry: (failureCount: number, error: unknown) =>
		isFreelanceAnalysisPending(error) &&
		failureCount < FREELANCE_ANALYSIS_MAX_RETRIES,
	retryDelay: FREELANCE_ANALYSIS_RETRY_DELAY,
};
