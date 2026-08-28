import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import MyAppliesList from "@/components/jobs/my-applies-list";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/jobs/")({
	head: () => ({ meta: [{ title: pageTitle("my_applies") }] }),
	staticData: { breadcrumb: { labelKey: "page_title.my_applies" } },
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

function RouteComponent() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-1 flex-col p-8">
			<div className="flex flex-col gap-1 mb-5">
				<h2 className="text-3xl font-bold">{t("my_applies.title")}</h2>
				<p className="text-sm text-muted-foreground">
					{t("my_applies.description")}
				</p>
			</div>

			<MyAppliesList />
		</div>
	);
}
