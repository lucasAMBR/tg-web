import { createFileRoute } from "@tanstack/react-router";
import VacancyDetails from "@/components/vacancies/vacancy-details";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/vacancies/$id/")({
	head: () => ({ meta: [{ title: pageTitle("vacancy_details") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.vacancy_details",
			parents: [{ labelKey: "page_title.vacancies", clickable: false }],
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
			<VacancyDetails vacancyId={id} />
		</div>
	);
}
