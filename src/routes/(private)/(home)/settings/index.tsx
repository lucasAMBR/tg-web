import type { RecommendationPreferencesModel } from '@/api/generated/models';
import { useGetDevRecommendationPreference } from '@/api/generated/recommendation-preferences/recommendation-preferences';
import ThemeToggle from '@/components/global/theme-toggle-button';
import CompanyUpdateProfileForm from '@/components/settings/company-update-profile-form';
import CustomRecommendationDistances from '@/components/settings/custom-recommendation-distances';
import CustomRecommendationJobModality from '@/components/settings/custom-recommendation-job-modality';
import CustomRecommendationJobType from '@/components/settings/custom-recommendation-job-type';
import CustomStackRecommendation from '@/components/settings/custom-stack-recommendation';
import ClientUpdateProfileForm from '@/components/settings/client-update-profile-form';
import DevUpdateProfileForm from '@/components/settings/dev-update-profile-form';
import PasswordChange from '@/components/settings/password-change';
import { ToggleTheme } from '@/components/settings/theme-toggle';
import UpdateAddressForm from '@/components/settings/update-address-form';
import UpdateEmailForm from '@/components/settings/update-email-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/auth-store';
import { getUserMainRole } from '@/utils/role-helper';
import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, Check, Trash, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/(private)/(home)/settings/')({
  component: RouteComponent,
    beforeLoad: async () => {
      await ensureAuthenticated();
      await ensureProfileCreated();
    },
})

