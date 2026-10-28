import type { TFunction } from "i18next";
import {
	type ClientProfileSummaryResource,
	type DevProfileSummaryResource,
	type FreelanceFeedPostResource,
	type FreelanceFeedPostResourceAttachmentsItem,
	FreelanceFeedPostTypeEnum,
	type FreelanceJobVacancyResource,
	FreelanceJobVacancyStatusEnum,
	FreelanceProposalPricingTypeEnum,
	type FreelanceProposalResource,
	FreelanceProposalStatusEnum,
	type RecommendedFreelanceDevResource,
	type RecommendedFreelanceJobVacancyResource,
	type RecommendedFreelanceProposalResource,
} from "@/api/generated/models";
import type { AuthenticatedUser, UserRole } from "@/types/AuthenticatedUser";
import { formatCurrency } from "@/utils/formatter";

export { dedupeById } from "@/utils/dedupe-by-id";

/**
 * Freela como a API devolve. Vários campos dependem de quem está vendo:
 * `budget` e `proposals_count` só para o cliente dono, `contract` para o dono e
 * o dev contratado, `my_proposal` e `is_invited` só para dev. Campo ausente não
 * quer dizer `null`.
 */
export type FreelanceVacancy = FreelanceJobVacancyResource;
export type FreelanceClientSummary = ClientProfileSummaryResource;
export type FreelanceDevSummary = DevProfileSummaryResource;
export type FreelanceProposal = FreelanceProposalResource;
export type FreelanceFeedPost = FreelanceFeedPostResource;
export type FreelanceFeedAttachment = FreelanceFeedPostResourceAttachmentsItem;
export type RecommendedFreelanceDev = RecommendedFreelanceDevResource;
export type RecommendedFreelance = RecommendedFreelanceJobVacancyResource;
export type RankedFreelanceProposal = RecommendedFreelanceProposalResource;

export const FreelanceStatus = FreelanceJobVacancyStatusEnum;
export const FreelanceProposalStatus = FreelanceProposalStatusEnum;
export const FreelancePricingType = FreelanceProposalPricingTypeEnum;
export const FreelanceFeedPostType = FreelanceFeedPostTypeEnum;

/** Roles que veem a listagem e o detalhe. Para `company` a listagem responde 403. */
export const FREELANCE_BROWSER_ROLES: UserRole[] = ["dev", "client", "admin"];

/** Roles com a tela "Meus Freelances": o cliente publica, o dev orça e é contratado. */
export const FREELANCE_PARTY_ROLES: UserRole[] = ["dev", "client"];

/** `per_page` padrão das listagens do módulo. */
export const FREELANCE_PER_PAGE = 15;

/** `per_page` padrão do feed. */
export const FREELANCE_FEED_PER_PAGE = 20;

export const FREELANCE_TITLE_MAX_LENGTH = 255;
export const FREELANCE_BUDGET_MAX = 99999999.99;

export const FREELANCE_PROPOSAL_TOTAL_MAX = 99999999.99;
export const FREELANCE_HOURLY_RATE_MAX = 9999.99;
export const FREELANCE_ESTIMATED_HOURS_MAX = 9999;
export const FREELANCE_PROPOSAL_MESSAGE_MAX_LENGTH = 5000;

export const FREELANCE_FEED_CONTENT_MAX_LENGTH = 5000;
export const FREELANCE_FEED_MAX_FILES = 10;

/** Limite por arquivo da validação da API (`max:10000`, em kilobytes). */
export const FREELANCE_FEED_FILE_MAX_BYTES = 10_000 * 1024;

/**
 * Teto do corpo inteiro da requisição (`post_max_size = 12M`). O texto e os
 * cabeçalhos do multipart também contam, então os arquivos têm uma folga
 * abaixo dele para o envio não passar do limite por pouco.
 */
export const FREELANCE_FEED_REQUEST_MAX_BYTES = 12 * 1024 * 1024;
export const FREELANCE_FEED_REQUEST_OVERHEAD_BYTES = 64 * 1024;

/** Extensões aceitas pela regra `mimes` dos anexos do feed. */
export const FREELANCE_FEED_EXTENSIONS = [
	"pdf",
	"doc",
	"docx",
	"xls",
	"xlsx",
	"csv",
	"ppt",
	"pptx",
	"txt",
	"md",
	"zip",
	"png",
	"jpg",
	"jpeg",
	"webp",
];

/** Itens das recomendações e do ranking. A rota aceita até 50. */
export const FREELANCE_RECOMMENDATION_LIMIT = 10;

/**
 * O embedding do freela é gerado em fila cerca de 1 minuto depois de criar ou
 * editar. Até lá a recomendação e o ranking respondem 409, então tentamos de
 * novo a cada 20 s, no máximo 5 vezes.
 */
export const FREELANCE_ANALYSIS_RETRY_DELAY = 20_000;
export const FREELANCE_ANALYSIS_MAX_RETRIES = 5;

/** Próxima página das listagens paginadas, para a rolagem infinita. */
export function getNextFreelancePage(lastPage: {
	data: { pagination: { current_page: number; total_pages: number } };
}): number | undefined {
	const { current_page, total_pages } = lastPage.data.pagination;

	return current_page < total_pages ? current_page + 1 : undefined;
}

/** O contrato gerado tipa `specialties` como `unknown[]`, mas são valores de `/enum/dev-specialty`. */
export function getFreelanceSpecialties(vacancy: FreelanceVacancy): string[] {
	return (vacancy.specialties ?? []).filter(
		(specialty): specialty is string => typeof specialty === "string",
	);
}

