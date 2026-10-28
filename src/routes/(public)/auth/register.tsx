import { Logo } from "@/components/global/Logo";
import ThemeToggle from "@/components/global/theme-toggle-button";
import RegisterSteps from "@/components/register/register-steps";
import { Button } from "@/components/ui/button";
import { env } from "@/utils/env";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { pageTitle } from "@/utils/page-title";

export const Route = createFileRoute("/(public)/auth/register")({
	head: () => ({ meta: [{ title: pageTitle("register") }] }),
	component: Register,
});

function Register() {
	const { t } = useTranslation();

	const navigate = useNavigate();

	return (
		<div className="w-screen h-screen flex">
			<div className="flex-1 relative m-4 flex flex-col items-center justify-center">
				<Button
					variant={"ghost"}
					className="absolute rounded-full top-0 left-0"
					onClick={() => navigate({ to: "/" })}
				>
					<ChevronLeft /> {t("general.back")}
				</Button>
				<div className="flex flex-col justify-center items-center mb-6">
					<Logo
						className="w-12 fill-primary"
					/>
					<p className="font-[Agbalumo] text-primary text-4xl">
						{env.APP_NAME}
					</p>
				</div>
				<RegisterSteps />
			</div>
			<div className="flex-2 bg-[url('/images/auth_banner_2.png')] bg-cover bg-center brightness-70">
				<div className="w-full h-full"></div>
			</div>
			<ThemeToggle />
		</div>
	);
}
