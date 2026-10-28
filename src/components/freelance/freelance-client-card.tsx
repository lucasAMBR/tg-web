import { Link } from "@tanstack/react-router";
import { ExternalLink, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import StartChatButton from "@/components/chat/start-chat-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type FreelanceVacancy, getFreelanceBio } from "@/types/freelance";

interface FreelanceClientCardProps {
	vacancy: FreelanceVacancy;
	/** "Conversar com o cliente", com o rascunho do dev. */
	showChat?: boolean;
}

/** Cliente dono do freela: o perfil público (nome, foto, bio e link). */
export default function FreelanceClientCard({
	vacancy,
	showChat = false,
}: FreelanceClientCardProps) {
	const { t, i18n } = useTranslation();

	const client = vacancy.profile;

	if (!client) {
		return (
			<Card className="w-full gap-3 p-8">
				<h3 className="text-lg font-bold">{t("freelance.details.client")}</h3>
				<p className="text-sm text-muted-foreground">
					{t("freelance.details.client_unavailable")}
				</p>
			</Card>
		);
	}

	const bio = getFreelanceBio(client, i18n.language);

	return (
		<Card className="w-full gap-4 p-8">
			<h3 className="text-lg font-bold">{t("freelance.details.client")}</h3>
			<div className="flex flex-row items-center gap-4">
				<Avatar className="size-16">
					{client.profile_pic && (
						<AvatarImage
							src={client.profile_pic}
							alt={client.name}
							className="object-cover"
						/>
					)}
					<AvatarFallback className="bg-primary text-primary-foreground">
						<Users className="size-8" />
					</AvatarFallback>
				</Avatar>
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<p className="truncate font-semibold">{client.name}</p>
					{bio && (
						<p className="line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">
							{bio}
						</p>
					)}
				</div>
			</div>
			<div className="flex flex-row flex-wrap gap-2">
				<Link
					to="/clients/$id"
					params={{ id: client.id }}
					className={buttonVariants({ variant: "secondary" })}
				>
					<ExternalLink className="size-4" />
					{t("freelance.details.view_client_profile")}
				</Link>
				{showChat && (
					<StartChatButton
						userId={client.user_id}
						variant="default"
						label={t("freelance.details.talk_to_client")}
						draft={t("freelance.chat_draft.dev", { title: vacancy.title })}
					/>
				)}
			</div>
		</Card>
	);
}
