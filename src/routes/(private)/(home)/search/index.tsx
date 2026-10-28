import SearchContent from '@/components/search/search-content';
import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';
import { pageTitle } from "@/utils/page-title";

export const Route = createFileRoute('/(private)/(home)/search/')({
  head: () => ({ meta: [{ title: pageTitle("search") }] }),
  staticData: { breadcrumb: { labelKey: "page_title.search" } },
  component: RouteComponent,
  beforeLoad: async () => {
    await ensureAuthenticated();
    await ensureProfileCreated();
  },
})

function RouteComponent() {
  const { t } = useTranslation();

  return(
    <div className='flex flex-1 flex-col p-8'>
      <div className='flex flex-col gap-1 mb-5'>
        <h2 className='text-3xl font-bold'>{t("search.title")}</h2>
        <p className='text-sm text-muted-foreground'>{t("search.description")}</p>
      </div>

      <SearchContent />
    </div>
  )
}
