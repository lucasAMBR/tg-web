import type { ParserMap, UrlKeys, Values } from "nuqs";
import { useQueryStates } from "nuqs";
import { baseFilterParsers } from "./base-parsers";

function toSnakeCase(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function generateUrlKeys<T extends ParserMap>(parsers: T): UrlKeys<T> {
	return Object.keys(parsers).reduce(
		(acc, key) => {
			acc[key as keyof T] = toSnakeCase(key) as UrlKeys<T>[keyof T];
			return acc;
		},
		{} as UrlKeys<T>,
	);
}

type ParsersFromOptions<
	TBase extends boolean,
	TCustom extends ParserMap,
> = TBase extends true ? typeof baseFilterParsers & TCustom : TCustom;

export interface CreateFilterParamsOptions<
	TCustom extends ParserMap = ParserMap,
> {
	base?: boolean;
	custom?: TCustom;
	urlKeys?: Partial<UrlKeys<ParserMap>>;
}

export function createFilterParams<TCustom extends ParserMap = ParserMap>(
	options: CreateFilterParamsOptions<TCustom> & { base?: true },
): ReturnType<typeof createFilterParamsWithBase<TCustom, true>>;
export function createFilterParams<TCustom extends ParserMap = ParserMap>(
	options: CreateFilterParamsOptions<TCustom> & { base: false },
): ReturnType<typeof createFilterParamsWithBase<TCustom, false>>;
export function createFilterParams<TCustom extends ParserMap = ParserMap>(
	options: CreateFilterParamsOptions<TCustom> = {},
): ReturnType<typeof createFilterParamsWithBase<TCustom, true>> {
	return createFilterParamsWithBase(
		options as CreateFilterParamsOptions<TCustom> & { base?: true },
	);
}

function createFilterParamsWithBase<
	TCustom extends ParserMap = ParserMap,
	TBase extends boolean = true,
>(options: CreateFilterParamsOptions<TCustom> & { base?: TBase }) {
	const { base = true as TBase, custom = {} as TCustom } = options;

	type CombinedParsers = ParsersFromOptions<TBase, TCustom>;

	const parsers = base
		? ({ ...baseFilterParsers, ...custom } as CombinedParsers)
		: ({ ...custom } as CombinedParsers);

	const urlKeys = options.urlKeys
		? ({
				...generateUrlKeys(parsers),
				...options.urlKeys,
			} as UrlKeys<CombinedParsers>)
		: (generateUrlKeys(parsers) as UrlKeys<CombinedParsers>);

	return function useFilterParams(): Values<CombinedParsers> & {
		setFilterParams: ReturnType<typeof useQueryStates<CombinedParsers>>[1];
	} {
		const [params, setFilterParams] = useQueryStates<CombinedParsers>(parsers, {
			urlKeys,
		});

		return {
			...params,
			setFilterParams,
		} as Values<CombinedParsers> & {
			setFilterParams: ReturnType<typeof useQueryStates<CombinedParsers>>[1];
		};
	};
}
