import { createFileRoute } from "@tanstack/react-router";
import FavoritePostsList from "@/components/social/favorite-posts-list";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/favorites/")({
	head: () => ({ meta: [{ title: pageTitle("favorites") }] }),
	staticData: { breadcrumb: { labelKey: "page_title.favorites" } },
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-8">
			<FavoritePostsList />
		</div>
	);
}
