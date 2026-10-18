import { createFileRoute } from "@tanstack/react-router";
import LanguageAssessmentManager from "@/components/language-assessment/language-assessment-manager";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute(
	"/(private)/(home)/my-vacancies/$id/language-assessment",
)({
	head: () => ({ meta: [{ title: pageTitle("language_assessment") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.language_assessment",
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
			<LanguageAssessmentManager vacancyId={id} />
		</div>
	);
}
