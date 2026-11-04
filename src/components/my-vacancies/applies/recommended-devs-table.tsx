import { useMemo } from "react";
import { useRecommendDevsForJobVacancy } from "@/api/generated/recommendation/recommendation";
import { DataTable } from "@/components/global/data-table";
import { getRecommendedColumns } from "./recommended-columns";

const RECOMMENDATION_LIMIT = 10;

interface RecommendedDevsTableProps {
	jobVacancyId: string;
	/** A vaga ainda recebe candidaturas, então dá para convidar os devs. */
	canInvite: boolean;
}

export function RecommendedDevsTable({
	jobVacancyId,
	canInvite,
}: RecommendedDevsTableProps) {
	const { data: recommendations } = useRecommendDevsForJobVacancy(
		jobVacancyId,
		{ limit: RECOMMENDATION_LIMIT },
	);

	const columns = useMemo(
		() => getRecommendedColumns({ jobVacancyId, canInvite }),
		[jobVacancyId, canInvite],
	);

	const recommendedDevs = recommendations?.data || [];

	return <DataTable columns={columns} data={recommendedDevs} />;
}
