import { createFileRoute } from "@tanstack/react-router";
import SelectionProcessTabs from "@/components/my-vacancies/selection-process-tabs";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute(
	"/(private)/(home)/my-vacancies/$id/selection-process",
)({
	head: () => ({ meta: [{ title: pageTitle("selection_process") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.selection_process",
			parents: [{ labelKey: "page_title.my_vacancies", clickable: true }],
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
			<SelectionProcessTabs vacancyId={id} />
		</div>
	);
}
