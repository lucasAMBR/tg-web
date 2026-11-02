import { ensureAuthenticated, ensureRoutePermissions } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import { pageTitle } from "@/utils/page-title";

const staticData = {
	requiredPermissions: ["administration.dashboard"],
};

export const Route = createFileRoute('/(private)/admin-land/dashboard')({
  head: () => ({ meta: [{ title: pageTitle("dashboard") }] }),
  staticData: { breadcrumb: { labelKey: "page_title.dashboard" } },
  component: AdminDashboard,
  beforeLoad: async () => {
    await ensureAuthenticated();
    await ensureRoutePermissions(staticData);
  },
})
