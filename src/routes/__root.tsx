import { ThemePaletteSync } from "@/components/global/theme-palette-sync";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

const RootLayout = () => {
	const queryClient = new QueryClient();

	return (
		<div className="bg-background w-full h-screen overflow-y-hidden flex flex-col">
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

export const Route = createRootRoute({ component: RootLayout });
