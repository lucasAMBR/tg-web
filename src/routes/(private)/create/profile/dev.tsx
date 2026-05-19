import { Logo } from "@/components/global/Logo";
import LogoutButton from "@/components/global/logout-button";
import ThemeToggle from "@/components/global/theme-toggle-button";
import DevProfileForm from "@/components/profile-create/dev-profile-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { env } from "@/utils/env";
import {
	ensureAuthenticated,
	ensureRoutePermissions,
} from "@/utils/route-guards";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

const staticData = {
	requiredPermissions: ["dev_profile.create"],
};

export const Route = createFileRoute("/(private)/create/profile/dev")({
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		ensureRoutePermissions(staticData);
	},
});

function RouteComponent() {
	const { theme } = useTheme();

	const { t } = useTranslation();

	return (
		<div className="w-screen h-screen flex">
			<div className="flex-1 bg-[url('/images/create_dev_profile_banner.jpg')] bg-cover bg-center brightness-50">
				<div className="w-full h-full"></div>
			</div>
			<div className="flex-1 relative m-4 flex flex-col items-center justify-center">
				<LogoutButton text="You will be leaving without finishing your profile creation, you will not be able to be reached by our algorithm!">
					<Button variant={"ghost"} className="absolute top-0 left-0">
						<LogOut /> Logout
					</Button>
				</LogoutButton>
				<div className="flex flex-col justify-center items-center mb-6">
					<Logo className="w-12 fill-primary" />
					<p className="font-[Agbalumo] text-primary text-5xl">
						{env.APP_NAME}
					</p>
				</div>
				<h2 className="font-[Anta] text-primary text-3xl mb-6">
					{t("profile_create.dev.title")}
				</h2>
				<p className="max-w-[700px] text-center mb-6">
					{t("profile_create.dev.description")}
				</p>
				<DevProfileForm />
			</div>
			<ThemeToggle />
		</div>
	);
}
