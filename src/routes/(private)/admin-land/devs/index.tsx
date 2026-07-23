import { DevTable } from '@/components/admin-land/devs/dev-table';
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/(private)/admin-land/devs/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();

  return(
    <div className='flex flex-1 flex-col p-8'>
      <div className='flex flex-col gap-1 mb-5'>
        <h2 className='text-3xl font-bold'>{t("admin_land.devs.title")}</h2>
        <p className='text-sm text-muted-foreground'>{t("admin_land.devs.description")}</p>
      </div>


      <DevTable />
    </div>
  )
}
