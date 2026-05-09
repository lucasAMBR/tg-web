import {
	Building,
	Calendar,
	Cog,
	Edit,
	EllipsisVertical,
	Folder,
	List,
	LogOut,
	User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/AuthenticatedUser";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "@tanstack/react-router";
import LogoutButton from "./logout-button";
import type { LucideIcon } from "lucide-react";
import { getNameFromProfile, getUserMainRole } from "@/utils/role-helper";
import { Logo } from "./Logo";

type SidebarItem = {
	title: string;
	icon: LucideIcon;
	url?: string;
	onClick?: () => void;
};

export const sidebarConfig: Record<
	UserRole,
	{
		sections: SidebarItem[];
		options: SidebarItem[];
	}
> = {
	dev: {
		sections: [
			{ title: "Feed", icon: List, url: "/home" },
			{ title: "Companies", icon: Building, url: "/companies" },
			{ title: "Job Vacancies", icon: Folder, url: "/jobs" },
			{ title: "Freelances", icon: Calendar, url: "/freelances" },
		],
		options: [
			{ title: "Profile", icon: User, url: "/home/profile" },
			{ title: "Settings", icon: Cog, url: "/home/settings" },
		],
	},

	company: {
		sections: [
			{ title: "Feed", icon: List, url: "/home" },
			{ title: "My Jobs", icon: Folder, url: "/my-jobs" },
		],
		options: [
			{ title: "Profile", icon: Building, url: "/home/profile" },
			{ title: "Settings", icon: Cog, url: "/home/settings" },
		],
	},

	client: {
		sections: [
			{ title: "Feed", icon: List, url: "/home" },
			{ title: "Freelancers", icon: User, url: "/freelancers" },
		],
		options: [
			{ title: "Profile", icon: User, url: "/home/profile" },
			{ title: "Settings", icon: Cog, url: "/home/settings" },
		],
	},
};

function isActive(url?: string) {
	if (!url) return false;
	return location.pathname === url;
}

export default function Sidebar() {
	const navigate = useNavigate();
	const { user } = useAuthStore();

	const role = getUserMainRole(user);
	console.log(role)
	const config = sidebarConfig[role as UserRole];

	function renderItem(item: SidebarItem) {
		const Icon = item.icon;

		const active = isActive(item.url);

		return (
			<div
				key={item.title}
				onClick={() => {
					if (item.onClick) return item.onClick();
					if (item.url) navigate({ to: item.url });
				}}
				className={`
        w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1 cursor-pointer transition-colors
            ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
        `}
			>
				<Icon className="size-4" />
				{item.title}
			</div>
		);
	}

	return (
		<div className="w-[350px] flex flex-col h-screen border-r border-border">
			{/* HEADER */}
			<div className="flex flex-row gap-1.5 items-end justify-center p-4 border-b border-border h-18">
					<Logo className="w-11 fill-primary" />
				<p className="text-primary text-3xl font-bold font-['Agbalumo']">
					{import.meta.env.VITE_APP_NAME}
				</p>
			</div>

			{/* CONTENT */}
			<div className="flex flex-col gap-4 flex-1 p-4">
				{/* SECTIONS */}
				<div className="w-full">
					<p className="text-xs text-muted-foreground mb-2">Sections</p>
					{config.sections.map(renderItem)}
				</div>

				{/* OPTIONS */}
				<div className="w-full">
					<p className="text-xs text-muted-foreground mb-2">Options</p>

					{config.options.map(renderItem)}

					<LogoutButton text="You’re about to log out of your account. You’ll need to sign in again to access your data and continue using the platform.">
						<div className="w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1 cursor-pointer hover:bg-muted">
							<LogOut className="size-4" />
							Logout
						</div>
					</LogoutButton>
				</div>
			</div>

			{/* FOOTER */}
			<div className="flex items-center border-t border-border p-5 justify-between">
				<div className="flex gap-4 items-center">
					<Avatar className="size-10">
						<AvatarFallback className="bg-primary text-primary-foreground">
							U
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium">
							{getNameFromProfile(user)}
						</p>
						<p className="text-xs">{user?.email}</p>
					</div>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant={"ghost"} size={"icon"}>
							<EllipsisVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="top">
						<DropdownMenuGroup>
							<DropdownMenuLabel>Me</DropdownMenuLabel>
							<DropdownMenuItem>
								<User /> Profile
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem>
								<Edit /> Update account info
							</DropdownMenuItem>
							<LogoutButton text="You’re about to log out of your account. You’ll need to sign in again to access your data and continue using the platform.">
								<DropdownMenuItem variant="destructive">
									<LogOut /> Logout
								</DropdownMenuItem>
							</LogoutButton>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
