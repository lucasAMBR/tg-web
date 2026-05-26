import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import ListItem from "../ui/list-item";
import ThemeToggle from "../global/theme-toggle-button";
import { Logo } from "../global/Logo";
import { useTranslation } from "react-i18next";
import { LanguagePicker } from "../global/language-change-button";

function Navbar() {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const aboutProject = [
		{
			title: "navbar.about_the_project.about_the_code_title",
			description: "navbar.about_the_project.about_the_code_description",
			href: "...",
		},
		{
			title: "navbar.about_the_project.about_the_match_algorithm_title",
			description: "navbar.about_the_project.about_the_match_algorithm_description",
			href: "...",
		},
		{
			title: "navbar.about_the_project.about_us_title",
			description:
				"navbar.about_the_project.about_us_description",
			href: "...",
		},
	];

	return (
		<div className="flex bg-background justify-center items-center w-full z-150 border-b border-muted-foreground/20">
			<div className="grid grid-cols-[1fr_auto_1fr] items-center p-4 w-full md:max-w-5/6">

				{/* LEFT */}
				<div className="flex flex-row gap-1.5 items-end justify-self-start">
					<Logo className="w-9 fill-primary" />
					<p className="text-primary text-2xl font-bold font-['Agbalumo']">
						{import.meta.env.VITE_APP_NAME}
					</p>
				</div>

				{/* CENTER */}
				<nav className="justify-self-center">
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem className="bg-transparent">
								<NavigationMenuLink
									asChild
									className={navigationMenuTriggerStyle() + " text-[15px]"}
								>
									<Link to="/">{t("navbar.home")}</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem className="hidden bg-transparent md:flex">
								<NavigationMenuTrigger className="text-[15px]">
									{t("navbar.about_the_project.title")}
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
										{aboutProject.map((component) => (
											<ListItem
												key={component.title}
												title={component.title}
												description={component.description}
												href={component.href}
											/>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem className="hidden bg-transparent md:flex">
								<NavigationMenuTrigger className="text-[15px]">
									{t("navbar.jobs")}
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
										<ListItem
											key={"remote"}
											title={"Remote"}
											description={
												"work from anywhere, explore opportunities that offer full flexibility and no office requirements"
											}
											href={"/jobs/remote"}
										/>
										<ListItem
											key={"hybrid"}
											title={"Hybrid"}
											description={
												"the best of both worlds, find positions that balance remote focus with occasional in-person collaboration"
											}
											href={"/jobs/hybrid"}
										/>
										<ListItem
											key={"on-site"}
											title={"On-Site"}
											description={
												"full office experience, discover roles based at company headquarters for face-to-face daily interaction"
											}
											href={"/jobs/on-site"}
										/>
										<ListItem
											key={"freelance"}
											title="Freelance"
											description="flexible project-based work, find short or long-term contracts and build your portfolio with diverse projects"
											href="/jobs/freelance"
										/>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem className="bg-transparent">
								<NavigationMenuLink
									asChild
									className={navigationMenuTriggerStyle() + " text-[15px]"}
								>
									<Link to="/">{t("navbar.lgpd")}</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</nav>
				<div className="flex gap-2 justify-self-end">
					<Button
						onClick={() => navigate({ to: "/auth/login" })}
						variant={"outline"}
					>
						{t("navbar.button.sign_in")}
					</Button>
					<Button
						onClick={() => navigate({ to: "/auth/register" })}
						variant={"default"}
					>
						{t("navbar.button.sign_up")}
					</Button>
					<LanguagePicker />
					<ThemeToggle />
				</div>
			</div>
		</div>
	);
}

export default Navbar;
