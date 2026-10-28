import { parseAsString } from "nuqs";
import { createFilterParams } from "./base/create-filter-params";

/**
 * Aba e filtro de "Meus Freelances" na URL, para o "voltar" do navegador cair
 * na mesma aba. As abas mudam conforme o papel: status para o cliente;
 * contratos, orçamentos, convites e recomendados para o dev.
 */
export const useMyFreelancesParams = createFilterParams({
	base: false,
	custom: {
		tab: parseAsString.withDefault(""),
		status: parseAsString.withDefault(""),
		search: parseAsString.withDefault(""),
	},
});
