import { ThemePaletteSync } from "@/components/global/theme-palette-sync";
import { TitleI18nSync } from "@/components/global/title-i18n-sync";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME } from "@/utils/page-title";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

const queryClient = new QueryClient();

const RootLayout = () => {
	return (
		<div className="bg-background w-full h-screen overflow-y-hidden flex flex-col">
			<HeadContent />
			<TitleI18nSync />
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				storageKey="theme"
			>
				<ThemePaletteSync />
				<NuqsAdapter>
					<QueryClientProvider client={queryClient}>
						<TooltipProvider>
							<Outlet />
						</TooltipProvider>
						<Toaster position="top-center" />
					</QueryClientProvider>
				</NuqsAdapter>
			</ThemeProvider>
		</div>
	);
};

export const Route = createRootRoute({
	head: () => ({ meta: [{ title: APP_NAME }] }),
	component: RootLayout,
});
