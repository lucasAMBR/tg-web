import type { LucideIcon } from "lucide-react";

/**
 * Configuração de um item de breadcrumb.
 *
 * Um item é clicável quando:
 *  - `clickable` não é `false`; E
 *  - existe um destino (`href` explícito ou o pathname da própria match); E
 *  - não é o último item da trilha (a página atual nunca vira link).
 */
export type BreadcrumbCrumbConfig = {
	/** Texto literal (use quando o rótulo não precisa de tradução). */
	label?: string;
	/** Chave do i18next, ex.: `page_title.devs`. Tem prioridade sobre `label`. */
	labelKey?: string;
	/** Destino do link. Se omitido, usa o pathname da match da rota. */
	href?: string;
	/** `false` transforma o item em texto simples. Padrão: `true`. */
	clickable?: boolean;
	/** Ícone opcional exibido antes do rótulo. */
	icon?: LucideIcon;
};

export type BreadcrumbConfig = BreadcrumbCrumbConfig & {
	/** Remove a rota da trilha (útil para layouts e rotas sem página própria). */
	hidden?: boolean;
	/**
	 * Itens virtuais inseridos antes deste, para hierarquias que não existem
	 * como rota (ex.: `/devs/$id` sem uma listagem `/devs`).
	 */
	parents?: BreadcrumbCrumbConfig[];
};

/** Item já resolvido, pronto para renderização. */
export type BreadcrumbEntry = {
	key: string;
	label: string;
	href?: string;
	icon?: LucideIcon;
	isCurrent: boolean;
};

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		breadcrumb?: BreadcrumbConfig;
	}
}
