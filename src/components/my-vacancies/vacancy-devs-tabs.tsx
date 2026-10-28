import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VacancyAppliesTable } from "./applies/applies-table";
import { RecommendedDevsTable } from "./applies/recommended-devs-table";

interface VacancyDevsTabsProps {
	jobVacancyId: string;
}

export default function VacancyDevsTabs({
	jobVacancyId,
}: VacancyDevsTabsProps) {
	const { t } = useTranslation();

	const [tab, setTab] = useState<string>("applies");

	return (
		<Tabs defaultValue={tab} onValueChange={setTab}>
			<TabsList variant={"line"}>
				<TabsTrigger className="cursor-pointer" value="applies">
					{t("my_vacancies.applies.title")}
				</TabsTrigger>
				<TabsTrigger className="cursor-pointer" value="recommended">
					{t("my_vacancies.recommended.title")}
				</TabsTrigger>
			</TabsList>
			<TabsContent value="applies" className="mt-4">
				<VacancyAppliesTable jobVacancyId={jobVacancyId} />
			</TabsContent>
			<TabsContent value="recommended" className="mt-4">
				<RecommendedDevsTable jobVacancyId={jobVacancyId} />
			</TabsContent>
		</Tabs>
	);
}
