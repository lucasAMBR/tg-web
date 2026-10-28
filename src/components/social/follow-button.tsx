import { UserCheck, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useFollowActions } from "@/hooks/use-follow-actions";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { cn } from "@/lib/utils";
import { followButtonLabelKey } from "@/types/follow";

interface FollowButtonProps {
	/** Id do **usuário** (`user_id`, `author.id`, `user.id`), não o do perfil. */
	userId: string | null | undefined;
	/** Nome para a confirmação de deixar de seguir; `null` vira "Usuário". */
	name: string | null | undefined;
	isFollowed: boolean;
	followsYou: boolean;
	size?: "default" | "sm";
}

/**
 * Botão de seguir. Não aparece para o próprio usuário nem sem `follow.toggle`.
 * Quem lê o estado é quem renderiza (perfil ou item de lista), a partir do
 * cache, então o botão muda junto em todo lugar onde o usuário aparece.
 */
export default function FollowButton({ userId, ...props }: FollowButtonProps) {
	const permissions = useSocialPermissions();

	if (!userId || !permissions.canToggleFollow(userId)) return null;

	return <FollowToggleButton userId={userId} {...props} />;
}

function FollowToggleButton({
	userId,
	name,
	isFollowed,
	followsYou,
	size = "default",
}: FollowButtonProps & { userId: string }) {
	const { t } = useTranslation();

	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	const { toggleFollow, isPending } = useFollowActions({ userId, isFollowed });

	const handleClick = () => {
		// No celular não existe hover para avisar que o clique deixa de seguir,
		// então pede confirmação antes. Seguir não precisa
		if (isFollowed && window.matchMedia("(hover: none)").matches) {
			setIsConfirmOpen(true);
			return;
		}

		toggleFollow();
	};

	const handleConfirmUnfollow = () => {
		setIsConfirmOpen(false);
		toggleFollow();
	};

	return (
		<>
			<Button
				size={size}
				variant={isFollowed ? "outline" : "default"}
				disabled={isPending}
				onClick={handleClick}
				className={cn(
					isFollowed &&
						"group hover:border-destructive hover:bg-destructive/10 hover:text-destructive",
				)}
			>
				{isFollowed ? (
					<>
						<span className="inline-flex items-center gap-1.5 group-hover:hidden">
							<UserCheck /> {t("social.follow.following")}
						</span>
						<span className="hidden items-center gap-1.5 group-hover:inline-flex">
							<UserMinus /> {t("social.follow.unfollow")}
						</span>
					</>
				) : (
					<>
						<UserPlus /> {t(followButtonLabelKey(isFollowed, followsYou))}
					</>
				)}
			</Button>

			<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("social.follow.unfollow_confirm", {
								name: name ?? t("social.author.unknown"),
							})}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("social.follow.unfollow_confirm_description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button variant={"outline"} onClick={() => setIsConfirmOpen(false)}>
							{t("general.cancel")}
						</Button>
						<Button variant={"destructive"} onClick={handleConfirmUnfollow}>
							{t("social.follow.unfollow")}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
