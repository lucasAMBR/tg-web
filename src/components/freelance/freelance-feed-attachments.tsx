import {
	File,
	FileArchive,
	FileImage,
	FileSpreadsheet,
	FileText,
	type LucideIcon,
	Paperclip,
	Presentation,
	XIcon,
} from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	FREELANCE_FEED_EXTENSIONS,
	FREELANCE_FEED_MAX_FILES,
	type FreelanceFeedAttachment,
	formatFileSize,
	getFreelanceLocale,
} from "@/types/freelance";

function attachmentIcon(mimeType: string | null | undefined): LucideIcon {
	const mime = mimeType ?? "";

	if (mime.startsWith("image/")) return FileImage;
	if (mime.includes("zip")) return FileArchive;
	if (
		mime.includes("spreadsheet") ||
		mime.includes("excel") ||
		mime === "text/csv"
	) {
		return FileSpreadsheet;
	}
	if (mime.includes("presentation") || mime.includes("powerpoint")) {
		return Presentation;
	}
	if (mime === "application/pdf" || mime.startsWith("text/")) return FileText;
	if (mime.includes("word")) return FileText;

	return File;
}

/**
 * Anexos de uma postagem. A `url` é assinada e expira 30 minutos depois de o
 * feed ser carregado, então o link abre direto e não é guardado em lugar
 * nenhum: se falhar, recarregar o feed traz uma URL nova.
 */
export function FreelanceFeedAttachmentList({
	attachments,
}: {
	attachments: FreelanceFeedAttachment[];
}) {
	const { i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	if (attachments.length === 0) return null;

	return (
		<ul className="flex flex-col gap-2">
			{attachments.map((attachment) => {
				const Icon = attachmentIcon(attachment.mime_type);

				return (
					<li key={attachment.id}>
						<a
							href={attachment.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-3 rounded-md border p-2 transition-colors hover:bg-accent/50"
						>
							<Icon className="size-5 shrink-0 text-primary" />
							<span className="min-w-0 flex-1 truncate text-sm">
								{attachment.name}
							</span>
							<span className="shrink-0 text-xs text-muted-foreground">
								{formatFileSize(attachment.size, locale)}
							</span>
						</a>
					</li>
				);
			})}
		</ul>
	);
}

const ACCEPT = FREELANCE_FEED_EXTENSIONS.map(
	(extension) => `.${extension}`,
).join(",");

interface FreelanceFeedFilePickerProps {
	files: File[];
	onChange: (files: File[]) => void;
	disabled?: boolean;
}

/** Arquivos escolhidos para uma postagem, antes do envio. */
export function FreelanceFeedFilePicker({
	files,
	onChange,
	disabled = false,
}: FreelanceFeedFilePickerProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<div className="flex flex-col gap-2">
			{files.length > 0 && (
				<ul className="flex flex-col gap-1">
					{files.map((file, index) => {
						const Icon = attachmentIcon(file.type);

						return (
							<li
								// O mesmo arquivo pode ser escolhido duas vezes
								// biome-ignore lint/suspicious/noArrayIndexKey: a posição identifica o item escolhido
								key={`${file.name}-${index}`}
								className="flex items-center gap-2 rounded-md border px-2 py-1"
							>
								<Icon className="size-4 shrink-0 text-primary" />
								<span className="min-w-0 flex-1 truncate text-sm">
									{file.name}
								</span>
								<span className="shrink-0 text-xs text-muted-foreground">
									{formatFileSize(file.size, locale)}
								</span>
								<Button
									type="button"
									size={"icon"}
									variant={"ghost"}
									className="size-7"
									aria-label={t("freelance.feed.remove_attachment")}
									disabled={disabled}
									onClick={() =>
										onChange(
											files.filter((_, fileIndex) => fileIndex !== index),
										)
									}
								>
									<XIcon className="size-4" />
								</Button>
							</li>
						);
					})}
				</ul>
			)}
			<div className="flex flex-wrap items-center gap-2">
				<input
					ref={inputRef}
					type="file"
					multiple
					accept={ACCEPT}
					className="hidden"
					onChange={(event) => {
						const selected = Array.from(event.target.files ?? []);

						onChange([...files, ...selected]);

						// Permite escolher o mesmo arquivo de novo depois de removê-lo
						event.target.value = "";
					}}
				/>
				<Button
					type="button"
					variant={"outline"}
					size={"sm"}
					disabled={disabled || files.length >= FREELANCE_FEED_MAX_FILES}
					onClick={() => inputRef.current?.click()}
				>
					<Paperclip className="size-4" />
					{t("freelance.feed.attach")}
				</Button>
				<span className="text-xs text-muted-foreground">
					{t("freelance.feed.attachments_count", {
						count: files.length,
						max: FREELANCE_FEED_MAX_FILES,
					})}
				</span>
			</div>
			<p className="text-xs text-muted-foreground">
				{t("freelance.feed.accepted_files")}
			</p>
		</div>
	);
}
