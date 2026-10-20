import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PostFeedSort, usePostFeed } from "@/hooks/use-post-feed";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import CreatePostCard from "./create-post-card";
import PostList from "./post-list";

/**
 * Feed da tela inicial. A aba "populares" usa `sort=popular`, que a API ordena
 * por engajamento; a aba "recentes" é a ordenação cronológica padrão.
 */
export default function PostFeed() {
	const { t } = useTranslation();

	const permissions = useSocialPermissions();

	const [sort, setSort] = useState<PostFeedSort>("popular");
	const [searchTerm, setSearchTerm] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");

	const { posts, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		usePostFeed({ sort, search: appliedSearch });

	const handleSearch = (event: React.FormEvent) => {
		event.preventDefault();

		setAppliedSearch(searchTerm.trim());
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
			{permissions.canCreatePost && <CreatePostCard />}

			<div className="flex flex-wrap items-center justify-between gap-2">
				<Tabs
					value={sort}
					onValueChange={(value) => setSort(value as PostFeedSort)}
				>
					<TabsList variant={"line"}>
						<TabsTrigger className="cursor-pointer" value="popular">
							{t("social.feed.popular")}
						</TabsTrigger>
						<TabsTrigger className="cursor-pointer" value="recent">
							{t("social.feed.recent")}
						</TabsTrigger>
					</TabsList>
				</Tabs>

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

			<PostList
				posts={posts}
				isLoading={isLoading}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				onReachEnd={fetchNextPage}
				emptyTitle={t("social.feed.empty_title")}
				emptyDescription={t("social.feed.empty_description")}
			/>
		</div>
	);
}
