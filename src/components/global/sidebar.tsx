import { Building, Calendar, Cog, Edit, EllipsisVertical, Folder, List, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/AuthenticatedUser";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useNavigate } from "@tanstack/react-router";

export default function Sidebar(){

    const navigate = useNavigate();

    const { theme } = useTheme();

    const { user } = useAuthStore();

     const role = user?.role[0] as UserRole;

    return(
        <div className="w-[350px] flex flex-col h-screen border-r border-border">
            <div className='flex flex-row gap-1.5 items-end justify-center p-4 border-b border-border h-18'>
                <img src={theme === 'dark' ? `/images/dark_mode_logo.png` : `/images/light_mode_logo.png`} className='w-11'/>
                <p className="text-primary text-3xl font-bold font-['Agbalumo']">{import.meta.env.VITE_APP_NAME}</p>
            </div>
            <div className="flex flex-col gap-4 flex-1 p-4">
                <div className="w-full">
                    <p className="text-xs text-muted-foreground mb-2">Sections</p>
                    <div className="bg-primary text-primary-foreground w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1"><List className="size-4"/> Feed</div>
                    <div className="w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1"><Building className="size-4"/> Companies</div>
                    <div className="w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1"><Folder className="size-4" /> Job Vacancies</div>
                    <div className="w-full flex gap-2 items-center p-0.5 rounded-md px-2"><Calendar className="size-4" /> Freelances</div>
                </div>
                <div className="w-full">
                    <p className="text-xs text-muted-foreground mb-2">Options</p>
                    <div onClick={() => navigate({to: "/home/profile"})} className="w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1"><User className="size-4"/> My profile</div>
                    <div className="w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1"><Cog className="size-4"/> Configuration</div>
                </div>
            </div>
            <div className="flex items-center border-t border-border p-5 justify-between">
                <div className="flex gap-4 items-center">
                    <Avatar className="size-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{role === "dev" && user?.dev_profile?.name}</p>
                        <p className="text-xs">{user?.email}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}><EllipsisVertical /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Me</DropdownMenuLabel>
                            <DropdownMenuItem><User /> Profile</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem><Edit /> Update account info</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive"><LogOut /> Logout</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}