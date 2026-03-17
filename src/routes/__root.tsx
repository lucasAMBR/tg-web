import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

const RootLayout = () => {

	return (
		<div className="bg-primary-foreground w-screen h-screen flex flex-col">
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				storageKey="theme"
			>
				<Outlet />
			</ThemeProvider>
		</div>
	);
};

export const Route = createRootRoute({ component: RootLayout});