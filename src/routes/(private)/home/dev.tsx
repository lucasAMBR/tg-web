import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/home/dev')({
  component: RouteComponent,
  beforeLoad: async () => {
      await ensureAuthenticated();
      await ensureProfileCreated();
  }
})

function RouteComponent() {
  return <div>Hello "/(private)/home/dev"!</div>
}
