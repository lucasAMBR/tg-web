import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import type {
	CommentResource,
	PostResource,
	UserSimpleResource,
} from "@/api/generated/models";

export { dedupeById } from "@/utils/dedupe-by-id";

/** Postagens por página em `GET /post` e `GET /post/favorites`. */
export const POSTS_PER_PAGE = 10;

/** Comentários raiz por página em `GET /comment`. */
export const COMMENTS_PER_PAGE = 10;

/** Respostas por página em `GET /comment/{id}/replies`. */
export const REPLIES_PER_PAGE = 10;

/** Limite do `content` no `StorePostRequest`. */
export const POST_CONTENT_MAX_LENGTH = 5000;

/** Limite do `content` no `StoreCommentRequest`. */
export const COMMENT_CONTENT_MAX_LENGTH = 2000;

/** Imagens por postagem, somando as que já existem (`PostService::MAX_IMAGES`). */
export const POST_MAX_IMAGES = 10;

/** Limite por arquivo na validação da API (`max:10000` em kilobytes). */
export const POST_IMAGE_MAX_BYTES = 10_000 * 1024;

/**
 * Teto do corpo da requisição. Acima disso as imagens vão em lotes por
 * `POST /post/{id}/images` em vez de tudo de uma vez.
 */
export const POST_REQUEST_MAX_BYTES = 12 * 1024 * 1024;

/** Formatos aceitos pela regra `mimes:jpeg,jpg,png,webp` da API. */
export const POST_IMAGE_ACCEPTED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
];

/**
 * Até onde o recuo da árvore cresce na tela. Mais fundo que isso o comentário
 * continua aninhado nos dados, só não ganha mais margem.
 */
export const COMMENT_MAX_INDENT_DEPTH = 3;

/** Prévia da subárvore que a API devolve (`CommentService::MAX_DEPTH`). */
export const COMMENT_PREVIEW_DEPTH = 3;

/** Postagem com o autor garantido, como vem nas listagens e no show. */
export type Post = PostResource & { author?: UserSimpleResource };

/** Mídia de postagem e de foto de perfil. */
export interface SocialMedia {
	id: number;
	original_url: string;
	thumb_url: string;
}

/**
 * O contrato gerado tipa `profile_pic` do autor como string, mas o campo carrega
 * o atributo cru do usuário: um objeto com as urls da mídia, ou `null`.
 */
export function getAuthorProfilePic(
	author: UserSimpleResource | null | undefined,
): string | undefined {
	const profilePic = author?.profile_pic as
		| Partial<SocialMedia>
		| string
		| null
		| undefined;

	if (!profilePic) return undefined;

	if (typeof profilePic === "string") return profilePic;

	return profilePic.thumb_url ?? profilePic.original_url ?? undefined;
}

/**
 * Rota do perfil do autor. Ausente quando o usuário ainda não criou perfil ou
 * quando a role não tem tela pública (admin) — nesses casos o nome vai sem link.
 */
export function getAuthorProfileHref(
	author: UserSimpleResource | null | undefined,
): string | undefined {
	if (!author?.profile_id || !author.name) return undefined;

	if (author.profile_type === "dev") return `/devs/${author.profile_id}`;
	if (author.profile_type === "company") {
		return `/companies/${author.profile_id}`;
	}
	if (author.profile_type === "client") {
		return `/clients/${author.profile_id}`;
	}

	return undefined;
}

/** Chave de tradução do rótulo do perfil do autor. */
export function getAuthorRoleLabelKey(
	author: UserSimpleResource | null | undefined,
): string | undefined {
	if (!author?.profile_type) return undefined;

	if (author.profile_type === "dev") return "role.dev";
	if (author.profile_type === "company") return "role.company";
	if (author.profile_type === "client") return "role.client";
	if (author.profile_type === "admin") return "role.admin";

	return undefined;
}

/** A API só mexe em `updated_at` quando o conteúdo é editado. */
export function wasEdited(item: {
	created_at?: string | null;
	updated_at?: string | null;
}): boolean {
	if (!item.created_at || !item.updated_at) return false;

	return item.created_at !== item.updated_at;
}

/** O que mostrar abaixo de um comentário, segundo a prévia que veio. */
export type CommentNodeAction = "none" | "load-more" | "continue-thread";

export function commentNodeAction(comment: CommentResource): CommentNodeAction {
	if (!comment.has_more_replies) return "none";

	// Prévia vazia com mais respostas significa que o corte de profundidade da
	// API aconteceu neste nó: daqui pra frente só a tela de thread continua.
	return (comment.replies?.length ?? 0) === 0 ? "continue-thread" : "load-more";
}

