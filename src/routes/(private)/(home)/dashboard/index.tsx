import { createFileRoute } from "@tanstack/react-router";
import CompanyDashboard from "@/components/dashboard/company-dashboard";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
	ensureRoutePermissions,
} from "@/utils/route-guards";

const staticData = {
	requiredPermissions: ["company.dashboard"],
};

export const Route = createFileRoute("/(private)/(home)/dashboard/")({
	head: () => ({ meta: [{ title: pageTitle("dashboard") }] }),
	staticData: { breadcrumb: { labelKey: "page_title.dashboard" } },
	component: CompanyDashboard,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
		await ensureRoutePermissions(staticData);
	},
});
