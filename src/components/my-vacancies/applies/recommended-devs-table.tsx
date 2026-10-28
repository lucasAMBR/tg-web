import { useRecommendDevsForJobVacancy } from "@/api/generated/recommendation/recommendation";
import { DataTable } from "@/components/global/data-table";
import { recommendedColumns } from "./recommended-columns";

const RECOMMENDATION_LIMIT = 10;

interface RecommendedDevsTableProps {
	jobVacancyId: string;
}

export function RecommendedDevsTable({
	jobVacancyId,
}: RecommendedDevsTableProps) {
	const { data: recommendations } = useRecommendDevsForJobVacancy(
		jobVacancyId,
		{ limit: RECOMMENDATION_LIMIT },
	);

	const recommendedDevs = recommendations?.data || [];

	return <DataTable columns={recommendedColumns} data={recommendedDevs} />;
}
