import type { ChartConfig } from "@/components/ui/chart";

type ThemeColor = { light: string; dark: string };

/**
 * Cores dos gráficos, com um tom para o tema claro e outro para o escuro. As
 * `--chart-*` do tema são quase todas do mesmo marrom claro e não separam
 * categorias, então as dashboards usam esta paleta. Os conjuntos que aparecem
 * juntos num gráfico foram conferidos para daltonismo nos dois temas.
 */
const PALETTE = {
	blue: { light: "#2a78d6", dark: "#3987e5" },
	orange: { light: "#eb6834", dark: "#d95926" },
	aqua: { light: "#1baf7a", dark: "#199e70" },
	yellow: { light: "#eda100", dark: "#c98500" },
	magenta: { light: "#e87ba4", dark: "#d55181" },
	green: { light: "#008300", dark: "#008300" },
	violet: { light: "#6250d6", dark: "#9085e9" },
	red: { light: "#d03b3b", dark: "#d03b3b" },
	gray: { light: "#898781", dark: "#898781" },
} satisfies Record<string, ThemeColor>;

/**
 * Uma cor fixa por categoria em toda a tela: "backend" tem a mesma cor em
 * todos os gráficos de especialidade, "aprovado" em todos os de status. Os
 * status seguem o significado: aberto, em andamento, concluído, recusado e
 * cancelado têm a mesma cor em vagas, candidaturas, freelas e orçamentos.
 */
const CATEGORY_COLORS: Record<string, ThemeColor> = {
	// Especialidades
	frontend: PALETTE.blue,
	backend: PALETTE.orange,
	fullstack: PALETTE.aqua,

	// Tipos de perfil
	dev: PALETTE.blue,
	company: PALETTE.orange,
	client: PALETTE.aqua,
	admin: PALETTE.yellow,

	// Métricas das séries
	devs: PALETTE.blue,
	users: PALETTE.blue,
	job_vacancies: PALETTE.orange,
	vacancies: PALETTE.orange,
	applications: PALETTE.aqua,
	posts: PALETTE.magenta,
	comments: PALETTE.green,
	likes: PALETTE.violet,

	// Status
	open_inscriptions: PALETTE.aqua,
	open: PALETTE.aqua,
	closed_inscriptions: PALETTE.yellow,
	in_progress: PALETTE.yellow,
	pending: PALETTE.yellow,
	concluded: PALETTE.blue,
	approved: PALETTE.blue,
	completed: PALETTE.blue,
	accepted: PALETTE.blue,
	rejected: PALETTE.red,
	canceled: PALETTE.gray,
};

/** Cor dos gráficos de uma série só (senioridade, segmentos, linguagens…). */
export const SINGLE_SERIES_COLOR = PALETTE.blue;

export function categoryColor(key: string): ThemeColor {
	return CATEGORY_COLORS[key] ?? SINGLE_SERIES_COLOR;
}

/**
 * Monta o `ChartConfig` do shadcn: cada chave vira a variável `--color-<chave>`
 * dentro do gráfico, com o tom do tema ativo.
 */
export function buildChartConfig(
	entries: { key: string; label: string; color?: ThemeColor }[],
): ChartConfig {
	return Object.fromEntries(
		entries.map(({ key, label, color }) => [
			key,
			{ label, theme: color ?? categoryColor(key) },
		]),
	);
}
