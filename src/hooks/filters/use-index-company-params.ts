import { parseAsString } from "nuqs";
import { createFilterParams } from "./base/create-filter-params";

export const useIndexCompanyParams = createFilterParams({
    base: true,
    custom: {
        operational_segment: parseAsString.withDefault(""),
    },
});
