import { useTranslation } from "react-i18next";
import { useStepResults } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import type { SelectionProcessStageEnum } from "@/api/generated/models";
import { Skeleton } from "@/components/ui/skeleton";
import StepApplyCard from "./step-apply-card";

interface StepResultsListProps {
	vacancyId: string;
	processStep: SelectionProcessStageEnum;
}

/** Aprovados e recusados de uma etapa que o processo seletivo já deixou para trás. */
export default function StepResultsList({
	vacancyId,
	processStep,
}: StepResultsListProps) {
	const { t } = useTranslation();

	const { data: results, isLoading } = useStepResults(vacancyId, {
		process_step: processStep,
	});

	const approved = results?.data.approved ?? [];
	const rejectedInStep = results?.data.rejected_in_step ?? [];

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h4 className="font-medium">
					{t("my_vacancies.selection_process.results.approved_title")}
				</h4>
				{approved.length > 0 ? (
					approved.map((apply) => (
						<StepApplyCard key={apply.id} apply={apply} />
					))
				) : (
					<p className="text-sm text-muted-foreground">
						{t("general.no_results")}
					</p>
				)}
			</div>
			<div className="flex flex-col gap-2">
				<h4 className="font-medium">
					{t("my_vacancies.selection_process.results.rejected_title")}
				</h4>
				{rejectedInStep.length > 0 ? (
					rejectedInStep.map((apply) => (
						<StepApplyCard key={apply.id} apply={apply} />
					))
				) : (
					<p className="text-sm text-muted-foreground">
						{t("general.no_results")}
					</p>
				)}
			</div>
		</div>
	);
}
