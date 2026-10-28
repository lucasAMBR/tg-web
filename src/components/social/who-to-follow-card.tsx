import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
	type RankedPopularUser,
	usePopularUsers,
} from "@/hooks/use-popular-users";
import { cn } from "@/lib/utils";
import { WHO_TO_FOLLOW_PER_PAGE } from "@/types/follow";
import SocialUserCard, { SocialUserCardSkeleton } from "./social-user-card";

/** Até esta posição o número do ranking ganha a cor de destaque. */
const HIGHLIGHTED_POSITIONS = 3;

/**
 * Bloco "Quem seguir" ao lado do feed: o ranking de usuários mais populares,
 * de cinco em cinco, com um card por usuário. Quem renderiza decide se ele
 * aparece (`follow.view`).
 */
export default function WhoToFollowCard() {
	const { t } = useTranslation();

	const { users, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		usePopularUsers({ perPage: WHO_TO_FOLLOW_PER_PAGE });

	return (
		<section className="flex w-full flex-col gap-4">
			<h2 className="flex items-center gap-2 text-xl font-bold">
				{t("social.popular.title")}
			</h2>

			{isLoading && <SocialUserCardSkeleton withLeading />}

			{!isLoading && users.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Users />
						</EmptyMedia>
						<EmptyTitle>{t("social.popular.empty")}</EmptyTitle>
					</EmptyHeader>
				</Empty>
			)}

			{users.length > 0 && (
				<ol className="flex flex-col gap-2">
					{users.map((rankedUser) => (
						<li key={rankedUser.item.user.id}>
							<PopularUserCard rankedUser={rankedUser} />
						</li>
					))}
				</ol>
			)}

			{isFetchingNextPage && <SocialUserCardSkeleton withLeading />}

			{hasNextPage && (
				<Button
					variant={"outline"}
					disabled={isFetchingNextPage}
					onClick={() => fetchNextPage()}
				>
					{isFetchingNextPage && <Spinner />}
					{t("social.popular.show_more")}
				</Button>
			)}
		</section>
	);
}

function PopularUserCard({ rankedUser }: { rankedUser: RankedPopularUser }) {
	const { item, position } = rankedUser;

	return (
		<SocialUserCard
			user={item.user}
			isFollowed={item.is_followed}
			followsYou={item.follows_you}
			leading={
				<span
					className={cn(
						"w-5 shrink-0 text-center text-base font-bold",
						position <= HIGHLIGHTED_POSITIONS
							? "text-primary"
							: "text-muted-foreground",
					)}
				>
					{position}
				</span>
			}
		/>
	);
}
