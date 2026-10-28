import { useIndexApplies } from "@/api/generated/dev-job-vacancy/dev-job-vacancy";
import type { IndexAppliesParams } from "@/api/generated/models";
import { DataTable } from "@/components/global/data-table";
import DefaultPagination, {
	type GenericPagination,
} from "@/components/global/pagination";
import { Card } from "@/components/ui/card";
import { useIndexAppliesParams } from "@/hooks/filters/use-index-applies-params";
import { columns } from "./columns";

interface VacancyAppliesTableProps {
	jobVacancyId: string;
}

export function VacancyAppliesTable({
	jobVacancyId,
}: VacancyAppliesTableProps) {
	const { page, perPage, setFilterParams } = useIndexAppliesParams();

	// O contrato gerado ainda não declara o filtro por vaga, mas a API aceita `job_vacancy_id`
	const params: IndexAppliesParams & { job_vacancy_id: string } = {
		page: page,
		per_page: perPage,
		job_vacancy_id: jobVacancyId,
	};

	const { data: applies } = useIndexApplies(params);

	const applyList = applies?.data.data || [];

	return (
		<>
			<DataTable columns={columns} data={applyList} />

			<Card className="p-4 bg-accent mt-2">
				<DefaultPagination
					data={applies?.data.pagination as GenericPagination}
					setPage={(p) => setFilterParams({ page: p })}
					setPerPage={(pp) => setFilterParams({ perPage: pp })}
				/>
			</Card>
		</>
	);
}
