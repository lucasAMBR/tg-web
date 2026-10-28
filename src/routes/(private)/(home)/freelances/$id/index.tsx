import { createFileRoute } from "@tanstack/react-router";
import FreelanceVacancyDetails from "@/components/freelance/freelance-vacancy-details";
import { FREELANCE_PARTY_ROLES } from "@/types/freelance";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
	ensureRole,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/freelances/$id/")({
	head: () => ({ meta: [{ title: pageTitle("freelance_details") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.freelance_details",
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
			<FreelanceVacancyDetails vacancyId={id} backTo="/freelances" />
		</div>
	);
}
