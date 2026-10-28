import {
	type InfiniteData,
	type QueryClient,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { indexFreelanceFeed } from "@/api/generated/freelance-feed/freelance-feed";
import type {
	FreelanceFeedPostResourceLatestReviewAnyOf,
	FreelanceFeedPostTypeEnum,
	FreelanceReviewStatusEnum,
	IndexFreelanceFeed200,
	StoreFreelanceFeedPost201,
} from "@/api/generated/models";
import apiClient from "@/lib/api-client";
import {
	dedupeById,
	FREELANCE_FEED_PER_PAGE,
	type FreelanceFeedPost,
	FreelanceFeedPostType,
	getNextFreelancePage,
} from "@/types/freelance";

/** As URLs assinadas dos anexos expiram 30 minutos depois de o feed carregar. */
const FEED_URL_REFRESH_INTERVAL = 25 * 60 * 1000;

export const getFreelanceFeedQueryKey = (vacancyId: string) =>
	[`/freelance-job-vacancy/${vacancyId}/feed`, "infinite"] as const;

type FreelanceFeedCache = InfiniteData<IndexFreelanceFeed200>;

function updateFeedPosts(
	queryClient: QueryClient,
	vacancyId: string,
	update: (
		posts: FreelanceFeedPost[],
		pageIndex: number,
	) => FreelanceFeedPost[],
	totalDelta = 0,
): void {
	queryClient.setQueryData<FreelanceFeedCache>(
		getFreelanceFeedQueryKey(vacancyId),
		(current) => {
			if (!current) return current;

			return {
				...current,
				pages: current.pages.map((page, pageIndex) => ({
					...page,
					data: {
						...page.data,
						data: update(
							page.data.data,
							pageIndex,
						) as IndexFreelanceFeed200["data"]["data"],
						pagination: {
							...page.data.pagination,
							total: page.data.pagination.total + totalDelta,
						},
					},
				})),
			};
		},
	);
}

/** A postagem recém-publicada entra no topo, sem refazer as páginas. */
export function prependCachedFeedPost(
	queryClient: QueryClient,
	vacancyId: string,
	post: FreelanceFeedPost,
): void {
	updateFeedPosts(
		queryClient,
		vacancyId,
		(posts, pageIndex) => (pageIndex === 0 ? [post, ...posts] : posts),
		1,
	);
}

/** A review mais recente aparece na entrega revisada. */
export function setCachedLatestReview(
	queryClient: QueryClient,
	vacancyId: string,
	review: FreelanceFeedPost,
): void {
	if (!review.parent_id || !review.review_status) return;

	const latestReview: FreelanceFeedPostResourceLatestReviewAnyOf = {
		id: review.id,
		review_status: review.review_status,
		review_status_label: review.review_status_label,
		created_at:
			review.created_at as FreelanceFeedPostResourceLatestReviewAnyOf["created_at"],
	};

	updateFeedPosts(queryClient, vacancyId, (posts) =>
		posts.map((post) =>
			post.id === review.parent_id
				? { ...post, latest_review: latestReview }
				: post,
		),
	);
}

export function removeCachedFeedPost(
	queryClient: QueryClient,
	vacancyId: string,
	postId: string,
): void {
	updateFeedPosts(
		queryClient,
		vacancyId,
		(posts) => posts.filter((post) => post.id !== postId),
		-1,
	);
}

/**
 * Feed do freela, do mais novo para o mais antigo. As URLs dos anexos expiram
 * 30 minutos depois de carregadas, então elas não são guardadas fora daqui: se
 * um link falhar, a tela recarrega o feed.
 */
export function useFreelanceFeed(vacancyId: string, enabled = true) {
	const query = useInfiniteQuery({
		queryKey: getFreelanceFeedQueryKey(vacancyId),
		queryFn: ({ pageParam, signal }) =>
			indexFreelanceFeed(
				vacancyId,
				{ page: pageParam, per_page: FREELANCE_FEED_PER_PAGE },
				signal,
			),
		initialPageParam: 1,
		getNextPageParam: getNextFreelancePage,
		enabled,
		// Recarrega antes de as URLs dos anexos expirarem, com a tela aberta
		refetchInterval: FEED_URL_REFRESH_INTERVAL,
	});

	const posts = useMemo(
		() =>
			dedupeById<FreelanceFeedPost>(
				query.data?.pages.flatMap((page) => page.data.data) ?? [],
			),
		[query.data],
	);

	return { ...query, posts };
}

export interface FreelanceFeedPostPayload {
	type: FreelanceFeedPostTypeEnum;
	content?: string;
	attachments?: File[];
	/** Só na review: a entrega revisada. */
	parentId?: string;
	reviewStatus?: FreelanceReviewStatusEnum;
}

/**
 * `POST /freelance-job-vacancy/{id}/feed`. A função gerada sempre acrescenta
 * `parent_id` e `review_status` ao multipart, e fora da review eles iriam como a
 * string "undefined"; aqui só entra o que a postagem tem. O `Content-Type` é o
 * mesmo das funções geradas: com `FormData`, o axios o troca pelo do navegador,
 * que leva o boundary.
 */
export function storeFreelanceFeedPost(
	vacancyId: string,
	payload: FreelanceFeedPostPayload,
) {
	const formData = new FormData();

	formData.append("type", payload.type);

	if (payload.content) formData.append("content", payload.content);

	for (const file of payload.attachments ?? []) {
		formData.append("attachments[]", file);
	}

	if (payload.type === FreelanceFeedPostType.review) {
		if (payload.parentId) formData.append("parent_id", payload.parentId);
		if (payload.reviewStatus) {
			formData.append("review_status", payload.reviewStatus);
		}
	}

	return apiClient<StoreFreelanceFeedPost201>({
		url: `/freelance-job-vacancy/${vacancyId}/feed`,
		method: "POST",
		headers: { "Content-Type": "multipart/form-data" },
		data: formData,
	});
}

/** Publica no feed e já coloca a postagem no topo (e a review na entrega). */
export function useStoreFreelanceFeedPost(vacancyId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: FreelanceFeedPostPayload) =>
			storeFreelanceFeedPost(vacancyId, payload),
		onSuccess: (response) => {
			const post = response.data;

			prependCachedFeedPost(queryClient, vacancyId, post);

			if (post.type === FreelanceFeedPostType.review) {
				setCachedLatestReview(queryClient, vacancyId, post);
			}
		},
	});
}
