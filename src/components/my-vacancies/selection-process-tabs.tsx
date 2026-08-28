import { useTranslation } from "react-i18next";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import type { SelectionProcessStageEnum } from "@/api/generated/models";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumbLabel } from "@/hooks/use-breadcrumbs";
import { SELECTION_PROCESS_STEP_COMPONENTS } from "./selection-process/step-components";

interface SelectionProcessTabsProps {
	vacancyId: string;
}

export default function SelectionProcessTabs({
	vacancyId,
}: SelectionProcessTabsProps) {
	const { t } = useTranslation();

	const { data: vacancy, isLoading } = useShowJobVacancy(vacancyId);

	const vacancyData = vacancy?.data;

	useBreadcrumbLabel(vacancyData?.title);

	// As etapas `awaiting_` são estados de espera do processo, não etapas próprias
	const steps = [...(vacancyData?.process_steps ?? [])]
		.filter((processStep) => !processStep.step.startsWith("awaiting_"))
		.sort((step, nextStep) => step.order - nextStep.order);

	if (isLoading) {
		return (
			<Card className="w-full gap-4 p-8">
				<Skeleton className="h-9 w-96" />
				<Skeleton className="h-40 w-full" />
			</Card>
		);
	}

	if (steps.length === 0) {
		return (
			<Card className="w-full gap-3 p-8">
				<h3 className="text-lg font-bold">
					{t("my_vacancies.selection_process.title")}
				</h3>
				<p className="text-sm text-muted-foreground">
					{t("general.no_results")}
				</p>
			</Card>
		);
	}

	return (
		<Card className="w-full gap-4 p-8">
			<Tabs defaultValue={steps[0].step}>
				<TabsList variant={"line"}>
					{steps.map((processStep) => (
						<TabsTrigger
							key={processStep.id}
							className="cursor-pointer"
							value={processStep.step}
						>
							{t(`enum.selection_process_stage.${processStep.step}`)}
						</TabsTrigger>
					))}
				</TabsList>
				{steps.map((processStep) => {
					// A API tipa `step` como string, mas o valor é sempre uma etapa do enum
					const StepContent =
						SELECTION_PROCESS_STEP_COMPONENTS[
							processStep.step as SelectionProcessStageEnum
						];

					return (
						<TabsContent
							key={processStep.id}
							value={processStep.step}
							className="mt-4"
						>
							{StepContent && (
								<StepContent
									vacancyId={vacancyId}
									processStepId={processStep.id}
								/>
							)}
						</TabsContent>
					);
				})}
			</Tabs>
		</Card>
	);
}
