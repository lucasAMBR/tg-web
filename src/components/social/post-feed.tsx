import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search, UserSearch } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeedParams } from "@/hooks/filters/use-feed-params";
import {
	getPostFeedQueryKey,
	type PostFeedFilters,
	type PostFeedSort,
	type PostFeedSource,
	usePostFeed,
} from "@/hooks/use-post-feed";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { useAuthStore } from "@/stores/auth-store";
import CreatePostCard from "./create-post-card";
import PostList from "./post-list";

/**
 * Feed da tela inicial. As abas escolhem a origem — "Todos" (`feed=all`) ou
 * "Seguindo" (`feed=following`, quem o usuário segue mais ele mesmo) — e o
 * seletor a ordenação, que vale para as duas: `popular` por engajamento e
 * `recent` cronológica. Cada combinação é uma lista separada no cache.
 */
export default function PostFeed() {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const permissions = useSocialPermissions();

	const followingCount = useAuthStore(
		(state) => state.user?.following_count ?? 0,
	);

	const { feed, sort, setFeedParams } = useFeedParams();

	const [searchTerm, setSearchTerm] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");

	const { posts, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		usePostFeed({ feed, sort, search: appliedSearch });

	/**
	 * Trocar de aba ou de ordenação recomeça a paginação da página 1, em vez de
	 * reaproveitar as páginas que a lista de destino já tinha carregado antes.
	 */
	const changeFeed = (next: Pick<PostFeedFilters, "feed" | "sort">) => {
		queryClient.resetQueries({
			queryKey: getPostFeedQueryKey({
				feed,
				sort,
				search: appliedSearch,
				...next,
			}),
			exact: true,
		});

		setFeedParams(next);
	};

	const handleSearch = (event: React.FormEvent) => {
		event.preventDefault();

		setAppliedSearch(searchTerm.trim());
	};

	const isFollowingEmpty = feed === "following" && !appliedSearch;

	const emptyState = !isFollowingEmpty
		? {
				title: t("social.feed.empty_title"),
				description: t("social.feed.empty_description"),
			}
		: followingCount === 0
			? {
					title: t("social.feed.following_empty_title"),
					description: t("social.feed.following_empty_description"),
					action: (
						<Button onClick={() => navigate({ to: "/search" })}>
							<UserSearch /> {t("social.feed.find_profiles")}
						</Button>
					),
				}
			: { title: t("social.feed.following_no_posts_title") };

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
			{permissions.canCreatePost && <CreatePostCard />}

			<div className="flex flex-wrap items-center justify-between gap-2">
				<Tabs
					value={feed}
					onValueChange={(value) =>
						changeFeed({ feed: value as PostFeedSource })
					}
				>
					<TabsList variant={"line"}>
						<TabsTrigger className="cursor-pointer" value="all">
							{t("social.feed.all")}
						</TabsTrigger>
						<TabsTrigger className="cursor-pointer" value="following">
							{t("social.feed.following")}
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<div className="flex flex-wrap items-center gap-2">
					<Select
						value={sort}
						onValueChange={(value) =>
							changeFeed({ sort: value as PostFeedSort })
						}
					>
						<SelectTrigger
							className="w-40"
							aria-label={t("social.feed.sort_label")}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="recent">{t("social.feed.recent")}</SelectItem>
							<SelectItem value="popular">
								{t("social.feed.popular")}
							</SelectItem>
						</SelectContent>
					</Select>

					<form className="flex flex-row gap-2" onSubmit={handleSearch}>
						<Input
							placeholder={t("social.feed.search_placeholder")}
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
						/>
						<Button type="submit" variant={"secondary"}>
							<Search /> {t("general.search")}
						</Button>
					</form>
				</div>
			</div>

			<PostList
				posts={posts}
				isLoading={isLoading}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				onReachEnd={fetchNextPage}
				emptyTitle={emptyState.title}
				emptyDescription={emptyState.description}
				emptyAction={emptyState.action}
			/>
		</div>
	);
}
