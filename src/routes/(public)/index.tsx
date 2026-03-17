import ThemeToggle, {  } from '@/components/global/theme-toggle-button';
import Navbar from '@/components/landing-page/navbar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/')({
	component: LandingPage
});

function LandingPage() {

	return (
		<>
			<Navbar />
			<ThemeToggle />
		</>
	);
}