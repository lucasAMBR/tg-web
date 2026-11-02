/**
 * Tipos das dashboards, no formato do doc `dashboard.md` da API. O spec gerado
 * pelo orval descreve as listas como `unknown[]`, então o hook converte a
 * resposta para estes tipos.
 *
 * As distribuições por enum trazem todos os casos, na ordem do enum e com zero
 * quando não há registro, e a `timeline` traz todos os meses do período.
 */

/** Um caso de enum, no mesmo formato de `GET /enum`. */
export interface EnumItem {
	value: string;
	/** Texto de apoio, para quando a `i18nKey` não tem tradução. */
	label: string;
	i18nKey: string;
}

export interface EnumCount extends EnumItem {
	count: number;
}

/** Etapa do processo seletivo, já sem as esperas (`awaiting_*`). */
export type StageItem = EnumItem;

export interface CompanyDashboard {
	summary: {
		vacancies_total: number;
		/** Inscrições abertas + em processo seletivo. */
		vacancies_active: number;
		applications_total: number;
		applications_in_progress: number;
		hired_total: number;
		/** Em porcentagem, com uma casa decimal (16.7 = 16,7%). */
		hire_rate: number;
		average_applications_per_vacancy: number;
		applications_last_30_days: number;
	};
	agenda: {
		upcoming_interviews: number;
		upcoming_live_codings: number;
		/** O dev propôs um horário e a empresa precisa responder. */
		interviews_awaiting_confirmation: number;
		live_codings_awaiting_confirmation: number;
	};
	vacancies_by_status: EnumCount[];
	vacancies_by_process_step: (StageItem & {
		/** Vagas em processo seletivo (inscrições encerradas) nesta etapa. */
		count: number;
		/** Parte de `count` que espera a empresa preparar a etapa. */
		awaiting_count: number;
	})[];
	applications_by_status: EnumCount[];
	applications_by_process_step: (StageItem & {
		in_progress: number;
		rejected: number;
	})[];
	/** As 10 vagas com mais candidaturas; as sem candidatura vêm no fim. */
	applications_by_vacancy: VacancyApplications[];
	applicants_by_specialty: EnumCount[];
	applicants_by_seniority: EnumCount[];
	timeline: { month: string; vacancies: number; applications: number }[];
}

export interface VacancyApplications {
	id: string;
	title: string;
	title_pt: string | null;
	title_en: string | null;
	status: string;
	status_label: string;
	applications_count: number;
	in_progress: number;
	approved: number;
	rejected: number;
}

export interface AdminDashboard {
	summary: {
		users_total: number;
		new_users_last_30_days: number;
		blocked_users: number;
		devs: number;
		companies: number;
		clients: number;
		admins: number;
		devs_open_to_work: number;
		devs_seniority_tested: number;
		job_vacancies_total: number;
		job_vacancies_open: number;
		applications_total: number;
		hired_total: number;
		freelance_vacancies_total: number;
		freelance_proposals_total: number;
		/** Soma em reais dos orçamentos aceitos. */
		freelance_contracted_volume: number;
	};
	specialties: (EnumItem & {
		devs: number;
		job_vacancies: number;
		applications: number;
	})[];
	devs_by_seniority: EnumCount[];
	companies_by_segment: EnumCount[];
	job_vacancies_by_status: EnumCount[];
	applications_by_status: EnumCount[];
	freelance_vacancies_by_status: EnumCount[];
	freelance_proposals_by_status: EnumCount[];
	top_dev_languages: LanguageCount[];
	top_vacancy_languages: LanguageCount[];
	social: {
		posts: number;
		comments: number;
		likes: number;
		favorites: number;
		follows: number;
		chat_conversations: number;
		chat_messages: number;
		/** likes + comments + favorites + follows */
		interactions: number;
	};
	timeline: {
		month: string;
		users: number;
		applications: number;
		posts: number;
		comments: number;
		likes: number;
	}[];
}

export interface LanguageCount {
	id: string;
	name: string;
	count: number;
}

/** Períodos do seletor. A API aceita de 1 a 24, mas a tela só envia estes. */
export const DASHBOARD_MONTHS = [3, 6, 12] as const;

export type DashboardMonths = (typeof DASHBOARD_MONTHS)[number];

export const DEFAULT_DASHBOARD_MONTHS: DashboardMonths = 6;

/** Esconde o gráfico quando todas as categorias vêm zeradas. */
export function hasData(items: { count: number }[]): boolean {
	return items.some((item) => item.count > 0);
}
