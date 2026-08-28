import { ensureAuthenticated, ensureRoutePermissions } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { pageTitle } from "@/utils/page-title";

const staticData = {
	requiredPermissions: ["administration.dashboard"],
};

export const Route = createFileRoute('/(private)/admin-land/dashboard')({
  head: () => ({ meta: [{ title: pageTitle("dashboard") }] }),
  staticData: { breadcrumb: { labelKey: "page_title.dashboard" } },
  component: RouteComponent,
  beforeLoad: async () => {
    await ensureAuthenticated();
    await ensureRoutePermissions(staticData);
  },
})

function RouteComponent() {
  return <div>Hello "/(private)/admin-land/dashboard"!</div>
}
