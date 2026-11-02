import { parseAsNumberLiteral } from "nuqs";
import { DASHBOARD_MONTHS, DEFAULT_DASHBOARD_MONTHS } from "@/types/dashboard";
import { createFilterParams } from "./base/create-filter-params";

/**
 * Período das dashboards na URL. Valor fora da lista cai no padrão, então a API
 * só recebe os `months` que o seletor oferece.
 */
export const useDashboardParams = createFilterParams({
	base: false,
	custom: {
		months: parseAsNumberLiteral(DASHBOARD_MONTHS).withDefault(
			DEFAULT_DASHBOARD_MONTHS,
		),
	},
});
