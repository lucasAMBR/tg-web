import { useCallback, useEffect, useRef, useState } from "react";
import {
	indexComment,
	indexCommentReplies,
	showComment,
} from "@/api/generated/comment/comment";
import type { CommentResource } from "@/api/generated/models";
import {
	appendReplyToNode,
	asRemovedComment,
	COMMENTS_PER_PAGE,
	mergeCommentsById,
	REPLIES_PER_PAGE,
	updateCommentNode,
} from "@/types/social";

export interface CommentTreeState {
	comments: CommentResource[];
	isLoading: boolean;
	isLoadingMore: boolean;
	/** Erro do carregamento inicial — vira tela de indisponível. */
	error: unknown;
	hasMore: boolean;
	loadMore: () => void;
	/** Ids dos comentários com "ver mais respostas" em andamento. */
	loadingReplies: string[];
	loadMoreReplies: (commentId: string) => Promise<void>;
	addRootComment: (comment: CommentResource) => void;
	addReply: (parentId: string, reply: CommentResource) => void;
	patchComment: (
		id: string,
		patch: (comment: CommentResource) => CommentResource,
	) => void;
	markCommentRemoved: (id: string) => void;
}

/**
 * Operações locais da árvore, compartilhadas pela tela do post e pela tela de
 * thread. As ações de comentário atualizam o nó no lugar em vez de recarregar a
 * listagem, para não fechar as respostas que já estavam abertas.
 */
function useCommentTreeActions(
	comments: CommentResource[],
	setComments: React.Dispatch<React.SetStateAction<CommentResource[]>>,
) {
	const [loadingReplies, setLoadingReplies] = useState<string[]>([]);

	/**
	 * Próxima página de respostas de cada nó. A página 1 repete as respostas que
	 * já vieram na prévia, e o merge por id descarta essas.
	 */
	const repliesPages = useRef(new Map<string, number>());

	const patchComment = useCallback(
		(id: string, patch: (comment: CommentResource) => CommentResource) => {
			setComments((current) => updateCommentNode(current, id, patch));
		},
		[setComments],
	);

	const addRootComment = useCallback(
		(comment: CommentResource) => {
			setComments((current) => mergeCommentsById([comment], current));
		},
		[setComments],
	);

	const addReply = useCallback(
		(parentId: string, reply: CommentResource) => {
			setComments((current) => appendReplyToNode(current, parentId, reply));
		},
		[setComments],
	);

	const markCommentRemoved = useCallback(
		(id: string) => {
			// Nenhum contador diminui: a remoção é lógica e a linha continua na árvore.
			setComments((current) =>
				updateCommentNode(current, id, asRemovedComment),
			);
		},
		[setComments],
	);

	const loadMoreReplies = useCallback(
		async (commentId: string) => {
			const page = repliesPages.current.get(commentId) ?? 1;

			setLoadingReplies((current) => [...current, commentId]);

			try {
				const response = await indexCommentReplies(commentId, {
					page,
					per_page: REPLIES_PER_PAGE,
				});

				repliesPages.current.set(commentId, page + 1);

				setComments((current) =>
					updateCommentNode(current, commentId, (comment) => {
						const replies = mergeCommentsById(
							comment.replies ?? [],
							response.data.data,
						);

						return {
							...comment,
							replies,
							has_more_replies: replies.length < comment.replies_count,
						};
					}),
				);
			} finally {
				setLoadingReplies((current) =>
					current.filter((id) => id !== commentId),
				);
			}
		},
		[setComments],
	);

	return {
		comments,
		loadingReplies,
		loadMoreReplies,
		addRootComment,
		addReply,
		patchComment,
		markCommentRemoved,
	};
}

/**
 * Comentários raiz de uma postagem, dos mais novos para os mais antigos, com
 * "carregar mais comentários". Cada raiz já vem com a prévia da subárvore.
 */
export function useCommentTree(postId: string): CommentTreeState {
	const [comments, setComments] = useState<CommentResource[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const [nextPage, setNextPage] = useState<number | null>(1);

	const actions = useCommentTreeActions(comments, setComments);

	/** Descarta a resposta de uma postagem que não é mais a da tela. */
	const requestId = useRef(0);

	const fetchPage = useCallback(
		async (page: number) => {
			const token = ++requestId.current;

			if (page === 1) {
				setIsLoading(true);
				setError(null);
			} else {
				setIsLoadingMore(true);
			}

			try {
				const response = await indexComment({
					post_id: postId,
					page,
					per_page: COMMENTS_PER_PAGE,
				});

				if (token !== requestId.current) return;

				const { current_page, total_pages } = response.data.pagination;

				setComments((current) =>
					page === 1
						? response.data.data
						: mergeCommentsById(current, response.data.data),
				);
				setNextPage(current_page < total_pages ? current_page + 1 : null);
			} catch (caught) {
				if (token !== requestId.current) return;

				if (page === 1) setError(caught);
			} finally {
				if (token === requestId.current) {
					setIsLoading(false);
					setIsLoadingMore(false);
				}
			}
		},
		[postId],
	);

	useEffect(() => {
		setComments([]);
		setNextPage(1);
		fetchPage(1);
	}, [fetchPage]);

	const loadMore = useCallback(() => {
		if (nextPage === null || isLoadingMore) return;

		fetchPage(nextPage);
	}, [fetchPage, isLoadingMore, nextPage]);

	return {
		...actions,
		isLoading,
		isLoadingMore,
		error,
		hasMore: nextPage !== null,
		loadMore,
	};
}

/**
 * Tela de "continuar esta thread": o comentário informado como raiz, com mais
 * três níveis de prévia abaixo dele. As mesmas regras da árvore valem aqui.
 */
export function useCommentThread(commentId: string): CommentTreeState {
	const [comments, setComments] = useState<CommentResource[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<unknown>(null);

	const actions = useCommentTreeActions(comments, setComments);

	const requestId = useRef(0);

	useEffect(() => {
		const token = ++requestId.current;

		setComments([]);
		setIsLoading(true);
		setError(null);

		showComment(commentId)
			.then((response) => {
				if (token !== requestId.current) return;

				setComments([response.data]);
			})
			.catch((caught) => {
				if (token !== requestId.current) return;

				setError(caught);
			})
			.finally(() => {
				if (token === requestId.current) setIsLoading(false);
			});
	}, [commentId]);

	return {
		...actions,
		isLoading,
		isLoadingMore: false,
		error,
		hasMore: false,
		loadMore: () => {},
	};
}
