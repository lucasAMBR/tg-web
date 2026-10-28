import type { PortfolioSolicitationResource } from "@/api/generated/models";

/** A solicitação só conta como enviada quando o link chegou junto com o status. */
export function portfolioWasSent(
	solicitation?: PortfolioSolicitationResource,
): boolean {
	return solicitation?.status === "sent" && !!solicitation.portfolio_url;
}
