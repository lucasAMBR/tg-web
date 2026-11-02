import { useTranslation } from "react-i18next";
import type { EnumItem, VacancyApplications } from "@/types/dashboard";

/**
 * Formatação dos números e textos das dashboards no idioma da tela.
 * `hire_rate` e as fatias das roscas vêm em porcentagem (16.7 = 16,7%).
 */
export function useDashboardFormat() {
	const { t, i18n } = useTranslation();

	const locale = i18n.language === "en" ? "en-US" : "pt-BR";

	const numberFormat = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 1,
	});
	const percentFormat = new Intl.NumberFormat(locale, {
		style: "percent",
		maximumFractionDigits: 1,
	});
	const currencyFormat = new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "BRL",
	});
	const monthFormat = new Intl.DateTimeFormat(locale, {
		month: "short",
		year: "2-digit",
	});

	return {
		formatNumber: (value: number) => numberFormat.format(value),
		formatPercent: (value: number) => percentFormat.format(value / 100),
		formatCurrency: (value: number) => currencyFormat.format(value),
		/**
		 * `month` vem como `YYYY-MM`. `new Date("2026-06")` seria lido como UTC
		 * e, no fuso do Brasil, viraria o último dia de maio.
		 */
		formatMonth: (month: string) => {
			const [year, monthNumber] = month.split("-").map(Number);

			return monthFormat.format(new Date(year, monthNumber - 1, 1));
		},
		enumLabel: (item: EnumItem) =>
			t(item.i18nKey, { defaultValue: item.label }),
		vacancyTitle: (vacancy: VacancyApplications) =>
			(i18n.language === "pt" ? vacancy.title_pt : vacancy.title_en) ??
			vacancy.title,
	};
}
