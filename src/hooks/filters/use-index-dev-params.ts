import { parseAsBoolean, parseAsString } from "nuqs";
import { createFilterParams } from "./base/create-filter-params";

export const useIndexDevParams = createFilterParams({
    base: true,
    custom: {
        seniority_level: parseAsString.withDefault(""),
        specialty: parseAsString.withDefault(""),
        open_to_relocation: parseAsBoolean,
        open_to_work: parseAsBoolean,
    },
});