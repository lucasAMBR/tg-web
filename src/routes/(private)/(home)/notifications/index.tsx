import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/global/notification";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/notifications/")({
	head: () => ({ meta: [{ title: pageTitle("notifications") }] }),
	staticData: { breadcrumb: { labelKey: "page_title.notifications" } },
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

/** No celular o sino do header abre esta tela no lugar do popover. */
function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col p-4 md:p-8">
			<NotificationsPage />
		</div>
	);
}
