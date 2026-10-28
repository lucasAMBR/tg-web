import {
	type InfiniteData,
	type QueryClient,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type { PostParticipantCollection } from "@/api/generated/models";
import { indexPostParticipants } from "@/api/generated/post/post";
import { POST_PARTICIPANTS_PER_PAGE } from "@/types/social";
import { dedupeBy } from "@/utils/dedupe-by-id";

/**
 * O id do post fica na segunda posição de propósito: os helpers dos feeds
 * mexem em toda chave `"/post…", "infinite"`, e as páginas daqui não têm o
 * formato de uma listagem de postagens.
 */
export const getPostParticipantsQueryKey = (postId: string) =>
	["/post", postId, "participants", "infinite"] as const;

export type PostParticipantsCache = InfiniteData<PostParticipantCollection>;

export const isPostParticipantsKey = (queryKey: readonly unknown[]) =>
	queryKey[0] === "/post" &&
	queryKey[2] === "participants" &&
	queryKey[3] === "infinite";

/**
 * Comentar, responder ou remover um comentário muda quem está na conversa e
 * quantas vezes cada um participou, e a ordem depende disso. Quem decide a
 * lista nova é a API.
 */
export function invalidatePostParticipants(
	queryClient: QueryClient,
	postId: string,
): void {
	queryClient.invalidateQueries({
		queryKey: getPostParticipantsQueryKey(postId),
	});
}

/**
 * Quem participa da conversa nos comentários do post, do mais ativo para o
 * menos. A ordem muda enquanto as pessoas comentam, então um usuário pode
 * trocar de página entre uma requisição e outra: as páginas são juntadas
 * descartando ids repetidos.
 */
export function usePostParticipants(postId: string) {
	const query = useInfiniteQuery({
		queryKey: getPostParticipantsQueryKey(postId),
		// O envelope é descartado para as páginas guardarem só a coleção
		queryFn: async ({ pageParam, signal }) => {
			const response = await indexPostParticipants(
				postId,
				{ page: pageParam, per_page: POST_PARTICIPANTS_PER_PAGE },
				signal,
			);

			return response.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { current_page, total_pages } = lastPage.pagination;

			return current_page < total_pages ? current_page + 1 : undefined;
		},
		// Post excluído responde 422; tentar de novo não muda nada
		retry: false,
	});

	const participants = useMemo(
		() =>
			dedupeBy(
				query.data?.pages.flatMap((page) => page.data) ?? [],
				(participant) => participant.user.id,
			),
		[query.data],
	);

	return { ...query, participants };
}
