import { createFileRoute } from "@tanstack/react-router";
import FreelanceFeedPage from "@/components/freelance/freelance-feed-page";
import { FREELANCE_PARTY_ROLES } from "@/types/freelance";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
	ensureRole,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/freelances/$id/feed")({
	head: () => ({ meta: [{ title: pageTitle("freelance_feed") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.freelance_feed",
			parents: [{ labelKey: "page_title.freelances", href: "/freelances" }],
		},
	},
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
		await ensureRole(FREELANCE_PARTY_ROLES);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<div className="flex flex-1 flex-col gap-4 p-8">
			<FreelanceFeedPage vacancyId={id} />
		</div>
	);
}
