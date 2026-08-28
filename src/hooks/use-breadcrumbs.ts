import { useMatch, useMatches } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useBreadcrumbStore } from "@/stores/breadcrumb-store";
import type {
	BreadcrumbCrumbConfig,
	BreadcrumbEntry,
} from "@/types/breadcrumb";

function normalizeHref(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

/**
 * Monta a trilha a partir das matches ativas do router.
 *
 * Cada rota declara `staticData.breadcrumb`; rotas sem essa configuração
 * (layouts, rotas pathless) são ignoradas. O último item resolvido é sempre
 * a página atual e nunca vira link.
 */
export function useBreadcrumbs(): BreadcrumbEntry[] {
	const { t } = useTranslation();
	const labels = useBreadcrumbStore((state) => state.labels);

	const matches = useMatches();

	const resolveLabel = (
		config: BreadcrumbCrumbConfig,
		dynamicLabel?: string,
	): string => {
		if (dynamicLabel) return dynamicLabel;
		if (config.labelKey) return t(config.labelKey);
		return config.label ?? "";
	};

	const entries: BreadcrumbEntry[] = [];

	for (const match of matches) {
		const config = match.staticData?.breadcrumb;

		if (!config || config.hidden) continue;

		for (const [index, parent] of (config.parents ?? []).entries()) {
			const label = resolveLabel(parent);
			if (!label) continue;

			entries.push({
				key: `${match.routeId}-parent-${index}`,
				label,
				href: parent.clickable === false ? undefined : parent.href,
				icon: parent.icon,
				isCurrent: false,
			});
		}

		const label = resolveLabel(config, labels[match.routeId]);
		if (!label) continue;

		entries.push({
			key: match.routeId,
			label,
			href:
				config.clickable === false
					? undefined
					: (config.href ?? normalizeHref(match.pathname)),
			icon: config.icon,
			isCurrent: false,
		});
	}

	const lastIndex = entries.length - 1;

	return entries.map((entry, index) =>
		index === lastIndex
			? { ...entry, href: undefined, isCurrent: true }
			: entry,
	);
}

/**
 * Define em runtime o rótulo do breadcrumb da rota atual.
 *
 * Usado em páginas de detalhe, onde o rótulo só é conhecido depois que os dados
 * chegam (ex.: nome do dev em `/devs/$id`). Enquanto `label` for vazio, o
 * rótulo estático declarado em `staticData.breadcrumb` continua valendo.
 */
export function useBreadcrumbLabel(label?: string | null): void {
	const match = useMatch({ strict: false });
	const routeId = match.routeId as string;

	const setLabel = useBreadcrumbStore((state) => state.setLabel);
	const clearLabel = useBreadcrumbStore((state) => state.clearLabel);

	useEffect(() => {
		if (label) {
			setLabel(routeId, label);
		} else {
			clearLabel(routeId);
		}

		return () => clearLabel(routeId);
	}, [routeId, label, setLabel, clearLabel]);
}
