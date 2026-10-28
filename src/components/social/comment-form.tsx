import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { COMMENT_CONTENT_MAX_LENGTH } from "@/types/social";

interface CommentFormProps {
	/** Recebe o texto e os callbacks de conclusão e de erro de validação. */
	onSubmit: (
		content: string,
		callbacks: {
			onSuccess: () => void;
			onFieldError: (message: string) => void;
		},
	) => void;
	isPending: boolean;
	placeholder: string;
	submitLabel: string;
	initialValue?: string;
	onCancel?: () => void;
	autoFocus?: boolean;
}

/** Campo de comentar, responder e editar — todos têm o mesmo limite e validação. */
export default function CommentForm({
	onSubmit,
	isPending,
	placeholder,
	submitLabel,
	initialValue = "",
	onCancel,
	autoFocus = false,
}: CommentFormProps) {
	const { t } = useTranslation();

	const [content, setContent] = useState(initialValue);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		setError(null);

		if (content.trim().length === 0) {
			setError(t("social.errors.content_required"));
			return;
		}

		onSubmit(content, {
			onSuccess: () => {
				setContent("");
				setError(null);
			},
			onFieldError: setError,
		});
	};

	return (
		<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
			<Textarea
				value={content}
				rows={2}
				autoFocus={autoFocus}
				maxLength={COMMENT_CONTENT_MAX_LENGTH}
				placeholder={placeholder}
				onChange={(event) => setContent(event.target.value)}
			/>

			<div className="flex items-center justify-between gap-2">
				{error ? (
					<span className="text-sm text-destructive">{error}</span>
				) : (
					<span className="text-xs text-muted-foreground">
						{content.length}/{COMMENT_CONTENT_MAX_LENGTH}
					</span>
				)}

				<div className="flex gap-2">
					{onCancel && (
						<Button
							type="button"
							variant={"ghost"}
							size={"sm"}
							onClick={onCancel}
						>
							{t("general.cancel")}
						</Button>
					)}
					<Button type="submit" size={"sm"} disabled={isPending}>
						{isPending ? <Spinner /> : submitLabel}
					</Button>
				</div>
			</div>
		</form>
	);
}
