import { createFileRoute } from "@tanstack/react-router";
import CommentThread from "@/components/social/comment-thread";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute(
	"/(private)/(home)/posts/$id/thread/$commentId/",
)({
	head: () => ({ meta: [{ title: pageTitle("thread") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.thread",
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
	const { id, commentId } = Route.useParams();

	return (
		<div className="flex flex-1 flex-col gap-4 p-8">
			<CommentThread postId={id} commentId={commentId} />
		</div>
	);
}
