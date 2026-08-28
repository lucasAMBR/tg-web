import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Check, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStoreDevJobVacancy } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import { getShowJobVacancyQueryKey } from "@/api/generated/job-vacancy/job-vacancy";
import type { JobVacancyStatusEnum } from "@/api/generated/models";
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
import { useMyAppliedVacancies } from "@/hooks/use-my-applied-vacancies";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { getUserMainRole } from "@/utils/role-helper";

interface ApplyVacancyButtonProps {
	vacancyId: string;
	status?: JobVacancyStatusEnum;
	size?: React.ComponentProps<typeof Button>["size"];
	variant?: React.ComponentProps<typeof Button>["variant"];
	className?: string;
}

export default function ApplyVacancyButton({
	vacancyId,
	status,
	size = "default",
	variant = "accent",
	className,
}: ApplyVacancyButtonProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const { user } = useAuthStore();

	const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);

	const { appliedVacancyIds, isLoading: appliesAreLoading } =
		useMyAppliedVacancies();

	const { mutateAsync: apply, isPending } = useStoreDevJobVacancy();

	const isDev = getUserMainRole(user) === "dev";
	const hasApplied = appliedVacancyIds.has(vacancyId);
	const inscriptionsAreOpen = status === "open_inscriptions";

	// Só desenvolvedores se candidatam, e sem inscrições abertas o botão só faz
	// sentido para indicar uma candidatura já enviada
	if (!isDev || (!inscriptionsAreOpen && !hasApplied)) return null;

	if (hasApplied) {
		return (
			<Button variant={"outline"} size={size} className={className} disabled>
				<Check />
				{t("vacancies.applied")}
			</Button>
		);
	}

	const handleApply = async () => {
		try {
			await apply({ jobVacancyId: vacancyId });

			CustomToaster.successToast(t("toast.success.vacancy_applied"));

			queryClient.invalidateQueries({ queryKey: ["/dev-vacancy/my-applies"] });
			queryClient.invalidateQueries({
				queryKey: getShowJobVacancyQueryKey(vacancyId),
			});

			setConfirmModalIsOpen(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<>
			<Button
				variant={variant}
				size={size}
				className={className}
				onClick={(event) => {
					// O botão pode estar dentro de um card clicável
					event.stopPropagation();
					setConfirmModalIsOpen(true);
				}}
				disabled={appliesAreLoading}
			>
				<Send />
				{t("vacancies.apply")}
			</Button>
			<AlertDialog
				open={confirmModalIsOpen}
				onOpenChange={setConfirmModalIsOpen}
			>
				<AlertDialogContent onClick={(event) => event.stopPropagation()}>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("vacancies.apply_confirm")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("vacancies.apply_confirm_description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmModalIsOpen(false)}>
							{t("general.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								// Evita que o dialog feche antes da resposta da API
								event.preventDefault();
								handleApply();
							}}
							disabled={isPending}
						>
							{isPending ? <Spinner /> : t("general.confirm")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
