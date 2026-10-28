import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { Lock, PencilIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getIndexStepAppliesQueryKey } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import {
	getShowJobVacancyQueryKey,
	useShowJobVacancy,
} from "@/api/generated/job-vacancy/job-vacancy";
import {
	getShowLanguageAssessmentQueryKey,
	useDestroyLanguageAssessment,
	useShowLanguageAssessment,
} from "@/api/generated/language-assessment/language-assessment";
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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useBreadcrumbLabel } from "@/hooks/use-breadcrumbs";
import { assessmentWasSentToCandidates } from "@/types/language-assessment";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import LanguageAssessmentForm from "./language-assessment-form";
import LanguageAssessmentView from "./language-assessment-view";

interface LanguageAssessmentManagerProps {
	vacancyId: string;
}

/**
 * Tela da empresa para montar e manter a prova de idioma da vaga.
 * A vaga aceita uma única prova, então a mesma tela cadastra, exibe e edita.
 */
export default function LanguageAssessmentManager({
	vacancyId,
}: LanguageAssessmentManagerProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const [isEditing, setIsEditing] = useState(false);
	const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	useBreadcrumbLabel(vacancy?.data.title);

	// A vaga sem prova responde 404, que aqui significa "ainda não cadastrada"
	const {
		data: assessmentResponse,
		isLoading,
		isError,
	} = useShowLanguageAssessment(vacancyId, {
		query: { retry: false },
	});

	const assessment = assessmentResponse?.data;

	const { mutateAsync: destroyAssessment, isPending: isDeleting } =
		useDestroyLanguageAssessment();

	// Depois de enviada aos candidatos a prova não pode mais ser alterada: mudar o
	// gabarito invalidaria as provas já corrigidas
	const wasSentToCandidates = assessmentWasSentToCandidates(assessment);

	const backToSelectionProcess = () =>
		navigate({
			to: "/my-vacancies/$id/selection-process",
			params: { id: vacancyId },
		});

	const handleDelete = async () => {
		if (!assessment) return;

		try {
			await destroyAssessment({ id: assessment.id });

			CustomToaster.successToast(
				t("toast.success.language_assessment_deleted"),
			);

			queryClient.invalidateQueries({
				queryKey: getShowLanguageAssessmentQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({
				queryKey: getShowJobVacancyQueryKey(vacancyId),
			});
			queryClient.invalidateQueries({
				queryKey: getIndexStepAppliesQueryKey(vacancyId),
			});

			setDeleteModalIsOpen(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	if (isLoading) {
		return (
			<Card className="w-full gap-4 p-8">
				<Skeleton className="h-9 w-96" />
				<Skeleton className="h-40 w-full" />
			</Card>
		);
	}

	if (isError || !assessment) {
		return (
			<Card className="w-full gap-4 p-8">
				<div className="flex flex-col gap-1">
					<h2 className="text-2xl font-bold">
						{t("language_assessment.create_title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("language_assessment.create_description")}
					</p>
				</div>
				<LanguageAssessmentForm
					vacancyId={vacancyId}
					onSaved={backToSelectionProcess}
					onCancel={backToSelectionProcess}
				/>
			</Card>
		);
	}

	if (isEditing) {
		return (
			<Card className="w-full gap-4 p-8">
				<div className="flex flex-col gap-1">
					<h2 className="text-2xl font-bold">
						{t("language_assessment.edit_title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("language_assessment.edit_description")}
					</p>
				</div>
				<LanguageAssessmentForm
					vacancyId={vacancyId}
					assessment={assessment}
					onSaved={() => setIsEditing(false)}
					onCancel={() => setIsEditing(false)}
				/>
			</Card>
		);
	}

	return (
		<Card className="w-full gap-4 p-8">
			<div className="flex flex-row flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h2 className="text-2xl font-bold">
						{t("language_assessment.title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("language_assessment.sent_count", {
							count: assessment.dev_assessments_count ?? 0,
						})}
					</p>
				</div>
				<div className="flex flex-row flex-wrap gap-2">
					<Button
						variant={"secondary"}
						disabled={wasSentToCandidates}
						onClick={() => setIsEditing(true)}
					>
						<PencilIcon />
						{t("language_assessment.edit")}
					</Button>
					<Button
						variant={"destructive"}
						disabled={wasSentToCandidates}
						onClick={() => setDeleteModalIsOpen(true)}
					>
						<Trash2 />
						{t("general.delete")}
					</Button>
				</div>
			</div>
			{wasSentToCandidates && (
				<Alert>
					<Lock />
					<AlertTitle>{t("language_assessment.locked_title")}</AlertTitle>
					<AlertDescription>
						{t("language_assessment.locked_description")}
					</AlertDescription>
				</Alert>
			)}
			<LanguageAssessmentView assessment={assessment} />
			<AlertDialog open={deleteModalIsOpen} onOpenChange={setDeleteModalIsOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("language_assessment.delete_confirm_title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("language_assessment.delete_confirm_description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setDeleteModalIsOpen(false)}>
							{t("general.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							variant={"destructive"}
							onClick={(event) => {
								// Evita que o dialog feche antes da resposta da API
								event.preventDefault();
								handleDelete();
							}}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? <Spinner /> : t("general.confirm")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
