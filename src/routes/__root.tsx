import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

const RootLayout = () => {

	const queryClient = new QueryClient();

	return (
		<div className="bg-background w-screen h-screen flex flex-col">
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				storageKey="theme"
			>
				<QueryClientProvider
					client={queryClient}
				>
					<TooltipProvider>
						<Outlet />
					</TooltipProvider>
					<Toaster 
						position='top-center'
					/>
				</QueryClientProvider>
			</ThemeProvider>
		</div>
	);
};

export const Route = createRootRoute({ component: RootLayout});