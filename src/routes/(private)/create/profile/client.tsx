import LogoutButton from "@/components/global/logout-button";
import ClientProfileForm from "@/components/profile-create/client-profile-form";
import ThemeToggle from "@/components/global/theme-toggle-button";
import { Button } from "@/components/ui/button";
import { env } from "@/utils/env";
import {
	ensureAuthenticated,
	ensureRoutePermissions,
} from "@/utils/route-guards";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useTheme } from "next-themes";

const staticData = {
	requiredPermissions: ["client_profile.create"],
};

export const Route = createFileRoute("/(private)/create/profile/client")({
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		ensureRoutePermissions(staticData);
	},
});

function RouteComponent() {

	const { theme } = useTheme();


	return (
		<div className="w-screen h-screen flex">
			<div className="flex-1 bg-[url('/images/create_company_profile_banner.jpg')] bg-cover bg-center brightness-50">
				<div className="w-full h-full"></div>
			</div>
			<div className="flex-1 relative m-4 flex flex-col items-center justify-center">
				<LogoutButton text="You will be leaving without finishing your profile creation, you will not be able to be reached by our algorithm!">
					<Button variant={"ghost"} className="absolute top-0 left-0">
						<LogOut /> Logout
					</Button>
				</LogoutButton>
				<div className="flex flex-col justify-center items-center mb-6">
					<img
						src={
							theme === "dark"
								? "/images/dark_mode_logo.png"
								: "/images/light_mode_logo.png"
						}
						className="w-12"
						alt="Logo"
					/>
					<p className="font-[Agbalumo] text-primary text-5xl">
						{env.APP_NAME}
					</p>
				</div>
				<h2 className="font-[Anta] text-primary text-3xl mb-6">
					Create your profile
				</h2>
				<p className="max-w-[700px] text-center mb-6">
					Fill in your basic information so our algorithm can understand your
					profile and match you with the most relevant opportunities.
				</p>
				<ClientProfileForm />
			</div>
			<ThemeToggle />
		</div>
	);
}
