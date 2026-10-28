import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import MyFreelancesClient from "@/components/freelance/my-freelances-client";
import MyFreelancesDev from "@/components/freelance/my-freelances-dev";
import { useAuthStore } from "@/stores/auth-store";
import { FREELANCE_PARTY_ROLES } from "@/types/freelance";
import { pageTitle } from "@/utils/page-title";
import { getUserMainRole } from "@/utils/role-helper";
import {
	ensureAuthenticated,
	ensureProfileCreated,
	ensureRole,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/freelances/")({
	head: () => ({ meta: [{ title: pageTitle("freelances") }] }),
	staticData: { breadcrumb: { labelKey: "page_title.freelances" } },
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
		await ensureRole(FREELANCE_PARTY_ROLES);
	},
});

/** "Meus Freelances": o cliente vê os freelas que publicou; o dev, os dele. */
function RouteComponent() {
	const { t } = useTranslation();

	const role = getUserMainRole(useAuthStore((state) => state.user));

	return (
		<div className="flex flex-1 flex-col p-8">
			<div className="mb-5 flex flex-col gap-1">
				<h2 className="text-3xl font-bold">{t("freelance.my.title")}</h2>
				<p className="text-sm text-muted-foreground">
					{role === "client"
						? t("freelance.my.client_description")
						: t("freelance.my.dev_description")}
				</p>
			</div>

			{role === "client" ? <MyFreelancesClient /> : <MyFreelancesDev />}
		</div>
	);
}
