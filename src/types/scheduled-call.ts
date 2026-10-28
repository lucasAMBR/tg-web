import { addMinutes, isValid, parseISO, subMinutes } from "date-fns";

/**
 * O contrato gerado tipa `status` como `string`, mas os valores são sempre os do
 * enum de status da API — o mesmo na entrevista e no live coding.
 */
export type ScheduledCallStatus =
	| "awaiting_schedule"
	| "awaiting_dev_confirmation"
	| "awaiting_company_confirmation"
	| "approved"
	| "cancelled"
	| "rejected";

/** Lado da negociação, na mesma nomenclatura que a API usa em `role`. */
export type CallParty = "dev" | "company";

/**
 * O que a entrevista e o live coding têm em comum: o horário negociado entre dev
 * e empresa e o registro da call. Os dois recursos gerados satisfazem esse formato.
 */
export interface ScheduledCall {
	id: string;
	title: string;
	scheduled_at: string | null;
	duration_in_minutes: string | number | null;
	status: string;
	ended_at: string | null;
}

export interface CallScheduleData {
	scheduled_at: string;
	duration_in_minutes: number;
}

export type CallSignalType = "offer" | "answer" | "candidate";

/** Resposta do `join`, igual nos dois recursos fora a chave com o próprio registro. */
export interface CallJoinData {
	channel: string;
	role: string;
	ice_servers: unknown;
}

/**
 * Chamadas da API de um tipo de call. A entrevista e o live coding expõem os mesmos
 * endpoints com prefixos diferentes, então os componentes e o motor da call recebem
 * este objeto em vez de importar as funções geradas de um deles.
 */
export interface ScheduledCallApi {
	/** Prefixo das rotas, usado no `leave` disparado ao fechar a aba. */
	basePath: string;
	setSchedule: (id: string, data: CallScheduleData) => Promise<unknown>;
	companyPropose: (id: string, data: CallScheduleData) => Promise<unknown>;
	devPropose: (id: string, data: CallScheduleData) => Promise<unknown>;
	companyAccept: (id: string) => Promise<unknown>;
	devAccept: (id: string) => Promise<unknown>;
	cancel: (id: string) => Promise<unknown>;
	join: (id: string) => Promise<{ data: CallJoinData }>;
	leave: (id: string) => Promise<unknown>;
	signal: (
		id: string,
		data: { type: CallSignalType; payload: string },
	) => Promise<unknown>;
}

/** Tipo de call: as chamadas da API e onde ficam os textos de cada um. */
export interface ScheduledCallKind {
	api: ScheduledCallApi;
	/** Prefixo das traduções da negociação e da sala (`interview`, `live_coding`). */
	i18nPrefix: string;
	/** Prefixo das traduções do status, ex.: `enum.dev_job_vacancy_interview.status`. */
	statusI18nPrefix: string;
}

/**
 * Janela de tolerância da API para entrar na call: liberada alguns minutos antes
 * do horário marcado e mantida por um tempo depois do fim previsto. Espelha as
 * constantes do `DevJobVacancyInterviewService` e do
 * `DevJobVacancyLiveCodingService`, que usam os mesmos valores.
 */
export const JOIN_WINDOW_BEFORE_MINUTES = 10;
const JOIN_WINDOW_GRACE_AFTER_MINUTES = 15;

export function getCallStatus(call: ScheduledCall): ScheduledCallStatus {
	return call.status as ScheduledCallStatus;
}

/**
 * `duration_in_minutes` chega como string no contrato gerado, então é convertido
 * aqui em vez de em cada tela.
 */
export function getCallDuration(call: ScheduledCall): number | undefined {
	const duration = Number(call.duration_in_minutes);

	return Number.isFinite(duration) && duration > 0 ? duration : undefined;
}

/** Início e fim previsto do horário vigente, ausente até a primeira proposta. */
export function getCallSchedule(
	call: ScheduledCall,
): { startsAt: Date; endsAt: Date } | undefined {
	if (!call.scheduled_at) return undefined;

	const startsAt = parseISO(call.scheduled_at);
	const duration = getCallDuration(call);

	if (!isValid(startsAt) || !duration) return undefined;

	return { startsAt, endsAt: addMinutes(startsAt, duration) };
}

/**
 * - `unavailable`: o horário ainda não foi confirmado pelos dois lados
 * - `too_early`: confirmado, mas a sala ainda não abriu
 * - `open`: dentro da janela de tolerância, a call pode acontecer
 * - `closed`: a janela passou ou a call já foi encerrada
 */
export type CallWindowState = "unavailable" | "too_early" | "open" | "closed";

export function getCallWindowState(
	call: ScheduledCall,
	now: Date = new Date(),
): CallWindowState {
	if (getCallStatus(call) !== "approved") return "unavailable";

	const schedule = getCallSchedule(call);

	if (!schedule) return "unavailable";

	// A saída de qualquer um dos dois encerra a call para os dois
	if (call.ended_at) return "closed";

	if (now < subMinutes(schedule.startsAt, JOIN_WINDOW_BEFORE_MINUTES)) {
		return "too_early";
	}

	if (now > addMinutes(schedule.endsAt, JOIN_WINDOW_GRACE_AFTER_MINUTES)) {
		return "closed";
	}

	return "open";
}

/** Se a bola está com o lado informado, ou seja, se ele precisa responder algo. */
export function callIsWaitingFor(
	call: ScheduledCall,
	party: CallParty,
): boolean {
	const status = getCallStatus(call);

	if (party === "company") {
		return (
			status === "awaiting_schedule" ||
			status === "awaiting_company_confirmation"
		);
	}

	return status === "awaiting_dev_confirmation";
}

/** Negociação encerrada, sem nenhuma ação possível além de visualizar. */
export function callIsClosed(call: ScheduledCall): boolean {
	const status = getCallStatus(call);

	return status === "cancelled" || status === "rejected";
}
