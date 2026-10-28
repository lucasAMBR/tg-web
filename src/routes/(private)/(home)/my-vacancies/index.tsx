import MyVacanciesContent from '@/components/my-vacancies/my-vacancies-content';
import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';
import { pageTitle } from "@/utils/page-title";

export const Route = createFileRoute('/(private)/(home)/my-vacancies/')({
  head: () => ({ meta: [{ title: pageTitle("my_vacancies") }] }),
  staticData: { breadcrumb: { labelKey: "page_title.my_vacancies" } },
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
        <h2 className='text-3xl font-bold'>{t("my_vacancies.title")}</h2>
        <p className='text-sm text-muted-foreground'>{t("my_vacancies.description")}</p>
      </div>

      <MyVacanciesContent />
    </div>
  )
}
