import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '../ui/navigation-menu';
import { Link, useNavigate } from '@tanstack/react-router';
import ListItem from '../ui/list-item';
import ThemeToggle from '../global/theme-toggle-button';

function Navbar() {

	const { theme } = useTheme();

	const navigate = useNavigate();

	const aboutProject = [
		{
			title: "About the code",
			description: "learn about how brew was made, from choices to frameworks",
			href: "..."
		},
		{
			title: "About the match algorithm",
			description: "learn about we match your profile with the perfect job",
			href: "..."
		},
		{
			title: "About us",
			description: "here your can read about the journey of brew devs through the programming learning",
			href: "..."
		}
	]

	return (
		<div className='flex bg-background fixed top-0 left-0 justify-center items-center w-full z-150 border-b border-muted-foreground/20'>
			<div className='flex justify-between items-center p-4 w-full md:max-w-5/6'>
				<div className='flex flex-row gap-1.5 items-end'>
                    <img src={theme === 'dark' ? `/images/dark_mode_logo.png` : `/images/light_mode_logo.png`} className='w-9'/>
					<p className="text-primary text-2xl font-bold font-['Agbalumo']">{import.meta.env.VITE_APP_NAME}</p>
				</div>
				<nav>
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem className='bg-transparent'>
								<NavigationMenuLink asChild className={navigationMenuTriggerStyle() + " text-[15px]"}>
									<Link to='/'>Home</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem className="hidden bg-transparent md:flex">
								<NavigationMenuTrigger className='text-[15px]'>About the Project</NavigationMenuTrigger>
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
								<NavigationMenuTrigger className='text-[15px]'>Jobs</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
										<ListItem
											key={"remote"}
											title={"Remote"}
											description={"work from anywhere, explore opportunities that offer full flexibility and no office requirements"}
											href={"/jobs/remote"}
										/>
										<ListItem
											key={"hybrid"}
											title={"Hybrid"}
											description={"the best of both worlds, find positions that balance remote focus with occasional in-person collaboration"}
											href={"/jobs/hybrid"}
										/>
										<ListItem
											key={"on-site"}
											title={"On-Site"}
											description={"full office experience, discover roles based at company headquarters for face-to-face daily interaction"}
											href={"/jobs/on-site"}
										/>
										<ListItem
											key={"freelance"}
											title='Freelance'
											description='flexible project-based work, find short or long-term contracts and build your portfolio with diverse projects'
											href='/jobs/freelance'
										/>
										</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem className='bg-transparent'>
								<NavigationMenuLink asChild className={navigationMenuTriggerStyle() + " text-[15px]"}>
									<Link to='/'>LGPD</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</nav>
				<div className='flex gap-2'>
					<Button onClick={() => navigate({to: "/auth/login"})} variant={'outline'}>Login</Button>
					<Button onClick={() => navigate({to: "/auth/register"})} variant={'default'}>Register</Button>
					<ThemeToggle />
				</div>
			</div>
		</div>
	);
}

export default Navbar;