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
	getShowTechnicalChallengeQueryKey,
	useDestroyTechnicalChallenge,
	useShowTechnicalChallenge,
} from "@/api/generated/technical-challenge/technical-challenge";
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
import { challengeWasSentToCandidates } from "@/types/technical-challenge";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import GuideDocumentManager from "./guide-document-manager";
import TechnicalChallengeForm from "./technical-challenge-form";
import TechnicalChallengeView from "./technical-challenge-view";

interface TechnicalChallengeManagerProps {
	vacancyId: string;
}

/**
 * Tela da empresa para montar e manter o desafio técnico da vaga.
 * A vaga aceita um único desafio, então a mesma tela cadastra, exibe e edita.
 */
export default function TechnicalChallengeManager({
	vacancyId,
}: TechnicalChallengeManagerProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const [isEditing, setIsEditing] = useState(false);
	const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	useBreadcrumbLabel(vacancy?.data.title);

	// A vaga sem desafio responde 404, que aqui significa "ainda não cadastrado"
	const {
		data: challengeResponse,
		isLoading,
		isError,
	} = useShowTechnicalChallenge(vacancyId, {
		query: { retry: false },
	});

	const challenge = challengeResponse?.data;

	const { mutateAsync: destroyChallenge, isPending: isDeleting } =
		useDestroyTechnicalChallenge();

	// Depois de enviado aos candidatos o enunciado não pode mais ser alterado
	const wasSentToCandidates = challengeWasSentToCandidates(challenge);

	const backToSelectionProcess = () =>
		navigate({
			to: "/my-vacancies/$id/selection-process",
			params: { id: vacancyId },
		});

	const handleDelete = async () => {
		if (!challenge) return;

		try {
			await destroyChallenge({ id: challenge.id });

			CustomToaster.successToast(
				t("toast.success.technical_challenge_deleted"),
			);

			queryClient.invalidateQueries({
				queryKey: getShowTechnicalChallengeQueryKey(vacancyId),
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

	if (isError || !challenge) {
		return (
			<Card className="w-full gap-4 p-8">
				<div className="flex flex-col gap-1">
					<h2 className="text-2xl font-bold">
						{t("technical_challenge.create_title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("technical_challenge.create_description")}
					</p>
				</div>
				<TechnicalChallengeForm
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
						{t("technical_challenge.edit_title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("technical_challenge.edit_description")}
					</p>
				</div>
				<TechnicalChallengeForm
					vacancyId={vacancyId}
					challenge={challenge}
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
						{t("technical_challenge.title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t("technical_challenge.sent_count", {
							count: challenge.dev_challenges_count ?? 0,
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
						{t("technical_challenge.edit")}
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
					<AlertTitle>{t("technical_challenge.locked_title")}</AlertTitle>
					<AlertDescription>
						{t("technical_challenge.locked_description")}
					</AlertDescription>
				</Alert>
			)}
			<TechnicalChallengeView challenge={challenge} />
			{/* O guia continua editável mesmo com a etapa em andamento */}
			<GuideDocumentManager vacancyId={vacancyId} challenge={challenge} />
			<AlertDialog open={deleteModalIsOpen} onOpenChange={setDeleteModalIsOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("technical_challenge.delete_confirm_title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("technical_challenge.delete_confirm_description")}
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
