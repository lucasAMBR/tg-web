import { useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ChatParticipantResource } from "@/api/generated/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	getParticipantProfileHref,
	getParticipantProfilePic,
} from "@/types/chat";

interface ConversationParticipantProps {
	participant: ChatParticipantResource | undefined;
}

/** Quem está do outro lado da conversa. Leva ao perfil dele, quando existe. */
export default function ConversationParticipant({
	participant,
}: ConversationParticipantProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const profilePic = getParticipantProfilePic(participant);
	const profileHref = getParticipantProfileHref(participant);

	return (
		<button
			type="button"
			disabled={!profileHref}
			onClick={() => {
				if (profileHref) navigate({ to: profileHref });
			}}
			className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
		>
			<Avatar className="size-9 shrink-0">
				{profilePic && (
					<AvatarImage
						src={profilePic}
						alt={participant?.name ?? ""}
						className="object-cover"
					/>
				)}
				<AvatarFallback className="bg-primary text-primary-foreground">
					<User className="size-4" />
				</AvatarFallback>
			</Avatar>
			<div className="flex min-w-0 flex-col">
				<span className="truncate font-medium">
					{participant?.name ?? t("chat.unknown_participant")}
				</span>
				{participant?.role && (
					<span className="truncate text-xs text-muted-foreground">
						{t(`role.${participant.role}`)}
					</span>
				)}
			</div>
		</button>
	);
}