export function isFreelanceOwner(
	vacancy: FreelanceVacancy | undefined,
	user: AuthenticatedUser | null,
): boolean {
	const clientProfileId = user?.client_profile?.id;

	if (!vacancy || !clientProfileId) return false;

	return vacancy.client_profile_id === clientProfileId;
}

/** O `contract` só chega para o dono e para o dev contratado. */
export function isContractedDev(
	vacancy: FreelanceVacancy | undefined,
	user: AuthenticatedUser | null,
): boolean {
	const devProfileId = user?.dev_profile?.id;

	if (!vacancy?.contract || !devProfileId) return false;

	return vacancy.contract.dev_profile_id === devProfileId;
}

export type FreelanceLocale = "pt" | "en";

export function getFreelanceLocale(language: string): FreelanceLocale {
	return language === "en" ? "en" : "pt";
}

/** Valores em dinheiro chegam como string decimal (`"10000.00"`). */
export function formatFreelanceMoney(
	value: string | number | null | undefined,
	locale: FreelanceLocale,
): string {
	return formatCurrency(Number(value), { locale, fallback: "—" });
}

/**
 * Preço de um orçamento:
 * - preço fechado: "R$ 10.000,00 · preço fechado";
 * - por hora: "R$ 120,50/h × 40 h = R$ 4.820,00".
 */
export function proposalPriceLabel(
	proposal: Pick<
		FreelanceProposal,
		"pricing_type" | "total_price" | "hourly_rate" | "estimated_hours"
	>,
	t: TFunction,
	locale: FreelanceLocale,
): string {
	const total = formatFreelanceMoney(proposal.total_price, locale);

	if (proposal.pricing_type === FreelancePricingType.hourly) {
		const rate = formatFreelanceMoney(proposal.hourly_rate, locale);

		return `${rate}/h × ${proposal.estimated_hours ?? 0} h = ${total}`;
	}

	return `${total} · ${t("freelance.proposal.fixed_suffix")}`;
}

/** 0,8123 → 81. Os índices da API vêm de 0 a 1. */
export function toPercentage(value: number): number {
	return Math.round(value * 100);
}

export interface BudgetComparison {
	direction: "above" | "below" | "equal";
	/** Diferença em porcentagem inteira, sempre positiva. */
	percentage: number;
}

/** Quanto o orçamento fica acima ou abaixo do budget do cliente. */
export function compareWithBudget(
	totalPrice: string | number,
	budget: string | number | undefined,
): BudgetComparison | null {
	const budgetValue = Number(budget);

	if (!budget || !Number.isFinite(budgetValue) || budgetValue <= 0) return null;

	const percentage = toPercentage(Number(totalPrice) / budgetValue - 1);

	if (percentage === 0) return { direction: "equal", percentage: 0 };

	return {
		direction: percentage > 0 ? "above" : "below",
		percentage: Math.abs(percentage),
	};
}

/** Bio no idioma da interface, caindo para a original. */
export function getFreelanceBio(
	profile: Pick<FreelanceClientSummary, "bio" | "bio_pt" | "bio_en">,
	language: string,
): string | null {
	const translated = language === "en" ? profile.bio_en : profile.bio_pt;

	return translated || profile.bio || null;
}

export function getFileExtension(name: string): string {
	const dot = name.lastIndexOf(".");

	return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

/** 1536 → "1,5 KB". */
export function formatFileSize(bytes: number, locale: FreelanceLocale): string {
	const units = ["B", "KB", "MB", "GB"];

	let value = bytes;
	let unit = 0;

	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}

	const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
		maximumFractionDigits: unit === 0 ? 0 : 1,
	}).format(value);

	return `${formatted} ${units[unit]}`;
}

export type FeedFilesError =
	| { key: "freelance.feed.errors.too_many_files"; values: { max: number } }
	| { key: "freelance.feed.errors.invalid_extension"; values: { name: string } }
	| { key: "freelance.feed.errors.file_too_large"; values: { name: string } }
	| { key: "freelance.feed.errors.total_too_large"; values?: undefined };

/**
 * Os mesmos limites que a API aplica aos anexos: até 10 arquivos, as extensões
 * da regra `mimes`, 10 MB por arquivo e 12 MB no envio inteiro.
 */
export function validateFeedFiles(
	files: File[],
	contentBytes = 0,
): FeedFilesError | null {
	if (files.length > FREELANCE_FEED_MAX_FILES) {
		return {
			key: "freelance.feed.errors.too_many_files",
			values: { max: FREELANCE_FEED_MAX_FILES },
		};
	}

	for (const file of files) {
		if (!FREELANCE_FEED_EXTENSIONS.includes(getFileExtension(file.name))) {
			return {
				key: "freelance.feed.errors.invalid_extension",
				values: { name: file.name },
			};
		}

		if (file.size > FREELANCE_FEED_FILE_MAX_BYTES) {
			return {
				key: "freelance.feed.errors.file_too_large",
				values: { name: file.name },
			};
		}
	}

	const totalBytes = files.reduce((total, file) => total + file.size, 0);

	if (
		totalBytes + contentBytes >
		FREELANCE_FEED_REQUEST_MAX_BYTES - FREELANCE_FEED_REQUEST_OVERHEAD_BYTES
	) {
		return { key: "freelance.feed.errors.total_too_large" };
	}

	return null;
}
