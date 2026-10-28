import { useTranslation } from "react-i18next";
import { usePostFeed } from "@/hooks/use-post-feed";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import CreatePostCard from "./create-post-card";
import PostList from "./post-list";

interface ProfilePostsTabProps {
	/** Id do **usuário** dono do perfil, não o do perfil. */
	userId: string | undefined;
}

/**
 * Publicações de um perfil: o mesmo feed, filtrado por `user_id`. No próprio
 * perfil, o campo de publicar aparece em cima da lista.
 */
export default function ProfilePostsTab({ userId }: ProfilePostsTabProps) {
	const { t } = useTranslation();

	const permissions = useSocialPermissions();

	const isOwnProfile = Boolean(userId) && userId === permissions.userId;

	const { posts, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		usePostFeed({ sort: "recent", userId, enabled: Boolean(userId) });

	return (
		<div className="flex flex-col gap-3">
			{isOwnProfile && permissions.canCreatePost && <CreatePostCard />}

			<PostList
				posts={posts}
				isLoading={isLoading || !userId}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				onReachEnd={fetchNextPage}
				emptyTitle={t("social.profile_posts.empty_title")}
				emptyDescription={
					isOwnProfile
						? t("social.profile_posts.empty_description_own")
						: t("social.profile_posts.empty_description")
				}
			/>
		</div>
	);
}
