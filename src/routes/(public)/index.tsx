import ThemeToggle, {  } from '@/components/global/theme-toggle-button';
import Banner from '@/components/landing-page/banner';
import Navbar from '@/components/landing-page/navbar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/')({
	component: LandingPage
});

function LandingPage() {

	return (
		<div className='w-screen h-screen flex flex-col'>
			<Navbar />
			<Banner />
		</div>
	);
}