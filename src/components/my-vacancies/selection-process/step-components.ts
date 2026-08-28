import type { ComponentType } from "react";
import type { SelectionProcessStageEnum } from "@/api/generated/models";
import InterviewStep from "./interview-step";
import LanguageAssessmentStep from "./language-assessment-step";
import LiveCodingStep from "./live-coding-step";
import PortfolioReviewStep from "./portfolio-review-step";
import ResumeScreeningStep from "./resume-screening-step";
import ScreeningQuestionsStep from "./screening-questions-step";
import type { SelectionProcessStepProps } from "./step-props";
import TechnicalChallengeStep from "./technical-challenge-step";

/**
 * Componente responsável por cada etapa do processo seletivo.
 * As etapas `awaiting_*` são apenas estados de espera da API e não têm tela própria.
 */
export const SELECTION_PROCESS_STEP_COMPONENTS: Partial<
	Record<SelectionProcessStageEnum, ComponentType<SelectionProcessStepProps>>
> = {
	resume_screening: ResumeScreeningStep,
	screening_questions: ScreeningQuestionsStep,
	interview: InterviewStep,
	technical_challenge: TechnicalChallengeStep,
	live_coding: LiveCodingStep,
	language_assessment: LanguageAssessmentStep,
	portfolio_review: PortfolioReviewStep,
};
