import type {
	DevJobVacancyLiveCodingResource,
	DevJobVacancyResource,
} from "@/api/generated/models";

/**
 * Live coding da candidatura. A API carrega a relação na etapa `live_coding` e
 * também na espera `awaiting_live_coding`, quando o registro já existe mas o
 * exercício ainda não foi publicado.
 *
 * O horário, a janela da call e o status são comuns à entrevista e ficam em
 * `scheduled-call.ts`.
 */
export function getLiveCoding(
	apply: DevJobVacancyResource,
): DevJobVacancyLiveCodingResource | undefined {
	return apply.live_coding ?? undefined;
}

/** O enunciado vem `null` até a empresa publicar o exercício. */
export function liveCodingHasExercise(
	liveCoding?: DevJobVacancyLiveCodingResource,
): boolean {
	return !!liveCoding?.statement?.trim();
}

/** Quantos live codings ainda não têm exercício — a etapa só começa sem nenhum. */
export function countMissingExercises(
	applies: DevJobVacancyResource[],
): number {
	return applies.filter((apply) => !liveCodingHasExercise(getLiveCoding(apply)))
		.length;
}
