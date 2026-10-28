import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Paperclip, Trash2 } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TechnicalChallengeResource } from "@/api/generated/models";
import {
	getShowTechnicalChallengeQueryKey,
	useRemoveTechnicalChallengeGuideDocument,
	useSaveTechnicalChallengeGuideDocument,
} from "@/api/generated/technical-challenge/technical-challenge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	GUIDE_DOCUMENT_EXTENSIONS,
	MAX_CHALLENGE_FILE_SIZE,
} from "@/schemas/technical-challenge/TechnicalChallengeSchema";
import { getGuideDocument } from "@/types/technical-challenge";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import ChallengeFileLink from "./challenge-file-link";

interface GuideDocumentManagerProps {
	vacancyId: string;
	challenge: TechnicalChallengeResource;
}

/**
 * Documento guia do desafio. A coleção é de arquivo único, então um novo envio
 * substitui o anterior — e continua liberado mesmo com a etapa em andamento.
 */
export default function GuideDocumentManager({
	vacancyId,
	challenge,
}: GuideDocumentManagerProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const guideDocument = getGuideDocument(challenge);

	const { mutateAsync: saveGuideDocument, isPending: isSaving } =
		useSaveTechnicalChallengeGuideDocument();

	const { mutateAsync: removeGuideDocument, isPending: isRemoving } =
		useRemoveTechnicalChallengeGuideDocument();

	const isPending = isSaving || isRemoving;

	const refreshChallenge = () =>
		queryClient.invalidateQueries({
			queryKey: getShowTechnicalChallengeQueryKey(vacancyId),
		});

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) return;

		if (file.size > MAX_CHALLENGE_FILE_SIZE) {
			CustomToaster.errorToast(t("technical_challenge.guide.too_large"));
			return;
		}

		try {
			await saveGuideDocument({
				id: challenge.id,
				data: { guide_document: file },
			});

			CustomToaster.successToast(t("toast.success.guide_document_saved"));

			refreshChallenge();
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleRemove = async () => {
		try {
			await removeGuideDocument({ id: challenge.id });

			CustomToaster.successToast(t("toast.success.guide_document_removed"));

			refreshChallenge();
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<div className="flex flex-col gap-2 rounded-md border p-4">
			<div className="flex flex-col gap-1">
				<p className="text-sm font-medium">
					{t("technical_challenge.guide.title")}
				</p>
				<p className="text-sm text-muted-foreground">
					{t("technical_challenge.guide.description")}
				</p>
			</div>
			<input
				type="file"
				className="hidden"
				ref={fileInputRef}
				accept={GUIDE_DOCUMENT_EXTENSIONS.join(",")}
				onChange={handleUpload}
			/>
			<div className="flex flex-row flex-wrap items-center gap-2">
				{guideDocument && (
					<ChallengeFileLink file={guideDocument} label={guideDocument.name} />
				)}
				<Button
					type="button"
					variant={guideDocument ? "outline" : "secondary"}
					disabled={isPending}
					onClick={() => fileInputRef.current?.click()}
				>
					{isSaving ? <Spinner /> : <Paperclip />}
					{t(
						guideDocument
							? "technical_challenge.guide.replace"
							: "technical_challenge.guide.attach",
					)}
				</Button>
				{guideDocument && (
					<Button
						type="button"
						variant={"ghost"}
						disabled={isPending}
						onClick={handleRemove}
					>
						{isRemoving ? <Spinner /> : <Trash2 />}
						{t("general.remove")}
					</Button>
				)}
			</div>
		</div>
	);
}
