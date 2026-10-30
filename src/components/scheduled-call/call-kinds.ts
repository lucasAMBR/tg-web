import {
	cancelDevJobVacancyInterview,
	companyAcceptScheduleDevJobVacancyInterview,
	companyProposeScheduleDevJobVacancyInterview,
	devAcceptScheduleDevJobVacancyInterview,
	devProposeScheduleDevJobVacancyInterview,
	joinDevJobVacancyInterview,
	leaveDevJobVacancyInterview,
	setInitialScheduleDevJobVacancyInterview,
	signalDevJobVacancyInterview,
} from "@/api/generated/dev-job-vacancy-interview/dev-job-vacancy-interview";
import {
	cancelDevJobVacancyLiveCoding,
	companyAcceptScheduleDevJobVacancyLiveCoding,
	companyProposeScheduleDevJobVacancyLiveCoding,
	devAcceptScheduleDevJobVacancyLiveCoding,
	devProposeScheduleDevJobVacancyLiveCoding,
	joinDevJobVacancyLiveCoding,
	leaveDevJobVacancyLiveCoding,
	setInitialScheduleDevJobVacancyLiveCoding,
	signalDevJobVacancyLiveCoding,
} from "@/api/generated/dev-job-vacancy-live-coding/dev-job-vacancy-live-coding";
import type { ScheduledCallKind } from "@/types/scheduled-call";

export const INTERVIEW_CALL: ScheduledCallKind = {
	i18nPrefix: "interview",
	statusI18nPrefix: "enum.dev_job_vacancy_interview.status",
	api: {
		basePath: "/dev-vacancy-interview",
		setSchedule: setInitialScheduleDevJobVacancyInterview,
		companyPropose: companyProposeScheduleDevJobVacancyInterview,
		devPropose: devProposeScheduleDevJobVacancyInterview,
		companyAccept: companyAcceptScheduleDevJobVacancyInterview,
		devAccept: devAcceptScheduleDevJobVacancyInterview,
		cancel: cancelDevJobVacancyInterview,
		join: joinDevJobVacancyInterview,
		leave: leaveDevJobVacancyInterview,
		signal: signalDevJobVacancyInterview,
	},
};

/**
 * Mesma negociação e mesma call da entrevista, em outro prefixo e outro canal —
 * com o compartilhamento de tela, para o código ser acompanhado ao vivo.
 */
export const LIVE_CODING_CALL: ScheduledCallKind = {
	i18nPrefix: "live_coding",
	statusI18nPrefix: "enum.dev_job_vacancy_live_coding.status",
	screenShare: true,
	api: {
		basePath: "/dev-vacancy-live-coding",
		setSchedule: setInitialScheduleDevJobVacancyLiveCoding,
		companyPropose: companyProposeScheduleDevJobVacancyLiveCoding,
		devPropose: devProposeScheduleDevJobVacancyLiveCoding,
		companyAccept: companyAcceptScheduleDevJobVacancyLiveCoding,
		devAccept: devAcceptScheduleDevJobVacancyLiveCoding,
		cancel: cancelDevJobVacancyLiveCoding,
		join: joinDevJobVacancyLiveCoding,
		leave: leaveDevJobVacancyLiveCoding,
		signal: signalDevJobVacancyLiveCoding,
	},
};
