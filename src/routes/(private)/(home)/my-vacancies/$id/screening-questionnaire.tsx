import { createFileRoute } from "@tanstack/react-router";
import QuestionnaireManager from "@/components/screening-questionnaire/questionnaire-manager";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute(
	"/(private)/(home)/my-vacancies/$id/screening-questionnaire",
)({
	head: () => ({ meta: [{ title: pageTitle("screening_questionnaire") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.screening_questionnaire",
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
			<QuestionnaireManager vacancyId={id} />
		</div>
	);
}
