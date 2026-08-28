import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Bell, Shield } from 'lucide-react'
import { Breadcrumbs } from '@/components/global/breadcrumbs'
import { Button } from '@/components/ui/button'
import { LanguagePicker } from '@/components/global/language-change-button'
import Sidebar from '@/components/global/sidebar'
import { ensureAuthenticated } from '@/utils/route-guards'

export const Route = createFileRoute('/(private)/admin-land')({
  staticData: {
    breadcrumb: {
      labelKey: "breadcrumb.admin",
      href: "/admin-land/dashboard",
      icon: Shield,
    },
  },
  beforeLoad: async () => {
    await ensureAuthenticated();
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex w-full h-full">
			<Sidebar />
			<div className="flex-1 flex flex-col min-w-0">
				<div className="h-18 w-full p-4 px-8 border-b border-border flex justify-between shrink-0">
					<Breadcrumbs className="shrink-0" />
					<div className="flex gap-2">
						<LanguagePicker />
						<Button  variant={"default"} size={"icon"}>
							<Bell />
						</Button>
					</div>
				</div>
				<div className="flex flex-col flex-1 min-h-0 overflow-auto [scrollbar-gutter:stable]">
					<Outlet />
				</div>
			</div>
		</div>
  )
}
