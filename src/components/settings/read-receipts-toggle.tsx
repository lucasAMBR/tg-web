import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import type { UserUserUpdate0200 } from "@/api/generated/models";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthenticatedUser } from "@/types/AuthenticatedUser";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

/**
 * Liga e desliga a confirmação de leitura do chat. A regra é recíproca: desligada,
 * quem mandou não fica sabendo que o usuário leu — e o usuário também deixa de ver
 * a leitura das mensagens dele.
 */
export default function ReadReceiptsToggle() {
	const { t } = useTranslation();

	const user = useAuthStore((state) => state.user);
	const setUser = useAuthStore((state) => state.setUser);

	const enabled = user?.read_receipts_enabled ?? true;

	const { mutate: updateReadReceipts, isPending } = useMutation({
		// O `PATCH /user/{id}` gerado monta `multipart/form-data` (por causa da foto
		// de perfil), e aí o boolean viraria a string "true"/"false", recusada pela
		// validação. Este campo precisa ir como JSON
		mutationFn: (readReceiptsEnabled: boolean) =>
			apiClient<UserUserUpdate0200>({
				url: `/user/${user?.id}`,
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				data: { read_receipts_enabled: readReceiptsEnabled },
			}),
	});

	const handleChange = (readReceiptsEnabled: boolean) => {
		updateReadReceipts(readReceiptsEnabled, {
			onSuccess: () => {
				if (user) {
					setUser({
						...user,
						read_receipts_enabled: readReceiptsEnabled,
					} as AuthenticatedUser);
				}

				CustomToaster.successToast(t("toast.success.read_receipts_updated"));
			},
			onError: (error) => onError(error as AxiosError<{ message: string }>),
		});
	};

	return (
		<Card className="flex flex-row items-center justify-between gap-4 p-4">
			<p className="text-sm">
				{enabled
					? t("settings.account.read_receipts.enabled")
					: t("settings.account.read_receipts.disabled")}
			</p>
			<Switch
				checked={enabled}
				disabled={isPending || !user}
				onCheckedChange={handleChange}
				aria-label={t("settings.account.read_receipts.title")}
			/>
		</Card>
	);
}
