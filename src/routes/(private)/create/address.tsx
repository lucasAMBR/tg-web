import { createFileRoute } from "@tanstack/react-router";

import LogoutButton from "@/components/global/logout-button";
import ThemeToggle from "@/components/global/theme-toggle-button";
import DevProfileForm from "@/components/profile-create/dev-profile-form";
import { Button } from "@/components/ui/button";
import { env } from "@/utils/env";
import {
	ensureAuthenticated,
	ensureRoutePermissions,
} from "@/utils/route-guards";
import { LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import AddressForm from "@/components/address/address-form";
import { useAuthStore } from "@/stores/auth-store";
import { getUserMainRole } from "@/utils/role-helper";

const staticData = {
	requiredPermissions: ["address.create"],
};

export const Route = createFileRoute("/(private)/create/address")({
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		ensureRoutePermissions(staticData);
	},
});

function RouteComponent() {
	const { theme } = useTheme();

	const { user } = useAuthStore();

	const userRole = getUserMainRole(user);

	return (
		<div className="w-screen h-screen flex">
			{userRole === "dev" && (
				<div className="flex-1 bg-[url('/images/create_dev_profile_banner.jpg')] bg-cover bg-center brightness-50">
					<div className="w-full h-full"></div>
				</div>
			)}
			{userRole === "company" && (
				<div className="flex-1 bg-[url('/images/create_company_profile_banner.jpg')] bg-cover bg-center brightness-50">
					<div className="w-full h-full"></div>
				</div>
			)}
			{userRole === "client" && (
				<div className="flex-1 bg-[url('/images/create_company_profile_banner.jpg')] bg-cover bg-center brightness-50">
					<div className="w-full h-full"></div>
				</div>
			)}
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
					Register your address
				</h2>
				<p className="max-w-[700px] text-center mb-6">
					Provide your address details so we can better tailor location-based
					opportunities and ensure accurate matching.
				</p>
				<AddressForm />
			</div>
			<ThemeToggle />
		</div>
	);
}
