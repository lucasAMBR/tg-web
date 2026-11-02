import ChatPanel from "@/components/chat/chat-panel";
import { ChatToggleButton } from "@/components/chat/chat-toggle-button";
import { LanguagePicker } from "@/components/global/language-change-button";
import { Notification } from "@/components/global/notification";
import Sidebar, { MobileSidebarTrigger } from "@/components/global/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { House } from "lucide-react";
import { Breadcrumbs } from "@/components/global/breadcrumbs";

export const Route = createFileRoute("/(private)/(home)")({
	staticData: {
		breadcrumb: { labelKey: "page_title.home", href: "/feed", icon: House },
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex w-full h-full">
			<Sidebar />
			<div className="flex-1 flex flex-col min-w-0">
				<div className="h-18 w-full p-4 px-4 md:px-8 border-b border-border flex justify-between gap-2 shrink-0">
					<div className="flex min-w-0 gap-2">
						<MobileSidebarTrigger />
						<Breadcrumbs className="min-w-0 md:shrink-0" />
					</div>
					<div className="flex gap-2">
						<LanguagePicker />
						<Notification />
						<ChatToggleButton />
					</div>
				</div>
				<div className="flex flex-col flex-1 min-h-0 overflow-auto [scrollbar-gutter:stable]">
					<Outlet />
				</div>
			</div>
			<ChatPanel />
		</div>
	);
}
