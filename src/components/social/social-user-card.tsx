import { useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { UserSimpleResource } from "@/api/generated/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getAuthorProfileHref,
	getAuthorProfilePic,
	getAuthorRoleLabelKey,
} from "@/types/social";
import FollowButton from "./follow-button";
import FollowsYouBadge from "./follows-you-badge";

interface SocialUserCardProps {
	user: UserSimpleResource;
	isFollowed: boolean;
	followsYou: boolean;
	/** Antes do avatar, como a posição no ranking. */
	leading?: ReactNode;
	/** Selos ao lado do nome, como o de autor da publicação. */
	badges?: ReactNode;
}

/**
 * Card de usuário das listas laterais ("Quem seguir", participantes de uma
 * conversa): avatar e nome levando ao perfil, rótulo do perfil, selos e botão
 * de seguir, que some no item do próprio usuário.
 */
export default function SocialUserCard({
	user,
	isFollowed,
	followsYou,
	leading,
	badges,
}: SocialUserCardProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const profilePic = getAuthorProfilePic(user);
	const profileHref = getAuthorProfileHref(user);
	const roleLabelKey = getAuthorRoleLabelKey(user);

	const name = user.name ?? t("social.author.unknown");

	const avatar = (
		<Avatar className="size-10 shrink-0">
			{profilePic && (
				<AvatarImage src={profilePic} alt={name} className="object-cover" />
			)}
			<AvatarFallback className="bg-primary text-primary-foreground">
				<User className="size-5" />
			</AvatarFallback>
		</Avatar>
	);

	return (
		<Card className="flex-row items-center gap-3 p-3">
			{leading}

			{/* Usuário sem perfil (`name` null) não tem para onde ir, então vai sem link */}
			{profileHref ? (
				<button
					type="button"
					onClick={() => navigate({ to: profileHref })}
					className="shrink-0 cursor-pointer"
				>
					{avatar}
				</button>
			) : (
				avatar
			)}

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex min-w-0 items-center gap-1.5">
					{profileHref ? (
						<button
							type="button"
							onClick={() => navigate({ to: profileHref })}
							className="min-w-0 cursor-pointer truncate text-left text-sm font-semibold hover:text-primary"
						>
							{name}
						</button>
					) : (
						<span className="min-w-0 truncate text-sm font-semibold">
							{name}
						</span>
					)}

					{badges}
				</div>

				{roleLabelKey && (
					<span className="truncate text-xs text-muted-foreground">
						{t(roleLabelKey)}
					</span>
				)}

				{followsYou && <FollowsYouBadge className="mt-1.5" />}
			</div>

			<FollowButton
				userId={user.id}
				name={user.name}
				isFollowed={isFollowed}
				followsYou={followsYou}
				size="sm"
			/>
		</Card>
	);
}

/** Três cards de carregamento no formato do `SocialUserCard`. */
export function SocialUserCardSkeleton({
	withLeading = false,
}: {
	withLeading?: boolean;
}) {
	return (
		<div className="flex flex-col gap-2">
			{[0, 1, 2].map((placeholder) => (
				<Card key={placeholder} className="flex-row items-center gap-3 p-3">
					{withLeading && <Skeleton className="size-5 shrink-0" />}
					<Skeleton className="size-10 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-1">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-20" />
					</div>
					<Skeleton className="h-8 w-20 shrink-0" />
				</Card>
			))}
		</div>
	);
}
