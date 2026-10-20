import type { AxiosError } from "axios";

/**
 * Envelope de erro da API: `{ error, message, data }`. Em 422 de validação o
 * `data` vem como um mapa de campo para mensagens; nos erros de regra de
 * negócio ele vem vazio.
 */
interface SocialErrorBody {
	message?: string;
	data?: Record<string, string[]> | string | unknown[] | null;
}

/**
 * Onde a ação aconteceu. O mesmo status significa coisas diferentes em cada
 * tela, e o doc da feature manda decidir pelo status mais o contexto — nunca
 * pelo texto de `message`, que está em inglês e pode mudar.
 */
export type SocialErrorContext = "post" | "comment" | "post-images";

/** Campos que identificam o recurso da rota, não algo que o usuário digitou. */
const RESOURCE_FIELDS = ["id", "post_id", "parent_id", "image_id"];

function asAxiosError(error: unknown): AxiosError<SocialErrorBody> | null {
	if (typeof error !== "object" || error === null) return null;

	if (!("isAxiosError" in error)) return null;

	return error as AxiosError<SocialErrorBody>;
}

export function socialErrorStatus(error: unknown): number | undefined {
	return asAxiosError(error)?.response?.status;
}

/**
 * Erros de validação por campo, para mostrar embaixo do campo correspondente.
 * Só devolve o que o usuário pode corrigir: os campos de identificação do
 * recurso ficam de fora porque viram tela de indisponível.
 */
export function socialFieldErrors(
	error: unknown,
): Record<string, string[]> | null {
	const response = asAxiosError(error)?.response;

	if (response?.status !== 422) return null;

	const data = response.data?.data;

	if (!data || Array.isArray(data) || typeof data !== "object") return null;

	const fields = Object.entries(data).filter(
		([field]) => !RESOURCE_FIELDS.includes(field),
	);

	return fields.length > 0 ? Object.fromEntries(fields) : null;
}

/**
 * O recurso da rota não existe mais: a postagem foi excluída (ou a postagem do
 * comentário foi). A API responde 422 apontando o erro no campo de id.
 */
export function isResourceUnavailable(error: unknown): boolean {
	const response = asAxiosError(error)?.response;

	if (response?.status !== 422) return false;

	const data = response.data?.data;

	if (!data || Array.isArray(data) || typeof data !== "object") return false;

	return Object.keys(data).some((field) => RESOURCE_FIELDS.includes(field));
}

/**
 * Ação negada em comentário já removido (responder, curtir, editar, remover).
 * Vem como 422 de regra de negócio, sem erros por campo.
 */
export function isRemovedCommentError(error: unknown): boolean {
	const response = asAxiosError(error)?.response;

	if (response?.status !== 422) return false;

	return socialFieldErrors(error) === null && !isResourceUnavailable(error);
}

/** O usuário tentou alterar algo que não é dele. */
export function isNotOwnerError(error: unknown): boolean {
	return socialErrorStatus(error) === 403;
}

/**
 * Sessão expirada. A API responde 400 com `data: "Unauthenticated."` em vez de
 * 401, então o status sozinho não identifica o caso.
 */
export function isSessionExpiredError(error: unknown): boolean {
	const response = asAxiosError(error)?.response;

	if (response?.status !== 400) return false;

	return response.data?.data === "Unauthenticated.";
}

/**
 * Chave de tradução da mensagem a mostrar para o usuário. Erros de campo não
 * passam por aqui: eles vão embaixo do campo, via `socialFieldErrors`.
 */
export function socialErrorMessageKey(
	error: unknown,
	context: SocialErrorContext,
): string {
	const status = socialErrorStatus(error);

	if (isResourceUnavailable(error)) {
		return context === "comment"
			? "social.errors.thread_unavailable"
			: "social.errors.post_unavailable";
	}

	if (status === 422) {
		if (context === "comment") return "social.errors.comment_removed";
		if (context === "post-images") return "social.errors.too_many_images";

		return "social.errors.post_unavailable";
	}

	if (status === 403) return "social.errors.not_owner";

	if (status === 404) return "social.errors.image_not_found";

	return "social.errors.unexpected";
}
