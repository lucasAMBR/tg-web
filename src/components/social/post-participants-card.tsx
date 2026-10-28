import { MessagesSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PostParticipantResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { usePostParticipants } from "@/hooks/use-post-participants";
import SocialUserCard, { SocialUserCardSkeleton } from "./social-user-card";

interface PostParticipantsCardProps {
	postId: string;
}

/**
 * Quem participa da conversa nos comentários, ao lado do post, no mesmo
 * formato do "Quem seguir". Quem renderiza decide se ele aparece
 * (`comment.view`).
 */
export default function PostParticipantsCard({
	postId,
}: PostParticipantsCardProps) {
	const { t } = useTranslation();

	const {
		participants,
		isLoading,
		isError,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = usePostParticipants(postId);

	// Post excluído ou inexistente: quem avisa é a parte principal da tela
	if (isError) return null;

	return (
		<section className="flex w-full flex-col gap-4">
			<h2 className="flex items-center gap-2 text-xl font-bold">
				{t("social.participants.title")}
			</h2>

			{isLoading && <SocialUserCardSkeleton />}

			{!isLoading && participants.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<MessagesSquare />
						</EmptyMedia>
						<EmptyTitle>{t("social.participants.empty_title")}</EmptyTitle>
						<EmptyDescription>
							{t("social.participants.empty_description")}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}

			{participants.length > 0 && (
				<ul className="flex flex-col gap-2">
					{participants.map((participant) => (
						<li key={participant.user.id}>
							<ParticipantCard participant={participant} />
						</li>
					))}
				</ul>
			)}

			{isFetchingNextPage && <SocialUserCardSkeleton />}

			{hasNextPage && (
				<Button
					variant={"outline"}
					disabled={isFetchingNextPage}
					onClick={() => fetchNextPage()}
				>
					{isFetchingNextPage && <Spinner />}
					{t("social.participants.show_more")}
				</Button>
			)}
		</section>
	);
}

function ParticipantCard({
	participant,
}: {
	participant: PostParticipantResource;
}) {
	const { t } = useTranslation();

	return (
		<SocialUserCard
			user={participant.user}
			isFollowed={participant.is_followed}
			followsYou={participant.follows_you}
			badges={
				participant.is_post_author && (
					<Badge variant={"default"}>
						{t("social.participants.post_author")}
					</Badge>
				)
			}
		/>
	);
}
