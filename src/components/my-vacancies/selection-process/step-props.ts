/** Props recebidas por todo componente de etapa do processo seletivo. */
export interface SelectionProcessStepProps {
	vacancyId: string;
	/** Id do `process_step` da vaga, não o valor do enum da etapa. */
	processStepId: string;
}
