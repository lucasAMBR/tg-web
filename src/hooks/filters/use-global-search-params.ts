import { createFilterParams } from "./base/create-filter-params";

export const useGlobalSearchParams = createFilterParams({
    base: true,
    custom: {},
});
