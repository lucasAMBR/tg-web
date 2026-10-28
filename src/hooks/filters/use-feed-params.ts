import { parseAsStringLiteral } from "nuqs";
import { useState } from "react";
import {
	POST_FEED_SORTS,
	POST_FEED_SOURCES,
	type PostFeedSort,
	type PostFeedSource,
} from "@/hooks/use-post-feed";
import { createFilterParams } from "./base/create-filter-params";

interface FeedPreference {
	feed: PostFeedSource;
	sort: PostFeedSort;
}

const DEFAULT_FEED_PREFERENCE: FeedPreference = {
	feed: "all",
	sort: "popular",
};

const FEED_PREFERENCE_STORAGE_KEY = "feed-preference";

/**
 * Sem default de propósito: parâmetro ausente na URL quer dizer "use a última
 * escolha guardada". Valor fora da lista vira `null`, então a API só recebe o
 * que os tipos aceitam.
 */
const useFeedUrlParams = createFilterParams({
	base: false,
	custom: {
		feed: parseAsStringLiteral(POST_FEED_SOURCES),
		sort: parseAsStringLiteral(POST_FEED_SORTS),
	},
});

function readStoredFeedPreference(): Partial<FeedPreference> {
	try {
		const stored = JSON.parse(
			localStorage.getItem(FEED_PREFERENCE_STORAGE_KEY) ?? "{}",
		);

		return {
			feed: POST_FEED_SOURCES.find((feed) => feed === stored?.feed),
			sort: POST_FEED_SORTS.find((sort) => sort === stored?.sort),
		};
	} catch {
		return {};
	}
}

function storeFeedPreference(preference: FeedPreference): void {
	try {
		localStorage.setItem(
			FEED_PREFERENCE_STORAGE_KEY,
			JSON.stringify(preference),
		);
	} catch {
		// Sem storage disponível, a escolha continua valendo pela URL
	}
}

/**
 * Aba ("Todos" ou "Seguindo") e ordenação do feed. A URL é a fonte da verdade;
 * a última escolha também fica guardada no navegador para o feed voltar nela
 * quando é aberto pelo menu, sem parâmetros na URL.
 */
export function useFeedParams() {
	const { feed, sort, setFilterParams } = useFeedUrlParams();

	const [stored] = useState(readStoredFeedPreference);

	const current: FeedPreference = {
		feed: feed ?? stored.feed ?? DEFAULT_FEED_PREFERENCE.feed,
		sort: sort ?? stored.sort ?? DEFAULT_FEED_PREFERENCE.sort,
	};

	const setFeedParams = (next: Partial<FeedPreference>) => {
		const preference = { ...current, ...next };

		storeFeedPreference(preference);
		setFilterParams(preference);
	};

	return { ...current, setFeedParams };
}