function RouteComponent() {
    const { t } = useTranslation();

    const [ verification ] = useState<boolean>(false)

    const { user } = useAuthStore();

    const {
      data: preferences,
    } = useGetDevRecommendationPreference(
      user?.dev_profile?.id as string
    );

    console.log(preferences);

    return (
      <div className='flex flex-col p-8'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-3xl font-bold'>{t("settings.title")}</h2>
          <p className='text-sm text-muted-foreground'>{t("settings.description")}</p>
        </div>
        <div className='mt-5 flex-1 w-full'>
              <Tabs defaultValue='account' orientation='vertical' className='flex flex-col md:flex-row gap-6 w-full'>
                <TabsList className='flex-col justify-start h-auto w-full md:w-56 shrink-0 bg-muted dark:bg-card'>
                  <TabsTrigger
                    key="account"
                    value="account"
                    className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {t("settings.tabs.account")}
                  </TabsTrigger>

                  <TabsTrigger
                    key="profile"
                    value="profile"
                    className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {t("settings.tabs.profile")}
                  </TabsTrigger>

                  <TabsTrigger
                    key="theme"
                    value="theme"
                    className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {t("settings.tabs.theme")}
                  </TabsTrigger>

                  {getUserMainRole(user) === "dev" && (
                    <TabsTrigger
                      key="recommendation"
                      value="recommendation"
                      className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {t("settings.tabs.recommendation")}
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent key={"account"} value={"account"} className='flex-1 min-w-0 m-0'>
                  <Card className='p-6 w-full flex flex-col'>
                     <div className='flex-1 flex flex-row gap-12 items-center justify-center'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>{t("settings.account.email_verification.title")}</h3>
                        <p className='text-sm text-muted-foreground'>{t("settings.account.email_verification.description")}</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                        <Card className='p-4 flex flex-row items-center justify-between'>
                          {verification ? (
                              <div className='flex items-center gap-2'>
                                <Check className='size-5'/> <p>{t("settings.account.email_verification.your_email_is_already_verified")}</p>
                              </div>
                            ) : (
                              <div className='flex items-center gap-2'>
                                <X className='size-5' /> <p>{t("settings.account.email_verification.your_email_is_not_verified")}</p>
                              </div>
                            )}
                            <Button variant={"outline"} disabled={verification}>{t("settings.account.email_verification.send_verification")}</Button>
                        </Card>
                      </div>
                    </div>
                    <Separator className='my-6'/>
                    <div className='flex-1 flex flex-row gap-12 items-center justify-center'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>{t("settings.account.change_associated_email.title")}</h3>
                        <p className='text-sm text-muted-foreground'>{t("settings.account.change_associated_email.description")}</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                          <UpdateEmailForm />
                      </div>
                    </div>
                    <Separator className='my-6' />
                     <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>{t("settings.account.password_change.title")}</h3>
                        <p className='text-sm text-muted-foreground'>{t("settings.account.password_change.description")}</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                        <PasswordChange />
                      </div>
                    </div>
                    <Separator className='my-6'/>
                     <Card className='flex-1 flex flex-row gap-12 p-4 bg-red-900/2 items-center'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium text-red-800'>{t("settings.account.delete_account.title")}</h3>
                        <p className='text-sm text-muted-foreground'>{t("settings.account.delete_account.description")}</p>
                      </div>
                      <div className='flex-2 min-w-0 flex justify-end'>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant={"destructive"}><Trash /> {t("general.delete")}</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className='text-red-600'>
                                {t("general.are_you_sure")}
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <p className='text-sm text-red-600'>{t("settings.account.delete_account.delete_account_confirmation")}</p>
                            <AlertDialogFooter>
                              <AlertDialogCancel variant="outline">{t("general.cancel")}</AlertDialogCancel>
                              <Button variant={"destructive"}>{t("general.delete")}</Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  </Card>
                </TabsContent>
                <TabsContent key={"profile"} value={"profile"} className='flex-1 min-w-0 m-0'>
                  <Card className='p-6 w-full flex flex-col'>
                     <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>{t("settings.profile.update_profile.title")}</h3>
                        <p className='text-sm text-muted-foreground'>{t("settings.profile.update_profile.description")}</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                        {getUserMainRole(user) === "dev" && (<DevUpdateProfileForm />)}
                        {getUserMainRole(user) === "company" && (<CompanyUpdateProfileForm />)}
                        {getUserMainRole(user) === "client" && (<ClientUpdateProfileForm />)}
                      </div>
                    </div>
                    <Separator className='my-6'/> 
                     <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>{t("settings.profile.location_informations.title")}</h3>
                        <p className='text-sm text-muted-foreground'>{t("settings.profile.location_informations.description")}</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                        <UpdateAddressForm />
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                <TabsContent value='theme'>
                  <ToggleTheme />
                </TabsContent>
                <TabsContent value='recommendation'>
                  <Card className='p-4'>
                    <Alert className='dark:bg-amber-400/10 bg-yellow-400/60'>
                      <AlertTitle className='text-xl flex flex-row gap-2 items-center'><AlertTriangle className='size-5'/> {t("settings.recommendation.warning.title")}</AlertTitle>
                      <AlertDescription className='text-black dark:text-white'>
                        {t("settings.recommendation.warning.description")}
                      </AlertDescription>
                    </Alert>
                    <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>{t("settings.recommendation.contract_type.title")}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {t("settings.recommendation.contract_type.description")}
                        </p>
                      </div>
                      <CustomRecommendationJobType 
                        profileId={user?.dev_profile?.id as string} 
                        initialData={preferences?.data as RecommendationPreferencesModel}
                      />
                    </div>

                    <Separator className='my-6'/>

                    <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>{t("settings.recommendation.job_modality.title")}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {t("settings.recommendation.job_modality.description")}
                        </p>
                      </div>
                      <CustomRecommendationJobModality 
                        profileId={user?.dev_profile?.id as string} 
                        initialData={preferences?.data as RecommendationPreferencesModel}
                      />
                    </div>
                    <Separator className='my-6'/>
                    <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>{t("settings.recommendation.recommendation_radius.title")}</h3>
                        <p className='text-sm text-muted-foreground'>{t("settings.recommendation.recommendation_radius.description")}</p>
                        <br />
                        <p className='text-sm text-muted-foreground font-bold'>{t("settings.recommendation.recommendation_radius.description_2")}</p>
                      </div>
                      <CustomRecommendationDistances 
                        profileId={user?.dev_profile?.id as string} 
                        initialData={preferences?.data as RecommendationPreferencesModel}
                      />
                    </div>
                    <Separator className='my-6'/>
                    <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                          <h3 className='text-xl font-medium'>{t("settings.recommendation.algorithm_flexibility.title")}</h3>
                        <p className='text-sm text-muted-foreground'>{t("settings.recommendation.algorithm_flexibility.description")}</p>
                      </div>
                      <CustomStackRecommendation 
                        profileId={user?.dev_profile?.id as string} 
                        initialData={preferences?.data as RecommendationPreferencesModel}
                      />
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
        </div>
        <ThemeToggle />
      </div>
    )
}
