import type { RecommendationPreferencesModel } from '@/api/generated/models';
import { useGetDevRecommendationPreference } from '@/api/generated/recommendation-preferences/recommendation-preferences';
import ThemeToggle from '@/components/global/theme-toggle-button';
import { ColorPicker } from '@/components/settings/color-picker';
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
import { DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/auth-store';
import { getUserMainRole } from '@/utils/role-helper';
import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { AlertOctagon, AlertTriangle, Check, Trash, X } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/(private)/home/settings')({
  component: RouteComponent,
    beforeLoad: async () => {
      await ensureAuthenticated();
      await ensureProfileCreated();
    },
})

function RouteComponent() {

    const [ verification, setVerification ] = useState<boolean>(false)

    const { user } = useAuthStore();

    const {
      data: preferences,
      isLoading
    } = useGetDevRecommendationPreference(
      user?.dev_profile?.id as string
    );

    console.log(preferences);

    return (
      <div className='flex flex-col p-8'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-3xl font-bold'>Settings</h2>
          <p className='text-sm text-muted-foreground'>Configure your experience as you want</p>
        </div>
        <div className='mt-5 flex-1 w-full'>
              <Tabs defaultValue='account' orientation='vertical' className='flex flex-col md:flex-row gap-6 w-full'>
                <TabsList className='flex-col justify-start h-auto w-full md:w-56 shrink-0 bg-muted dark:bg-card'>
                  <TabsTrigger
                    key="account"
                    value="account"
                    className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Account
                  </TabsTrigger>

                  <TabsTrigger
                    key="profile"
                    value="profile"
                    className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Profile
                  </TabsTrigger>

                  <TabsTrigger
                    key="theme"
                    value="theme"
                    className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Theme
                  </TabsTrigger>

                  {getUserMainRole(user) === "dev" && (
                    <TabsTrigger
                      key="recommendation"
                      value="recommendation"
                      className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Recommendation
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent key={"account"} value={"account"} className='flex-1 min-w-0 m-0'>
                  <Card className='p-6 w-full flex flex-col'>
                     <div className='flex-1 flex flex-row gap-12 items-center justify-center'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>E-mail verification</h3>
                        <p className='text-sm text-muted-foreground'>This will help us to send you the best oportunities, even out of our platform, and help to let your account more secure with access report and access code sending!</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                        <Card className='p-4 flex flex-row items-center justify-between'>
                          {verification ? (
                              <div className='flex items-center gap-2'>
                                <Check className='size-5'/> <p>Your e-email is already verified yet</p>
                              </div>
                            ) : (
                              <div className='flex items-center gap-2'>
                                <X className='size-5' /> <p>Your e-email is not verified yet</p>
                              </div>
                            )}
                            <Button variant={"outline"} disabled={verification}>Send verification</Button>
                        </Card>
                      </div>
                    </div>
                    <Separator className='my-6'/>
                    <div className='flex-1 flex flex-row gap-12 items-center justify-center'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>Change associated e-mail</h3>
                        <p className='text-sm text-muted-foreground'>Warning: If your update this, your credentials do sing in will be changed, so remember the new email to this account</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                          <UpdateEmailForm />
                      </div>
                    </div>
                    <Separator className='my-6' />
                     <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>Password change</h3>
                        <p className='text-sm text-muted-foreground'>Warning: If your update this, your credentials do sing in will be changed, so remember the new password to this account</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                        <PasswordChange />
                      </div>
                    </div>
                    <Separator className='my-6'/>
                     <Card className='flex-1 flex flex-row gap-12 p-4 bg-red-900/2 items-center'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium text-red-800'>Delete account</h3>
                        <p className='text-sm text-muted-foreground'>Warning: By click in this button and confirm your actual password your account will be DELETED, your posts inaccessible by other users e etc</p>
                      </div>
                      <div className='flex-2 min-w-0 flex justify-end'>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant={"destructive"}><Trash /> Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className='text-red-600'>
                                Are you sure?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <p className='text-sm text-red-600'>The action you're about to done is HIGHLY DESTRUCTIVE and will delete every single data about you in this platform in a permanent and irreversible way!</p>
                            <AlertDialogFooter>
                              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                              <Button variant={"destructive"}> Delete</Button>
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
                        <h3 className='text-xl font-medium'>Update your profile</h3>
                        <p className='text-sm text-muted-foreground'>Update your profile information, this will help us to know you better and recommend you the best</p>
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
                        <h3 className='text-xl font-medium'>Location Informations</h3>
                        <p className='text-sm text-muted-foreground'>Manage the informations about your location, address, country, this will help us to know where you live to recommend to you the perfect job vacancies</p>
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
                      <AlertTitle className='text-xl flex flex-row gap-2 items-center'><AlertTriangle className='size-5'/> Warning</AlertTitle>
                      <AlertDescription className='text-black dark:text-white'>
                        Change this configuration directly affects how you are recommended by our algorithm to companies. If your custom parameters are unrealistic, you may be ignored for some positions where you would otherwise be highly recommended.
                      </AlertDescription>
                    </Alert>
                    <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>Contract Type</h3>
                        <p className='text-sm text-muted-foreground'>
                          Select the employment arrangements that fit your career goals. The algorithm will filter out opportunities that do not match your preferred contract types.
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
                        <h3 className='text-xl font-medium'>Job Modality</h3>
                        <p className='text-sm text-muted-foreground'>
                          Define your preferred work environment. The recommendation engine will prioritize roles that align with your flexibility and location preferences.
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
                        <h3 className='text-xl font-medium'>Recommendation Radius</h3>
                        <p className='text-sm text-muted-foreground'>Custom the maximum distance between you and the job that we recommend to you, this configuration is split between the job modalities</p>
                        <br />
                        <p className='text-sm text-muted-foreground font-bold'>This custom configuration will only be applied if profile doesn't have the "Open to relocation" activated who will remove completly any distance limitation!</p>
                      </div>
                      <CustomRecommendationDistances 
                        profileId={user?.dev_profile?.id as string} 
                        initialData={preferences?.data as RecommendationPreferencesModel}
                      />
                    </div>
                    <Separator className='my-6'/>
                    <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>Algorithm flexibility</h3>
                        <p className='text-sm text-muted-foreground'>Custom the languages and frameworks the flexibility on our recommendation system, your will to learn a new technology, techologies that  you don't wanna be related</p>
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
