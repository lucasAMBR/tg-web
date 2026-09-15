import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { ClipboardList, Lock, PencilIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import {
	getShowScreeningQuestionnaireQueryKey,
	useDestroyScreeningQuestionnaire,
	useShowScreeningQuestionnaire,
} from "@/api/generated/screening-questionnaire/screening-questionnaire";
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
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useBreadcrumbLabel } from "@/hooks/use-breadcrumbs";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import QuestionnaireForm from "./questionnaire-form";
import QuestionnaireView from "./questionnaire-view";

interface QuestionnaireManagerProps {
	vacancyId: string;
}

/**
 * Tela da empresa para montar e manter o questionário de triagem da vaga.
 * A vaga aceita um único questionário, então a mesma tela cadastra, exibe e edita.
 */
export default function QuestionnaireManager({
	vacancyId,
}: QuestionnaireManagerProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const [isEditing, setIsEditing] = useState(false);
	const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	useBreadcrumbLabel(vacancy?.data.title);

	// A vaga sem questionário responde 404, que aqui significa "ainda não criado"
	const {
		data: questionnaireResponse,
		isLoading,
		isError,
	} = useShowScreeningQuestionnaire(vacancyId, {
		query: { retry: false },
	});

	const questionnaire = questionnaireResponse?.data;

	const { mutateAsync: destroyQuestionnaire, isPending: isDeleting } =
		useDestroyScreeningQuestionnaire();

	// Depois de enviado aos candidatos o questionário não pode mais ser alterado
	const wasSentToCandidates =
		(questionnaire?.dev_questionnaires_count ?? 0) > 0;

	const backToSelectionProcess = () =>
		navigate({
			to: "/my-vacancies/$id/selection-process",
			params: { id: vacancyId },
		});

	const handleDelete = async () => {
		if (!questionnaire) return;

		try {
			await destroyQuestionnaire({ id: questionnaire.id });

			CustomToaster.successToast(
				t("toast.success.screening_questionnaire_deleted"),
			);

			queryClient.invalidateQueries({
				queryKey: getShowScreeningQuestionnaireQueryKey(vacancyId),
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

	if (isError || !questionnaire) {
		return (
			<Card className="w-full gap-4 p-8">
				<div className="flex flex-col gap-1">
					<h2 className="text-2xl font-bold">
						{t("screening_questionnaire.create_title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("screening_questionnaire.create_description")}
					</p>
				</div>
				<QuestionnaireForm
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
						{t("screening_questionnaire.edit_title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("screening_questionnaire.edit_description")}
					</p>
				</div>
				<QuestionnaireForm
					vacancyId={vacancyId}
					questionnaire={questionnaire}
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
						{t("screening_questionnaire.title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("screening_questionnaire.sent_count", {
							count: questionnaire.dev_questionnaires_count ?? 0,
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
						{t("screening_questionnaire.edit")}
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
					<AlertTitle>{t("screening_questionnaire.locked_title")}</AlertTitle>
					<AlertDescription>
						{t("screening_questionnaire.locked_description")}
					</AlertDescription>
				</Alert>
			)}
			{(questionnaire.questions ?? []).length > 0 ? (
				<QuestionnaireView questionnaire={questionnaire} />
			) : (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<ClipboardList />
						</EmptyMedia>
						<EmptyTitle>
							{t("screening_questionnaire.empty_questions_title")}
						</EmptyTitle>
						<EmptyDescription>
							{t("screening_questionnaire.empty_questions_description")}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => setIsEditing(true)}>
							<PencilIcon />
							{t("screening_questionnaire.edit")}
						</Button>
					</EmptyContent>
				</Empty>
			)}
			<AlertDialog open={deleteModalIsOpen} onOpenChange={setDeleteModalIsOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("screening_questionnaire.delete_confirm_title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("screening_questionnaire.delete_confirm_description")}
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
