import { useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserSimpleResource } from "@/api/generated/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	formatFullDateTime,
	formatRelativeTime,
	getAuthorProfileHref,
	getAuthorProfilePic,
	getAuthorRoleLabelKey,
} from "@/types/social";

interface SocialAuthorProps {
	/** `null` em comentário removido ou quando a conta foi excluída. */
	author: UserSimpleResource | null | undefined;
	createdAt?: string | null;
	edited?: boolean;
	/** Comentário removido não mostra autor nem avatar. */
	removed?: boolean;
	size?: "sm" | "md";
	className?: string;
}

/**
 * Linha de autoria de postagens, comentários e curtidas. Cobre os estados
 * especiais do contrato: usuário sem perfil (`name` null) vai sem link, conta
 * excluída (`author` null) vira "usuário excluído" e comentário removido não
 * mostra autoria nenhuma.
 */
export default function SocialAuthor({
	author,
	createdAt,
	edited = false,
	removed = false,
	size = "md",
	className,
}: SocialAuthorProps) {
	const { t, i18n } = useTranslation();

	const navigate = useNavigate();

	const locale = i18n.language === "en" ? "en" : "pt";

	const avatarSize = size === "sm" ? "size-8" : "size-10";
	const iconSize = size === "sm" ? "size-4" : "size-5";

	const timestamp = createdAt ? (
		<span
			className="shrink-0 text-xs text-muted-foreground"
			title={formatFullDateTime(createdAt, locale)}
		>
			{formatRelativeTime(createdAt, locale)}
			{/* A remoção também mexe no `updated_at`, então "editado" não vale aqui. */}
			{edited && !removed && ` · ${t("social.post.edited")}`}
		</span>
	) : null;

	if (removed) {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<span className="text-sm italic text-muted-foreground">
					{t("social.comment.removed")}
				</span>
				{timestamp}
			</div>
		);
	}

	const profilePic = getAuthorProfilePic(author);
	const profileHref = getAuthorProfileHref(author);
	const roleLabelKey = getAuthorRoleLabelKey(author);

	const name = author?.name ?? t("social.author.unknown");

	const avatar = (
		<Avatar className={cn(avatarSize, "shrink-0")}>
			{profilePic && (
				<AvatarImage src={profilePic} alt={name} className="object-cover" />
			)}
			<AvatarFallback className="bg-primary text-primary-foreground">
				<User className={iconSize} />
			</AvatarFallback>
		</Avatar>
	);

	return (
		<div className={cn("flex min-w-0 items-center gap-2", className)}>
			{profileHref ? (
				<button
					type="button"
					onClick={() => navigate({ to: profileHref })}
					className="cursor-pointer"
				>
					{avatar}
				</button>
			) : (
				avatar
			)}
			<div className="flex min-w-0 flex-wrap items-center gap-x-2">
				{profileHref ? (
					<button
						type="button"
						onClick={() => navigate({ to: profileHref })}
						className={cn(
							"cursor-pointer font-medium hover:text-primary",
							size === "sm" && "text-sm",
						)}
					>
						{name}
					</button>
				) : (
					<span className={cn("font-medium", size === "sm" && "text-sm")}>
						{name}
					</span>
				)}
				{roleLabelKey && (
					<Badge variant={"secondary"} className="text-xs">
						{t(roleLabelKey)}
					</Badge>
				)}
				{timestamp}
			</div>
		</div>
	);
}
