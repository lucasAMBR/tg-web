import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/create/address')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/create/address"!</div>
}
