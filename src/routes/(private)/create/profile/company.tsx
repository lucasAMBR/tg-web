import {
	ensureAuthenticated,
	ensureRoutePermissions,
} from "@/utils/route-guards";
import { createFileRoute } from "@tanstack/react-router";

const staticData = {
	requiredPermissions: ["company_profile.create"],
};

export const Route = createFileRoute("/(private)/create/profile/company")({
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		ensureRoutePermissions(staticData);
	},
});

function RouteComponent() {
	return <div>Hello "/(private)/create/profile/company"!</div>;
}
