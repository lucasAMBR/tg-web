import { CompanyTable } from '@/components/admin-land/company/company-table';
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/(private)/admin-land/company/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();

  return(
    <div className='flex flex-1 flex-col p-8'>
      <div className='flex flex-col gap-1 mb-5'>
        <h2 className='text-3xl font-bold'>{t("admin_land.companies.title")}</h2>
        <p className='text-sm text-muted-foreground'>{t("admin_land.companies.description")}</p>
      </div>

      <CompanyTable />
    </div>
  )
}
