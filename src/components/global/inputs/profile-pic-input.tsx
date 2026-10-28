import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CustomToaster } from "@/utils/custom-toaster";
import { cn } from "@/lib/utils";

export const PROFILE_PIC_MAX_SIZE_MB = 10;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Props = {
	value: File | null;
	onChange: (file: File | null) => void;
	currentUrl?: string | null;
	className?: string;
	disabled?: boolean;
};

export function ProfilePicInput({
	value,
	onChange,
	currentUrl,
	className,
	disabled,
}: Props) {
	const { t } = useTranslation();

	const inputRef = useRef<HTMLInputElement | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!value) {
			setPreviewUrl(null);
			return;
		}

		const url = URL.createObjectURL(value);
		setPreviewUrl(url);

		return () => URL.revokeObjectURL(url);
	}, [value]);

	const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";

		if (!file) return;

		if (!ACCEPTED_TYPES.includes(file.type)) {
			CustomToaster.errorToast(t("profile_pic.invalid_type"));
			return;
		}

		if (file.size > PROFILE_PIC_MAX_SIZE_MB * 1024 * 1024) {
			CustomToaster.errorToast(
				t("profile_pic.too_large", { size: PROFILE_PIC_MAX_SIZE_MB }),
			);
			return;
		}

		onChange(file);
	};

	const displayedUrl = previewUrl ?? currentUrl ?? null;

	return (
		<div className={cn("flex items-center gap-4", className)}>
			<input
				ref={inputRef}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				className="hidden"
				onChange={handleSelect}
			/>

			<button
				type="button"
				disabled={disabled}
				onClick={() => inputRef.current?.click()}
				className="group relative rounded-full disabled:cursor-not-allowed disabled:opacity-60"
			>
				<Avatar className="size-24">
					{displayedUrl && (
						<AvatarImage
							src={displayedUrl}
							alt={t("input.profile_pic")}
							className="object-cover"
						/>
					)}
					<AvatarFallback className="bg-primary text-primary-foreground">
						<User className="size-12" />
					</AvatarFallback>
				</Avatar>
				<span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
					<ImagePlus className="size-6 text-white" />
				</span>
			</button>

			<div className="flex flex-col items-start gap-1">
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={disabled}
						onClick={() => inputRef.current?.click()}
					>
						<ImagePlus />
						{displayedUrl ? t("profile_pic.change") : t("profile_pic.select")}
					</Button>
					{value && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={disabled}
							onClick={() => onChange(null)}
						>
							<Trash />
							{t("general.remove")}
						</Button>
					)}
				</div>
				<p className="text-xs text-muted-foreground">
					{t("profile_pic.hint", { size: PROFILE_PIC_MAX_SIZE_MB })}
				</p>
			</div>
		</div>
	);
}
