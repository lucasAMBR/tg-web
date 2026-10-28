import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { type FollowListKind, formatFollowCount } from "@/types/follow";
import FollowListDialog from "./follow-list-dialog";

interface FollowStatsProps {
	/** Id do **usuário** dono do perfil, não o do perfil. */
	userId: string;
	name: string | null | undefined;
	followersCount: number;
	followingCount: number;
}

/**
 * "N seguidores · N seguindo" no cabeçalho do perfil. Cada contador abre a
 * lista correspondente, mas só com `follow.view`; sem ela os números aparecem
 * sem link.
 */
export default function FollowStats({
	userId,
	name,
	followersCount,
	followingCount,
}: FollowStatsProps) {
	const { t, i18n } = useTranslation();

	const permissions = useSocialPermissions();

	const locale = i18n.language === "en" ? "en" : "pt";

	const [isListOpen, setIsListOpen] = useState(false);
	// Fica separado do aberto/fechado para a aba não trocar durante a animação
	// de fechar
	const [listKind, setListKind] = useState<FollowListKind>("followers");

	const openList = (kind: FollowListKind) => {
		setListKind(kind);
		setIsListOpen(true);
	};

	const counters = [
		{
			kind: "followers",
			count: followersCount,
			label: t("social.follow.followers_label", { count: followersCount }),
		},
		{
			kind: "following",
			count: followingCount,
			label: t("social.follow.following_label"),
		},
	] as const;

	return (
		<div className="flex flex-wrap items-center gap-4 text-sm">
			{counters.map((counter) => {
				const content = (
					<>
						<span className="font-semibold text-foreground">
							{formatFollowCount(counter.count, locale)}
						</span>{" "}
						<span className="text-muted-foreground">{counter.label}</span>
					</>
				);

				return permissions.canViewFollows ? (
					<button
						key={counter.kind}
						type="button"
						className="cursor-pointer hover:underline"
						onClick={() => openList(counter.kind)}
					>
						{content}
					</button>
				) : (
					<span key={counter.kind}>{content}</span>
				);
			})}

			{permissions.canViewFollows && (
				<FollowListDialog
					open={isListOpen}
					onOpenChange={setIsListOpen}
					kind={listKind}
					onKindChange={setListKind}
					userId={userId}
					name={name}
				/>
			)}
		</div>
	);
}
