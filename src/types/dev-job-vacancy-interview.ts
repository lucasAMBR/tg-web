import type {
	DevJobVacancyInterviewResource,
	DevJobVacancyResource,
} from "@/api/generated/models";

/**
 * Entrevista da candidatura. A API só carrega a relação na etapa `interview`, e
 * o recurso vem `null` quando a candidatura ainda não chegou lá.
 *
 * O horário, a janela da call e o status são comuns ao live coding e ficam em
 * `scheduled-call.ts`.
 */
export function getInterview(
	apply: DevJobVacancyResource,
): DevJobVacancyInterviewResource | undefined {
	return apply.interview ?? undefined;
}
