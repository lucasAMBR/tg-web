import ThemeToggle from "@/components/global/theme-toggle-button";
import UnderConstruction from "@/components/global/under-construction";
import ClientProfileBody from "@/components/profile/variants/client-profile-body";
import CompanyProfileBody from "@/components/profile/variants/company-profile-body";
import DevProfileContent from "@/components/profile/variants/dev-profile-body";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import {
	getNameFromProfile,
	getProfileBio,
	getProfileScore,
	getRole,
	getRoleLabel,
} from "@/utils/role-helper";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";
import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/(private)/home/profile")({
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

function RouteComponent() {
	const { user } = useAuthStore();

	const { t } = useTranslation();

	if (getRole(user) === "dev") {
		return (
			<div className="flex-1 p-8 flex flex-col gap-4">
				<Card className="w-full flex flex-row px-12 py-8 gap-4 items-center">
					<Avatar className="size-32">
						<AvatarFallback className="bg-primary text-primary-foreground">
							<User className="size-22" />
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-2">
						<h2 className="text-4xl font-bold font-[Anta]">
							{getNameFromProfile(user)}
						</h2>
						<div className="flex gap-2">
							<Badge variant={"secondary"}>{t(getRoleLabel(user) as string)}</Badge>
							<Badge variant={"destructive"}>
								{"Score: " + getProfileScore(user)}
							</Badge>
						</div>
						<p>{getProfileBio(user)}</p>
					</div>
				</Card>	
				<DevProfileContent profileId={user?.dev_profile?.id as string}/>
				<ThemeToggle />
			</div>
		)
	}

	if (getRole(user) === "company") {
		return (
			<div className="flex-1 p-8 flex flex-col gap-4">
				<Card className="w-full flex flex-row px-12 py-8 gap-4 items-center">
					<Avatar className="size-32">
						<AvatarFallback className="bg-primary text-primary-foreground">
							<User className="size-22" />
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-2">
						<h2 className="text-4xl font-bold font-[Anta]">
							{getNameFromProfile(user)}
						</h2>
						<div className="flex gap-2">
							<Badge variant={"secondary"}>{t(getRoleLabel(user) as string)}</Badge>
							<Badge variant={"destructive"}>
								{"Score: " + getProfileScore(user)}
							</Badge>
						</div>
						<p>{getProfileBio(user)}</p>
					</div>
				</Card>
				<CompanyProfileBody profileId={user?.company_profile?.id as string}/>
			</div>
		)
	}

	if (getRole(user) === "client") {
		return (
			<div className="flex-1 p-8 flex flex-col gap-4">
				<Card className="w-full flex flex-row px-12 py-8 gap-4 items-center">
					<Avatar className="size-32">
						<AvatarFallback className="bg-primary text-primary-foreground">
							<User className="size-22" />
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-2">
						<h2 className="text-4xl font-bold font-[Anta]">
							{getNameFromProfile(user)}
						</h2>
						<div className="flex gap-2">
							<Badge variant={"secondary"}>{t(getRoleLabel(user) as string)}</Badge>
							<Badge variant={"destructive"}>
								{"Score: " + getProfileScore(user)}
							</Badge>
						</div>
						<p>{getProfileBio(user)}</p>
					</div>
				</Card>
				<ClientProfileBody profileId={user?.client_profile?.id as string}/>
			</div>
		)
	}
}
