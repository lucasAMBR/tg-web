import ThemeToggle, {} from "@/components/global/theme-toggle-button";
import Banner from "@/components/landing-page/banner";
import Navbar from "@/components/landing-page/navbar";
import LogoLoop from "@/components/LogoLoop";
import { createFileRoute } from "@tanstack/react-router";
import { SiTypescript, SiReact, SiVite, SiTailwindcss, SiZod, SiReacthookform, SiPhp, SiLaravel, SiPostgresql } from 'react-icons/si'

export const Route = createFileRoute("/(public)/")({
	component: LandingPage,
});

const techLogos = [
	{ node: <SiTypescript className="text-primary"/>, title: "TypeScript", href: "https://www.typescriptlang.org" },
	{ node: <SiVite className="text-primary"/>, title: "Vite", href: "https://vite.dev" },
	{ node: <SiReact className="text-primary"/>, title: "React", href: "https://react.dev" },
	{ node: <SiTailwindcss className="text-primary"/>, title: "Tailwind CSS", href: "https://tailwindcss.com" },
	{ node: <SiZod className="text-primary"/>, title: "Zod", href: "https://zod.dev" },
	{ node: <SiReacthookform className="text-primary"/>, title: "React Hook Form", href: "https://react-hook-form.com" },
	{ node: <SiPhp className="text-primary"/>, title: "PHP", href: "https://www.php.net" },
	{ node: <SiLaravel className="text-primary"/>, title: "Laravel", href: "https://laravel.com" },
	{ node: <SiPostgresql className="text-primary"/>, title: "PostgreSQL", href: "https://www.postgresql.org" },
  ];

function LandingPage() {
	return (
		<div className="w-screen h-screen flex flex-col overflow-auto">
			<div className="w-full min-h-screen flex flex-col">
				<Navbar />
				<Banner />
			</div>
			<div className="w-full h-16 my-8">
			<LogoLoop
				logos={techLogos} 
				speed={100}
				direction="left"
				logoHeight={60}
				gap={60}
				hoverSpeed={0}
				scaleOnHover
				fadeOut
				ariaLabel="Used technologies"
			/>
			</div>
		</div>
	);
}
