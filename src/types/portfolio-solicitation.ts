import type { DevJobVacancyResource } from "@/api/generated/models";

/**
 * O contrato gerado ainda não declara `portfolio_solicitation`, apesar de a API
 * já carregar a solicitação nas candidaturas da etapa de análise de portfólio.
 * Quando o swagger expuser o recurso, trocar por `PortfolioSolicitationResource`.
 */
export interface PortfolioSolicitation {
	id: string;
	portfolio_url?: string | null;
	type?: "repository" | "production" | null;
	status?: "pending" | "sent" | null;
	due_date?: string | null;
}

export function getPortfolioSolicitation(
	apply: DevJobVacancyResource,
): PortfolioSolicitation | undefined {
	return (apply as { portfolio_solicitation?: PortfolioSolicitation })
		.portfolio_solicitation;
}

export function portfolioWasSent(
	solicitation?: PortfolioSolicitation,
): boolean {
	return solicitation?.status === "sent" && !!solicitation.portfolio_url;
}
