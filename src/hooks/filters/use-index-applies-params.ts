import { basePaginationParsers } from "./base/base-parsers";
import { createFilterParams } from "./base/create-filter-params";

export const useIndexAppliesParams = createFilterParams({
	base: false,
	custom: basePaginationParsers,
});