/** Quantas respostas ainda faltam carregar num nó. */
export function remainingRepliesCount(comment: CommentResource): number {
	return Math.max(comment.replies_count - (comment.replies?.length ?? 0), 0);
}

/**
 * Junta listas de comentários descartando ids repetidos. A página 1 de
 * `GET /comment/{id}/replies` repete as respostas que já vieram na prévia, e a
 * paginação das raízes pode repetir um item entre páginas quando vários são
 * criados no mesmo segundo.
 */
export function mergeCommentsById(
	current: CommentResource[],
	incoming: CommentResource[],
): CommentResource[] {
	const ids = new Set(current.map((comment) => comment.id));

	return [...current, ...incoming.filter((comment) => !ids.has(comment.id))];
}

/**
 * Troca um comentário em qualquer profundidade da árvore, sem mutar, para que
 * editar ou curtir não feche as respostas que já estavam abertas.
 */
export function updateCommentNode(
	comments: CommentResource[],
	id: string,
	patch: (comment: CommentResource) => CommentResource,
): CommentResource[] {
	return comments.map((comment) => {
		if (comment.id === id) return patch(comment);

		if (!comment.replies?.length) return comment;

		return {
			...comment,
			replies: updateCommentNode(comment.replies, id, patch),
		};
	});
}

/** Insere uma resposta no fim das respostas do pai, em qualquer profundidade. */
export function appendReplyToNode(
	comments: CommentResource[],
	parentId: string,
	reply: CommentResource,
): CommentResource[] {
	return updateCommentNode(comments, parentId, (parent) => {
		const replies = mergeCommentsById(parent.replies ?? [], [reply]);

		return {
			...parent,
			replies,
			replies_count: parent.replies_count + 1,
			has_more_replies: replies.length < parent.replies_count + 1,
		};
	});
}

/**
 * Formato de um comentário removido, como a API passa a devolvê-lo: a linha
 * continua na árvore, sem autor e sem conteúdo, e as respostas seguem visíveis.
 */
export function asRemovedComment(comment: CommentResource): CommentResource {
	return {
		...comment,
		content: "[removed]",
		is_removed: true,
		removed_at: new Date().toISOString(),
		author: null,
	};
}

/** Chave de tradução do erro de validação das imagens, ou `null` se tudo certo. */
export type PostImagesError = {
	key:
		| "social.errors.too_many_images"
		| "social.errors.invalid_image_type"
		| "social.errors.image_too_large";
} | null;

/**
 * As mesmas regras que a API aplica, checadas antes de subir o arquivo.
 * `existingCount` são as imagens que a postagem já tem.
 */
export function validatePostImages(
	files: File[],
	existingCount = 0,
): PostImagesError {
	if (existingCount + files.length > POST_MAX_IMAGES) {
		return { key: "social.errors.too_many_images" };
	}

	for (const file of files) {
		if (!POST_IMAGE_ACCEPTED_TYPES.includes(file.type)) {
			return { key: "social.errors.invalid_image_type" };
		}

		if (file.size > POST_IMAGE_MAX_BYTES) {
			return { key: "social.errors.image_too_large" };
		}
	}

	return null;
}

/**
 * Divide as imagens em lotes que caibam no limite do corpo da requisição. O
 * primeiro lote vai junto do `POST /post`; os demais, em `POST /post/{id}/images`.
 */
export function chunkImagesByRequestSize(files: File[]): File[][] {
	const batches: File[][] = [];

	let current: File[] = [];
	let currentSize = 0;

	for (const file of files) {
		if (
			current.length > 0 &&
			currentSize + file.size > POST_REQUEST_MAX_BYTES
		) {
			batches.push(current);
			current = [];
			currentSize = 0;
		}

		current.push(file);
		currentSize += file.size;
	}

	if (current.length > 0) batches.push(current);

	return batches;
}

/** "há 2 horas" / "2 hours ago", com o horário absoluto no `title`. */
export function formatRelativeTime(
	value: string | null | undefined,
	locale: "pt" | "en",
): string {
	if (!value) return "";

	const date = parseISO(value);

	if (!isValid(date)) return "";

	return formatDistanceToNow(date, {
		addSuffix: true,
		locale: locale === "en" ? enUS : ptBR,
	});
}

/** Horário absoluto para o `title` dos tempos relativos. */
export function formatFullDateTime(
	value: string | null | undefined,
	locale: "pt" | "en",
): string {
	if (!value) return "";

	const date = parseISO(value);

	if (!isValid(date)) return "";

	return date.toLocaleString(locale === "en" ? "en-US" : "pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
