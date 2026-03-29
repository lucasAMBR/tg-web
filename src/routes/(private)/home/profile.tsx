import ThemeToggle from '@/components/global/theme-toggle-button';
import HardSkillList from '@/components/profile/hard-skill/hard-skill-list';
import SoftSkillList from '@/components/profile/soft-skill/soft-skill-list';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import { getNameFromProfile, getProfileBio, getProfileScore, getRoleLabel } from '@/utils/role-helper';
import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { Theater, User } from 'lucide-react';

export const Route = createFileRoute('/(private)/home/profile')({
  component: RouteComponent,
  beforeLoad: async () => {
      await ensureAuthenticated();
      await ensureProfileCreated();
  }
})

function RouteComponent() {
  
  const { user } = useAuthStore();

  return (
    <div className='flex-1 p-4 flex flex-col gap-4'>
      <Card className='w-full flex flex-row px-12 py-8 gap-4 items-center'>
        <Avatar className='size-32'>
          <AvatarFallback className='bg-primary text-primary-foreground'><User className='size-22'/></AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-2'>
          <h2 className='text-4xl font-bold font-[Anta]'>{getNameFromProfile(user)}</h2>
          <div className='flex gap-2'>
            <Badge variant={"secondary"}>{getRoleLabel(user)}</Badge>
            <Badge variant={"destructive"}>{"Score: " + getProfileScore(user)}</Badge>
          </div>
          <p>{getProfileBio(user)}</p>
        </div>
      </Card>
      <div className='flex-1 flex gap-4 mt-3'>
        <div className='flex-2'>
          <Tabs defaultValue='posts'>
            <TabsList variant={"line"}>
              <TabsTrigger className='text-xl cursor-pointer' value='posts'>Posts</TabsTrigger>
              <TabsTrigger className='text-xl cursor-pointer' value='projects'>Projects</TabsTrigger>
              <TabsTrigger className='text-xl cursor-pointer' value='job_history'>Job History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className='flex-1 flex flex-col gap-6'>
          <HardSkillList profileId={user?.dev_profile?.id as string} />
          <SoftSkillList profileId={user?.dev_profile?.id as string} />
        </div>
      </div>
      <ThemeToggle />
    </div>
  )
}
