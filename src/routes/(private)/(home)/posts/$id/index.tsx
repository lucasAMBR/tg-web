import { createFileRoute } from "@tanstack/react-router";
import PostDetail from "@/components/social/post-detail";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/posts/$id/")({
	head: () => ({ meta: [{ title: pageTitle("post") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.post",
			parents: [{ labelKey: "page_title.feed", href: "/feed" }],
		},
	},
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<div className="flex flex-1 flex-col gap-4 p-8">
			<PostDetail postId={id} />
		</div>
	);
}
