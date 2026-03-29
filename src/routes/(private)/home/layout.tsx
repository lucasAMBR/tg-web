import Sidebar from '@/components/global/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Bell, Search } from 'lucide-react';

export const Route = createFileRoute('/(private)/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex w-screen h-screen'>
        <Sidebar />
        <div className='flex-1 flex flex-col'>
          <div className='h-18 w-full p-4 border-b border-border flex justify-between'>
            <div className='flex gap-2'>
              <div className='relative'>
                <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                  <Search className='size-4' />
                  <span className='sr-only'>User</span>
                </div>
                <Input type='text' placeholder='Search' className='peer pl-9' />
              </div>
              <Button variant={"secondary"}>Search</Button>
            </div>
            <Button variant={"default"} size={"icon"}><Bell /></Button>
          </div>
          <div className='flex flex-col flex-1 overflow-y-auto'>
            <Outlet />
          </div>
        </div>
    </div>
  );
}
