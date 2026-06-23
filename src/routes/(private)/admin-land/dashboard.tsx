import { ensureAuthenticated, ensureRoutePermissions } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'

const staticData = {
	requiredPermissions: ["administration.dashboard"],
};

export const Route = createFileRoute('/(private)/admin-land/dashboard')({
  component: RouteComponent,
  beforeLoad: async () => {
    await ensureAuthenticated();
    await ensureRoutePermissions(staticData);
  },
})

function RouteComponent() {
  return <div>Hello "/(private)/admin-land/dashboard"!</div>
}
