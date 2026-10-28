import { useMemo } from "react";
import { useIndexMyApplies } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { useAuthStore } from "@/stores/auth-store";
import { getUserMainRole } from "@/utils/role-helper";

// A listagem de candidaturas não filtra por vaga, então buscamos uma página
// grande o suficiente para cobrir o histórico do desenvolvedor
const PER_PAGE = 100;

/**
 * Ids das vagas em que o desenvolvedor autenticado já se candidatou.
 * A consulta só é feita quando o usuário é um desenvolvedor e a chave é
 * compartilhada entre todos os componentes que exibem o botão de candidatura.
 */
export function useMyAppliedVacancies() {
	const { user } = useAuthStore();

	const isDev = getUserMainRole(user) === "dev";

	const { data, isLoading } = useIndexMyApplies(
		{ page: 1, per_page: PER_PAGE },
		{ query: { enabled: isDev } },
	);

	const appliedVacancyIds = useMemo(
		() => new Set((data?.data.data ?? []).map((apply) => apply.job_vacancy_id)),
		[data],
	);

	return { appliedVacancyIds, isLoading: isDev && isLoading };
}
