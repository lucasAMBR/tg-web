import i18n from "@/i18n";

export const APP_NAME = "Brew";

type PageTitleKey =
	| "home"
	| "login"
	| "register"
	| "address"
	| "create_profile"
	| "feed"
	| "search"
	| "profile"
	| "settings"
	| "dashboard"
	| "devs"
	| "dev_details"
	| "companies"
	| "company_details"
	| "clients"
	| "client_details"
	| "proficiency_test"
	| "my_vacancies"
	| "my_applies"
	| "vacancy_details"
	| "selection_process";

/**
 * Monta o `<title>` traduzido das rotas.
 * `head` roda fora do React, então usamos a instância do i18next direto em vez do hook.
 * O `TitleI18nSync` reinvalida o router quando o idioma muda ou os recursos terminam de carregar.
 */
export function pageTitle(key: PageTitleKey): string {
	return `${i18n.t(`page_title.${key}`)} — ${APP_NAME}`;
}
