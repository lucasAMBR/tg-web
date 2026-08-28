import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { pageTitle } from "@/utils/page-title";

export const Route = createFileRoute('/(private)/(home)/feed/')({
    head: () => ({ meta: [{ title: pageTitle("feed") }] }),
    staticData: { breadcrumb: { labelKey: "page_title.feed" } },
    component: RouteComponent,
    beforeLoad: async () => {
        await ensureAuthenticated();
        await ensureProfileCreated();
    },
})

function RouteComponent() {
  return <div>Hello "/feed"!</div>
}
