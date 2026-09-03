import { addMinutes, isValid, parseISO, subMinutes } from "date-fns";
import type {
	DevJobVacancyInterviewResource,
	DevJobVacancyResource,
} from "@/api/generated/models";

/**
 * O contrato gerado tipa `status` como `string`, mas os valores são sempre os do
 * enum `DevJobVacancyInterviewStatusEnum` da API.
 */
export type InterviewStatus =
	| "awaiting_schedule"
	| "awaiting_dev_confirmation"
	| "awaiting_company_confirmation"
	| "approved"
	| "cancelled"
	| "rejected";

/** Lado da negociação, na mesma nomenclatura que a API usa em `role`. */
export type InterviewParty = "dev" | "company";

/**
 * Janela de tolerância da API para entrar na call: liberada alguns minutos antes
 * do horário marcado e mantida por um tempo depois do fim previsto.
 * Espelha as constantes do `DevJobVacancyInterviewService`.
 */
const JOIN_WINDOW_BEFORE_MINUTES = 10;
const JOIN_WINDOW_GRACE_AFTER_MINUTES = 15;

export const INTERVIEW_JOIN_WINDOW_BEFORE_MINUTES = JOIN_WINDOW_BEFORE_MINUTES;

/**
 * Entrevista da candidatura. A API só carrega a relação na etapa `interview`, e
 * o recurso vem `null` quando a candidatura ainda não chegou lá.
 */
export function getInterview(
	apply: DevJobVacancyResource,
): DevJobVacancyInterviewResource | undefined {
	return apply.interview ?? undefined;
}

export function getInterviewStatus(
	interview: DevJobVacancyInterviewResource,
): InterviewStatus {
	return interview.status as InterviewStatus;
}

/**
 * `duration_in_minutes` chega como string no contrato gerado, então é convertido
 * aqui em vez de em cada tela.
 */
export function getInterviewDuration(
	interview: DevJobVacancyInterviewResource,
): number | undefined {
	const duration = Number(interview.duration_in_minutes);

	return Number.isFinite(duration) && duration > 0 ? duration : undefined;
}

/** Início e fim previsto do horário vigente, ausente até a primeira proposta. */
export function getInterviewSchedule(
	interview: DevJobVacancyInterviewResource,
): { startsAt: Date; endsAt: Date } | undefined {
	if (!interview.scheduled_at) return undefined;

	const startsAt = parseISO(interview.scheduled_at);
	const duration = getInterviewDuration(interview);

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
	interview: DevJobVacancyInterviewResource,
	now: Date = new Date(),
): CallWindowState {
	if (getInterviewStatus(interview) !== "approved") return "unavailable";

	const schedule = getInterviewSchedule(interview);

	if (!schedule) return "unavailable";

	// A saída de qualquer um dos dois encerra a call para os dois
	if (interview.ended_at) return "closed";

	if (now < subMinutes(schedule.startsAt, JOIN_WINDOW_BEFORE_MINUTES)) {
		return "too_early";
	}

	if (now > addMinutes(schedule.endsAt, JOIN_WINDOW_GRACE_AFTER_MINUTES)) {
		return "closed";
	}

	return "open";
}

/** Se a bola está com o lado informado, ou seja, se ele precisa responder algo. */
export function interviewIsWaitingFor(
	interview: DevJobVacancyInterviewResource,
	party: InterviewParty,
): boolean {
	const status = getInterviewStatus(interview);

	if (party === "company") {
		return (
			status === "awaiting_schedule" ||
			status === "awaiting_company_confirmation"
		);
	}

	return status === "awaiting_dev_confirmation";
}

/** Negociação encerrada, sem nenhuma ação possível além de visualizar. */
export function interviewIsClosed(
	interview: DevJobVacancyInterviewResource,
): boolean {
	const status = getInterviewStatus(interview);

	return status === "cancelled" || status === "rejected";
}
