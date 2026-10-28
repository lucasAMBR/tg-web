import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import {
	LockIcon,
	PencilIcon,
	TriangleAlert,
	WorkflowIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIndexApplies } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import {
	getShowJobVacancyQueryKey,
	useCloseJobVacancyInscriptions,
} from "@/api/generated/job-vacancy/job-vacancy";
import type {
	IndexAppliesParams,
	JobVacancyResource,
} from "@/api/generated/models";
import UpdateVacancyModal from "@/components/my-vacancies/update-vacancy-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

interface VacancyActionsProps {
	vacancyId: string;
	status?: string;
	vacancy?: JobVacancyResource;
}

export default function VacancyActions({
	vacancyId,
	status,
	vacancy,
}: VacancyActionsProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const [closeModalIsOpen, setCloseModalIsOpen] = useState(false);
	const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);

	const { mutateAsync: closeInscriptions, isPending } =
		useCloseJobVacancyInscriptions();

	// Só precisamos do total de candidaturas, então buscamos a menor página possível
	const appliesParams: IndexAppliesParams & { job_vacancy_id: string } = {
		page: 1,
		per_page: 1,
		job_vacancy_id: vacancyId,
	};

	const { data: applies, isLoading: appliesAreLoading } =
		useIndexApplies(appliesParams);

	const inscriptionsAreOpen = status === "open_inscriptions";

	// O aviso só faz sentido enquanto ainda é possível receber candidaturas
	const hasNoApplies =
		inscriptionsAreOpen &&
		!appliesAreLoading &&
		(applies?.data.pagination.total ?? 0) === 0;

	const handleCloseInscriptions = async () => {
		try {
			await closeInscriptions({ id: vacancyId });

			CustomToaster.successToast(
				t("toast.success.job_vacancy_inscriptions_closed"),
			);

			queryClient.invalidateQueries({
				queryKey: getShowJobVacancyQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({ queryKey: ["/job-vacancy"] });

			setCloseModalIsOpen(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<>
			{hasNoApplies && (
				<Alert variant={"destructive"}>
					<TriangleAlert />
					<AlertTitle>{t("my_vacancies.actions.no_applies_title")}</AlertTitle>
					<AlertDescription>
						{t("my_vacancies.actions.no_applies_description")}
					</AlertDescription>
				</Alert>
			)}
			<div className="flex flex-row flex-wrap gap-2">
				<Button
					variant={"secondary"}
					onClick={() =>
						navigate({
							to: "/my-vacancies/$id/selection-process",
							params: { id: vacancyId },
						})
					}
				>
					<WorkflowIcon />
					{t("my_vacancies.actions.view_selection_process")}
				</Button>
				<Button
					variant={"secondary"}
					disabled={!vacancy}
					onClick={() => setUpdateModalIsOpen(true)}
				>
					<PencilIcon />
					{t("my_vacancies.actions.update_vacancy")}
				</Button>
				<Button
					variant={"destructive"}
					disabled={!inscriptionsAreOpen}
					onClick={() => setCloseModalIsOpen(true)}
				>
					<LockIcon />
					{t("my_vacancies.actions.close_inscriptions")}
				</Button>
			</div>
			{vacancy && (
				<UpdateVacancyModal
					open={updateModalIsOpen}
					onOpenChange={setUpdateModalIsOpen}
					vacancy={vacancy}
				/>
			)}
			<AlertDialog open={closeModalIsOpen} onOpenChange={setCloseModalIsOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("my_vacancies.actions.close_inscriptions")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("my_vacancies.actions.close_inscriptions_description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setCloseModalIsOpen(false)}>
							{t("general.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							variant={"destructive"}
							onClick={handleCloseInscriptions}
							disabled={isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isPending ? <Spinner /> : t("general.confirm")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
