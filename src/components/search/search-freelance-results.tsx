import { Briefcase } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import FreelanceInfiniteList from "@/components/freelance/freelance-infinite-list";
import FreelanceVacancyCard from "@/components/freelance/freelance-vacancy-card";
import FreelanceVacancyFilters, {
	type FreelanceVacancyFilterValues,
} from "@/components/freelance/freelance-vacancy-filters";
import { useGlobalSearchParams } from "@/hooks/filters/use-global-search-params";
import { useFreelanceSearch } from "@/hooks/use-freelance-lists";
import type { FreelanceVacancy } from "@/types/freelance";
import { Badge } from "../ui/badge";

type FreelanceFilters = Omit<FreelanceVacancyFilterValues, "search">;

/**
 * Freelas abertos na pesquisa, com o termo do campo de busca da tela e os
 * filtros de tipo e senioridade. Um filtro novo muda a chave da consulta, que
 * recomeça da página 1. O card não mostra preço: o dev não recebe o budget.
 */
export default function SearchFreelanceResults() {
	const { t } = useTranslation();

	const { search } = useGlobalSearchParams();

	const [filters, setFilters] = useState<FreelanceFilters>({
		job_type: "",
		seniority_level: "",
	});

	const list = useFreelanceSearch({
		search,
		jobType: filters.job_type,
		seniorityLevel: filters.seniority_level,
	});

	return (
		<div className="w-full flex flex-col gap-2">
			<h3 className="text-lg font-medium flex flex-row items-center gap-2">
				{t("search.group.freelances")}
				{list.total !== undefined && (
					<Badge variant={"secondary"}>
						{t("freelance.count", { count: list.total })}
					</Badge>
				)}
			</h3>
			<FreelanceVacancyFilters
				values={{ search, ...filters }}
				onChange={({ search: _, ...values }) =>
					setFilters((previous) => ({ ...previous, ...values }))
				}
				showSearch={false}
			/>
			<FreelanceInfiniteList<FreelanceVacancy>
				items={list.vacancies}
				getKey={(vacancy) => vacancy.id}
				renderItem={(vacancy) => <FreelanceVacancyCard vacancy={vacancy} />}
				isLoading={list.isLoading}
				isError={list.isError}
				onRetry={() => list.refetch()}
				hasNextPage={list.hasNextPage}
				isFetchingNextPage={list.isFetchingNextPage}
				fetchNextPage={list.fetchNextPage}
				emptyIcon={Briefcase}
				emptyTitle={t("search.empty.freelances_title")}
				emptyDescription={t("search.empty.freelances_description")}
			/>
		</div>
	);
}
