import { useAuthStore } from '@/stores/auth-store'
import { ensureAuthenticated, ensureRoutePermissions } from '@/utils/route-guards'
import { createFileRoute } from '@tanstack/react-router'

const staticData = {
  requiredPermissions: ['dev_profile.create']
}

export const Route = createFileRoute('/(private)/create/profile/dev')({
    component: RouteComponent,
    beforeLoad: async() => {
      await ensureAuthenticated();
      ensureRoutePermissions(staticData);        
    }
})

function RouteComponent() {
  return <div>Hello "/(private)/create/profile/dev"!</div>
}
