import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFavoritePostsFeed } from "@/hooks/use-post-feed";
import PostList from "./post-list";

/**
 * Postagens favoritadas pelo usuário, ordenadas pela data do post. Desfavoritar
 * aqui tira o card da lista, porque ele deixa de pertencer a ela.
 */
export default function FavoritePostsList() {
	const { t } = useTranslation();

	const [searchTerm, setSearchTerm] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");

	const { posts, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useFavoritePostsFeed({ search: appliedSearch });

	const handleSearch = (event: React.FormEvent) => {
		event.preventDefault();

		setAppliedSearch(searchTerm.trim());
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
			<form className="flex flex-row gap-2" onSubmit={handleSearch}>
				<Input
					placeholder={t("social.favorites.search_placeholder")}
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
				/>
				<Button type="submit" variant={"secondary"}>
					<Search /> {t("general.search")}
				</Button>
			</form>

			<PostList
				posts={posts}
				isLoading={isLoading}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				onReachEnd={fetchNextPage}
				emptyTitle={t("social.favorites.empty_title")}
				emptyDescription={t("social.favorites.empty_description")}
				removeOnUnfavorite
			/>
		</div>
	);
}
