import { useShowProficiencyTest } from '@/api/generated/proficiency-test/proficiency-test';
import { Logo } from '@/components/global/Logo';
import ThemeToggle from '@/components/global/theme-toggle-button';
import { Button } from '@/components/ui/button';
import { Card, } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { env } from '@/utils/env';
import { ensureAuthenticated, ensureRoutePermissions } from '@/utils/route-guards';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const staticData = {
    requiredPermissions: ["proficiency_test.submit"]
}

export const Route = createFileRoute('/(private)/proficiency-test/$id/start')({
    component: RouteComponent,
    beforeLoad: async () => {
        await ensureAuthenticated();
        ensureRoutePermissions(staticData);
    },
})

function RouteComponent() {

    const { id } = Route.useParams();

    const { t } = useTranslation();

    const { user } = useAuthStore();

    const { 
        data: test, 
        isError
    } = useShowProficiencyTest(id);

    const navigate = useNavigate();

    if(isError || !test) {
        return (
            <div className='flex-1 flex justify-center items-center'>
                <Card className='p-4'>
                    {t("dev_profile.proficiency_test.start.error")}
                </Card>
            </div>            
        );
    }

    if(test.data.dev_profile_id !== user?.dev_profile?.id) {
        return (
            <div className='flex-1 flex justify-center items-center'>
                <Card className='p-4'>
                    {t("dev_profile.proficiency_test.start.not_your_test")}
                </Card>
            </div>            
        );        
    }

    return ( 
        <div className='flex-1 flex justify-center items-center'>
            <Card className='p-20 w-full max-w-1/2 flex flex-col items-center justify-center'>
                <div className="flex flex-col justify-center items-center">
                    <Logo className="w-12 fill-primary" />
                    <p className="font-[Agbalumo] text-primary text-5xl">
                        {env.APP_NAME}
                    </p>
                </div>
                <div className='flex flex-col items-center gap-2'>
                    <h2 className='text-3xl font-bold'>{t("dev_profile.proficiency_test.start.greeting", { name: user.dev_profile.name })}</h2>
                    <h3 className='text-xl'>{t("dev_profile.proficiency_test.start.welcome")}</h3>
                </div>
                <div className='flex flex-col gap-2 text-muted-foreground items-center justify-center'>
                    <p className='w-full text-left text-lg font-semibold text-foreground'>{t("dev_profile.proficiency_test.start.rules")}</p>
                    <ul className='list-disc'>
                        <li>{t("dev_profile.proficiency_test.start.rule_time")}</li>
                        <li>{t("dev_profile.proficiency_test.start.rule_focus")}</li>
                        <li>{t("dev_profile.proficiency_test.start.rule_open_close")}</li>
                        <li>{t("dev_profile.proficiency_test.start.rule_consistency")}</li>
                    </ul>
                    <p className='text-left w-full text-lg text-foreground'>{t("dev_profile.proficiency_test.start.score_warning")}</p>
                </div>
                <Button className='w-full' onClick={() => navigate({ to: `/proficiency-test/${id}/test`})}><Play /> {t("dev_profile.proficiency_test.start_test")}</Button>
            </Card>
            <ThemeToggle />
        </div>
    );
}
