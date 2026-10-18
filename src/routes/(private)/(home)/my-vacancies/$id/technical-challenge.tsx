import { createFileRoute } from "@tanstack/react-router";
import TechnicalChallengeManager from "@/components/technical-challenge/technical-challenge-manager";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute(
	"/(private)/(home)/my-vacancies/$id/technical-challenge",
)({
	head: () => ({ meta: [{ title: pageTitle("technical_challenge") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.technical_challenge",
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
			<TechnicalChallengeManager vacancyId={id} />
		</div>
	);
}
