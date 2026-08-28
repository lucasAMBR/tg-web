import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CheckCheck, ListChecks, Users } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	getIndexStepAppliesQueryKey,
	getStepResultsQueryKey,
	useAdvanceStep,
	useIndexStepApplies,
} from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { getShowJobVacancyQueryKey } from "@/api/generated/job-vacancy/job-vacancy";
import type {
	DevJobVacancyResource,
	SelectionProcessStageEnum,
} from "@/api/generated/models";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useStepSelection } from "@/hooks/use-step-selection";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import StepApplyCard from "./step-apply-card";

interface StepAppliesListProps {
	vacancyId: string;
	processStep: SelectionProcessStageEnum;
	/** Dados próprios da etapa, exibidos dentro do card de cada candidatura. */
	renderApplyExtra?: (apply: DevJobVacancyResource) => ReactNode;
}

/** Candidaturas paradas na etapa informada, aguardando avaliação. */
export default function StepAppliesList({
	vacancyId,
	processStep,
	renderApplyExtra,
}: StepAppliesListProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const [advanceModalIsOpen, setAdvanceModalIsOpen] = useState(false);

	const { data: applies, isLoading } = useIndexStepApplies(vacancyId, {
		process_step: processStep,
	});

	const applyList = useMemo(() => applies?.data ?? [], [applies]);

	const applyIds = useMemo(
		() => applyList.map((apply) => apply.id),
		[applyList],
	);

	const { selectedIds, isSelected, toggle, selectAll, clear } =
		useStepSelection({
			vacancyId,
			processStep,
			availableIds: applyIds,
		});

	const { mutateAsync: advanceStep, isPending } = useAdvanceStep();

	// Quem não for selecionado é recusado pela API ao encerrar a etapa
	const rejectedCount = applyList.length - selectedIds.length;

	const handleAdvanceStep = async () => {
		try {
			await advanceStep({
				jobVacancyId: vacancyId,
				data: { apply_ids: selectedIds },
			});

			CustomToaster.successToast(t("toast.success.step_advanced"));

			clear();

			queryClient.invalidateQueries({
				queryKey: getIndexStepAppliesQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({
				queryKey: getStepResultsQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({
				queryKey: getShowJobVacancyQueryKey(vacancyId),
			});

			setAdvanceModalIsOpen(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	if (applyList.length === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<Users />
					</EmptyMedia>
					<EmptyTitle>
						{t("my_vacancies.selection_process.empty_applies_title")}
					</EmptyTitle>
					<EmptyDescription>
						{t("my_vacancies.selection_process.empty_applies_description")}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-row flex-wrap gap-2 justify-end">
				<Button
					disabled={selectedIds.length === 0}
					onClick={() => setAdvanceModalIsOpen(true)}
				>
					<CheckCheck />
					{t("my_vacancies.selection_process.approve_selected")}
				</Button>
				<Button variant={"secondary"} onClick={() => selectAll(applyIds)}>
					<ListChecks />
					{t("my_vacancies.selection_process.select_all")}
				</Button>
			</div>
			{applyList.map((apply) => (
				<StepApplyCard
					key={apply.id}
					apply={apply}
					selected={isSelected(apply.id)}
					onSelectedChange={(selected) => toggle(apply.id, selected)}
				>
					{renderApplyExtra?.(apply)}
				</StepApplyCard>
			))}
			<AlertDialog
				open={advanceModalIsOpen}
				onOpenChange={setAdvanceModalIsOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("my_vacancies.selection_process.advance_confirm")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("my_vacancies.selection_process.advance_confirm_description", {
								approved: selectedIds.length,
								rejected: rejectedCount,
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setAdvanceModalIsOpen(false)}>
							{t("general.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								// Evita que o dialog feche antes da resposta da API
								event.preventDefault();
								handleAdvanceStep();
							}}
							disabled={isPending}
						>
							{isPending ? <Spinner /> : t("general.confirm")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
