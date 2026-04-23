import { parseAsInteger, parseAsString } from "nuqs";

export const basePaginationParsers = {
	page: parseAsInteger.withDefault(1),
	perPage: parseAsInteger.withDefault(10),
} as const;

export const baseSearchParsers = {
	search: parseAsString.withDefault(""),
} as const;

export const baseFilterParsers = {
	...basePaginationParsers,
	...baseSearchParsers,
} as const;
