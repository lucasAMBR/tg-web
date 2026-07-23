import { useState } from "react";
import {
	Building,
	Calendar,
	Cog,
	Edit,
	EllipsisVertical,
	Folder,
	LayoutDashboard,
	List,
	LogOut,
	MessageCircle,
	User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
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
import { useTranslation } from "react-i18next";

export default function Sidebar() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuthStore();
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

	const role = getUserMainRole(user);
	const logoutDialogText = t("sidebar.logout_dialog.description");

	function SidebarItem({
		title,
		icon: Icon,
		url,
		onClick,
	}: {
		title: string;
		icon: LucideIcon;
		url?: string;
		onClick?: () => void;
	}) {
		const active = url ? location.pathname.startsWith(url) : false;

		return (
			<div
				onClick={() => {
					if (onClick) return onClick();
					if (url) navigate({ to: url });
				}}
				className={`
        w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1 cursor-pointer transition-colors
            ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
        `}
			>
				<Icon className="size-4" />
				{title}
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

					{role === "dev" && (
						<>
							<SidebarItem title={t("sidebar.sections.feed")} icon={List} url="/feed" />
							<SidebarItem title={t("sidebar.sections.companies")} icon={Building} url="/companies" />
							<SidebarItem title={t("sidebar.sections.job_vacancies")} icon={Folder} url="/jobs" />
							<SidebarItem title={t("sidebar.sections.freelances")} icon={Calendar} url="/freelances" />
						</>
					)}

					{role === "company" && (
						<>
							<SidebarItem title="Feed" icon={List} url="/feed" />
							<SidebarItem title={t("sidebar.sections.dashboard")} icon={LayoutDashboard} url="/dashboard" />
							<SidebarItem title={t("sidebar.sections.my_jobs")} icon={Folder} url="/my-jobs" />
						</>
					)}

					{role === "client" && (
						<>
							<SidebarItem title="Feed" icon={List} url="/feed" />
							<SidebarItem title="Freelancers" icon={User} url="/freelancers" />
						</>
					)}

					{role === "admin" && (
						<>
							<SidebarItem title="Dashboard" icon={LayoutDashboard} url="/admin-land/dashboard" />
							<SidebarItem title={t("sidebar.sections.devs")} icon={User} url="/admin-land/devs" />
							<SidebarItem title={t("sidebar.sections.companies")} icon={Building} url="/admin-land/company" />
							<SidebarItem title={t("sidebar.sections.clients")} icon={User} url="/admin-land/clients" />
							<SidebarItem title={t("sidebar.sections.admins")} icon={Folder} url="/admin-land/admins" />
							<SidebarItem title={t("sidebar.sections.questions")} icon={MessageCircle} url="/admin-land/questions" />
						</>
					)}
				</div>

				{/* OPTIONS */}
				<div className="w-full">
					<p className="text-xs text-muted-foreground mb-2">Options</p>

					{role === "company" ? (
						<SidebarItem title={t("sidebar.options.profile")} icon={Building} url="/profile" />
					) : (
						<SidebarItem title={t("sidebar.options.profile")} icon={User} url="/profile" />
					)}
					<SidebarItem title={t("sidebar.options.settings")} icon={Cog} url="/settings" />

					<LogoutButton text={logoutDialogText}>
						<div className="w-full flex gap-2 items-center p-0.5 rounded-md px-2 mb-1 cursor-pointer hover:bg-muted">
							<LogOut className="size-4" />
							{t("general.logout")}
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
							<DropdownMenuItem
								variant="destructive"
								onSelect={(event) => {
									event.preventDefault();
									setLogoutDialogOpen(true);
								}}
							>
								<LogOut /> {t("general.logout")}
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<LogoutButton
					text={logoutDialogText}
					open={logoutDialogOpen}
					onOpenChange={setLogoutDialogOpen}
				/>
			</div>
		</div>
	);
}
