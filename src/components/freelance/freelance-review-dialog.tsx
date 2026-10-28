import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FreelanceReviewStatusEnum } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useStoreFreelanceFeedPost } from "@/hooks/use-freelance-feed";
import {
	FREELANCE_FEED_CONTENT_MAX_LENGTH,
	type FreelanceFeedPost,
	FreelanceFeedPostType,
} from "@/types/freelance";
import { CustomToaster } from "@/utils/custom-toaster";
import { FreelanceFeedFilePicker } from "./freelance-feed-attachments";
import {
	useFeedPostErrorHandler,
	useFeedPostValidation,
} from "./freelance-feed-composer";

interface FreelanceReviewDialogProps {
	vacancyId: string;
	deliverable: FreelanceFeedPost;
	/** O veredito escolhido: "Aprovar" ou "Pedir ajustes". */
	reviewStatus: FreelanceReviewStatusEnum;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Review do cliente sobre uma entrega. O comentário é obrigatório, a não ser que
 * ele anexe um arquivo. Depois do envio, a entrega mostra o veredito e a review
 * entra no topo do feed.
 */
export default function FreelanceReviewDialog({
	vacancyId,
	deliverable,
	reviewStatus,
	open,
	onOpenChange,
}: FreelanceReviewDialogProps) {
	const { t } = useTranslation();

	const [content, setContent] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null);

	const validate = useFeedPostValidation();
	const handleError = useFeedPostErrorHandler(vacancyId);

	const { mutate: sendReview, isPending } =
		useStoreFreelanceFeedPost(vacancyId);

	const close = (nextOpen: boolean) => {
		if (!nextOpen) {
			setContent("");
			setFiles([]);
			setError(null);
		}

		onOpenChange(nextOpen);
	};

	const submit = () => {
		const trimmed = content.trim();

		const validationError = validate(trimmed, files);

		setError(validationError);

		if (validationError) return;

		sendReview(
			{
				type: FreelanceFeedPostType.review,
				content: trimmed || undefined,
				attachments: files,
				parentId: deliverable.id,
				reviewStatus,
			},
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.freelance_review_sent"));
					close(false);
				},
				onError: (submitError) => {
					const message = handleError(submitError);

					if (message) {
						setError(message);

						return;
					}

					close(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={close}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>
						{t(`freelance.feed.review_title_${reviewStatus}`)}
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-3">
					<Textarea
						value={content}
						onChange={(event) => setContent(event.target.value)}
						rows={4}
						maxLength={FREELANCE_FEED_CONTENT_MAX_LENGTH}
						disabled={isPending}
						placeholder={t("freelance.feed.review_placeholder")}
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
				</div>
				<DialogFooter>
					<Button
						variant={"outline"}
						onClick={() => close(false)}
						disabled={isPending}
					>
						{t("general.cancel")}
					</Button>
					<Button onClick={submit} disabled={isPending}>
						{isPending && <Spinner className="size-4" />}
						{t("freelance.feed.send_review")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
