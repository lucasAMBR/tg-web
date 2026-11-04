import { useQueryClient } from "@tanstack/react-query";
import { type AxiosError, isAxiosError } from "axios";
import { MailPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStoreJobVacancyInvitation } from "@/api/generated/job-vacancy-invitation/job-vacancy-invitation";
import type { RecommendDevsForJobVacancy200 } from "@/api/generated/models";
import { getRecommendDevsForJobVacancyQueryKey } from "@/api/generated/recommendation/recommendation";
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
import { Spinner } from "@/components/ui/spinner";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

interface InviteDevDialogProps {
	jobVacancyId: string;
	devProfileId: string;
	devName?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Confirma o convite de um dev recomendado para o processo seletivo. O backend
 * manda o convite como mensagem no chat, em nome da empresa, com o link da vaga.
 */
export default function InviteDevDialog({
	jobVacancyId,
	devProfileId,
	devName,
	open,
	onOpenChange,
}: InviteDevDialogProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { mutate: invite, isPending } = useStoreJobVacancyInvitation();

	// Sem os params: pega a recomendação da vaga com qualquer `limit`
	const recommendationsKey =
		getRecommendDevsForJobVacancyQueryKey(jobVacancyId);

	const name = devName ?? t("my_vacancies.recommended.invite.this_dev");

	const handleInvite = () => {
		invite(
			{ id: jobVacancyId, data: { dev_profile_id: devProfileId } },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.job_vacancy_invitation_sent", { name }),
					);

					// Marca o convite na própria lista, sem recarregar
					queryClient.setQueriesData<RecommendDevsForJobVacancy200>(
						{ queryKey: recommendationsKey },
						(current) =>
							current && {
								...current,
								data: current.data.map((item) =>
									item.dev_profile.id === devProfileId
										? { ...item, is_invited: true }
										: item,
								),
							},
					);

					onOpenChange(false);
				},
				onError: (error) => {
					// Já convidado, já candidatado ou inscrições encerradas: a lista
					// recarregada mostra o estado certo no menu
					if (isAxiosError(error) && error.response?.status === 422) {
						CustomToaster.errorToast(
							t("my_vacancies.recommended.invite.conflict"),
						);
						queryClient.invalidateQueries({ queryKey: recommendationsKey });
						onOpenChange(false);
						return;
					}

					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t("my_vacancies.recommended.invite.title", { name })}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t("my_vacancies.recommended.invite.description", { name })}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>
						{t("general.cancel")}
					</AlertDialogCancel>
					<AlertDialogAction
						disabled={isPending}
						onClick={(event) => {
							// Mantém o modal aberto até a resposta da API
							event.preventDefault();
							handleInvite();
						}}
					>
						{isPending ? <Spinner /> : <MailPlus />}
						{t("my_vacancies.recommended.invite.confirm")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
