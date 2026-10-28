import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FreelanceFeedPostTypeEnum } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useStoreFreelanceFeedPost } from "@/hooks/use-freelance-feed";
import { invalidateFreelanceData } from "@/hooks/use-freelance-lists";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import {
	FREELANCE_FEED_CONTENT_MAX_LENGTH,
	FreelanceFeedPostType,
	type FreelanceVacancy,
	validateFeedFiles,
} from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import {
	freelanceErrorMessageKey,
	freelanceFieldErrors,
} from "@/utils/freelance-error";
import { FreelanceFeedFilePicker } from "./freelance-feed-attachments";

/**
 * Valida o texto e os anexos com os mesmos limites da API. Devolve a mensagem
 * do primeiro problema, ou `null`.
 */
export function useFeedPostValidation() {
	const { t } = useTranslation();

	return (content: string, files: File[]): string | null => {
		if (!content && files.length === 0) {
			return t("freelance.feed.errors.content_required");
		}

		if (content.length > FREELANCE_FEED_CONTENT_MAX_LENGTH) {
			return t("freelance.feed.errors.content_max");
		}

		const filesError = validateFeedFiles(
			files,
			new TextEncoder().encode(content).length,
		);

		return filesError ? t(filesError.key, filesError.values) : null;
	};
}

/**
 * Erro do envio para o usuário: os de validação (`content`, `attachments.1`...)
 * viram a lista de mensagens da API; os de regra (o freela foi concluído) viram
 * o aviso do contexto e recarregam o freela.
 */
export function useFeedPostErrorHandler(vacancyId: string) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	return (error: unknown): string | null => {
		const fieldErrors = freelanceFieldErrors(error);

		if (fieldErrors) return Object.values(fieldErrors).flat().join(" ");

		CustomToaster.errorToast(t(freelanceErrorMessageKey(error, "feed")));
		invalidateFreelanceData(queryClient, vacancyId);

		return null;
	};
}

/**
 * Composer do feed, só com o freela `in_progress`. O cliente posta atualização;
 * o dev contratado escolhe entre atualização e entrega. A review sai das ações
 * da própria entrega.
 */
export default function FreelanceFeedComposer({
	vacancy,
}: {
	vacancy: FreelanceVacancy;
}) {
	const { t } = useTranslation();

	const { feedPostTypes } = useFreelancePermissions();

	const types = feedPostTypes(vacancy);

	const [type, setType] = useState<FreelanceFeedPostTypeEnum>(
		FreelanceFeedPostType.update,
	);
	const [content, setContent] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null);

	const validate = useFeedPostValidation();
	const handleError = useFeedPostErrorHandler(vacancy.id);

	const { mutate: publish, isPending } = useStoreFreelanceFeedPost(vacancy.id);

	if (types.length === 0) return null;

	const submit = () => {
		const trimmed = content.trim();

		const validationError = validate(trimmed, files);

		setError(validationError);

		if (validationError) return;

		publish(
			{ type, content: trimmed || undefined, attachments: files },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.freelance_feed_post_created"),
					);
					setContent("");
					setFiles([]);
					setError(null);
				},
				onError: (submitError) => setError(handleError(submitError)),
			},
		);
	};

	return (
		<Card className="w-full gap-3 p-4">
			{types.length > 1 && (
				<ToggleGroup
					type="single"
					variant={"outline"}
					className="self-start"
					aria-label={t("freelance.feed.post_type")}
					value={type}
					onValueChange={(value) => {
						if (value) setType(value as FreelanceFeedPostTypeEnum);
					}}
				>
					{types.map((value) => (
						<ToggleGroupItem key={value} value={value} className="px-4">
							{t(`enum.freelance_feed_post_type.${value}`)}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			)}
			<Textarea
				value={content}
				onChange={(event) => setContent(event.target.value)}
				rows={3}
				maxLength={FREELANCE_FEED_CONTENT_MAX_LENGTH}
				disabled={isPending}
				placeholder={
					type === FreelanceFeedPostType.deliverable
						? t("freelance.feed.deliverable_placeholder")
						: t("freelance.feed.content_placeholder")
				}
				aria-invalid={!!error}
			/>
			<FreelanceFeedFilePicker
				files={files}
				onChange={(next) => {
					setFiles(next);
					setError(null);
				}}
				disabled={isPending}
			/>
			{error && <FieldError>{error}</FieldError>}
			<Button className="self-end" onClick={submit} disabled={isPending}>
				{isPending ? (
					<Spinner className="size-4" />
				) : (
					<Send className="size-4" />
				)}
				{t("freelance.feed.publish")}
			</Button>
		</Card>
	);
}
