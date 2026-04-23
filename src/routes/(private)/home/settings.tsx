import ThemeToggle from '@/components/global/theme-toggle-button';
import DevUpdateProfileForm from '@/components/settings/dev-update-profile-form';
import PasswordChange from '@/components/settings/password-change';
import { ToggleTheme } from '@/components/settings/theme-toggle';
import UpdateAddressForm from '@/components/settings/update-address-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { Check, Trash, X } from 'lucide-react';
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

                  <TabsTrigger
                    key="job recommendation"
                    value="job recommendation"
                    className="w-full text-md dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Recommendation
                  </TabsTrigger>
                </TabsList>
                <TabsContent key={"account"} value={"account"} className='flex-1 min-w-0 m-0'>
                  <Card className='p-6 w-full flex flex-col'>
                     <div className='flex-1 flex flex-row gap-12 items-center justify-center'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>E-mail verification</h3>
                        <p className='text-sm text-muted-foreground'>Caution: If your update this, your credentials do sing in will be changed, so remember the new password to this account</p>
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
                        <p className='text-sm text-muted-foreground'>Caution: If your update this, your credentials do sing in will be changed, so remember the new password to this account</p>
                      </div>
                      <div className='flex-2 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <Input placeholder="Your email here" />
                            <Button>Change</Button>
                          </div>
                      </div>
                    </div>
                    <Separator className='my-6' />
                     <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>Password change</h3>
                        <p className='text-sm text-muted-foreground'>Caution: If your update this, your credentials do sing in will be changed, so remember the new password to this account</p>
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
                        <Button variant={"destructive"}><Trash /> Delete</Button>
                      </div>
                    </Card>
                  </Card>
                </TabsContent>
                <TabsContent key={"profile"} value={"profile"} className='flex-1 min-w-0 m-0'>
                  <Card className='p-6 w-full flex flex-col'>
                     <div className='flex-1 flex flex-row gap-12'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-medium'>E-mail verification</h3>
                        <p className='text-sm text-muted-foreground'>Confirm you access to email that are vinculated to this account, this help us know if is secure to send you password recovery code </p>
                      </div>
                      <div className='flex-2 min-w-0'>
                        <DevUpdateProfileForm />
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
              </Tabs>
        </div>
        <ThemeToggle />
      </div>
    )
}
