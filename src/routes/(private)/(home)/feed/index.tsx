import { createFileRoute } from "@tanstack/react-router";
import PostFeed from "@/components/social/post-feed";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/feed/")({
	head: () => ({ meta: [{ title: pageTitle("feed") }] }),
	staticData: { breadcrumb: { labelKey: "page_title.feed" } },
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-8">
			<PostFeed />
		</div>
	);
}
