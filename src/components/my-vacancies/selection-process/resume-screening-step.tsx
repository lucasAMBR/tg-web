import { Hourglass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import { SelectionProcessStageEnum } from "@/api/generated/models";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import StepAppliesList from "./step-applies-list";
import type { SelectionProcessStepProps } from "./step-props";
import StepResultsList from "./step-results-list";
import { getStepStatus } from "./step-status";

const STAGE = SelectionProcessStageEnum.resume_screening;

export default function ResumeScreeningStep({
	vacancyId,
}: SelectionProcessStepProps) {
	const { t } = useTranslation();

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	const status = getStepStatus(STAGE, vacancy?.data);

	// Enquanto as inscrições não são encerradas a vaga fica aguardando a triagem
	if (status === "awaiting") {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<Hourglass />
					</EmptyMedia>
					<EmptyTitle>
						{t(
							"my_vacancies.selection_process.resume_screening.awaiting_title",
						)}
					</EmptyTitle>
					<EmptyDescription>
						{t(
							"my_vacancies.selection_process.resume_screening.awaiting_description",
						)}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (status === "current") {
		return <StepAppliesList vacancyId={vacancyId} processStep={STAGE} />;
	}

	if (status === "done") {
		return <StepResultsList vacancyId={vacancyId} processStep={STAGE} />;
	}

	return null;
}
