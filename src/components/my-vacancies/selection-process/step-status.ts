import type {
	JobVacancyResource,
	SelectionProcessStageEnum,
} from "@/api/generated/models";

/**
 * - `awaiting`: a vaga está no estado de espera que antecede a etapa
 * - `current`: a etapa está em andamento
 * - `done`: o processo já passou por essa etapa
 * - `upcoming`: a etapa ainda vai acontecer
 */
export type StepStatus = "awaiting" | "current" | "done" | "upcoming";

export function getStepStatus(
	stage: SelectionProcessStageEnum,
	vacancy?: JobVacancyResource,
): StepStatus {
	const currentStage = vacancy?.process_step;

	if (!currentStage) return "upcoming";

	// `awaiting_x` significa que a vaga aguarda o início da etapa `x`
	const currentBaseStage = currentStage.replace(/^awaiting_/, "");

	if (currentBaseStage === stage) {
		return currentStage.startsWith("awaiting_") ? "awaiting" : "current";
	}

	// A ordem das etapas é definida por vaga, então não dá para usar a ordem do enum
	const steps = vacancy?.process_steps ?? [];
	const stageOrder = steps.find((step) => step.step === stage)?.order;
	const currentOrder = steps.find(
		(step) => step.step === currentBaseStage,
	)?.order;

	if (stageOrder === undefined || currentOrder === undefined) return "upcoming";

	return stageOrder < currentOrder ? "done" : "upcoming";
}
