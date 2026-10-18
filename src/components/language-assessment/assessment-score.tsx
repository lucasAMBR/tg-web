import { CircleCheck, CircleX } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DevLanguageAssessmentResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import {
	getAssessmentScore,
	getAssessmentVerdict,
} from "@/types/language-assessment";

interface AssessmentScoreProps {
	devAssessment: DevLanguageAssessmentResource;
}

/**
 * Placar da prova entregue e o veredito contra a nota de corte. É o que a
 * empresa usa para decidir quem avança, então fica legível sem abrir nada.
 */
export default function AssessmentScore({
	devAssessment,
}: AssessmentScoreProps) {
	const { t } = useTranslation();

	const { score, maxScore } = getAssessmentScore(devAssessment);

	// `null` quando a empresa não definiu nota de corte: a prova só pontua
	const verdict = getAssessmentVerdict(devAssessment);

	return (
		<div className="flex flex-row flex-wrap items-center gap-2">
			<span className="text-sm font-semibold">
				{t("my_vacancies.selection_process.language_assessment.score")}:{" "}
				{score ?? "—"} / {maxScore ?? "—"}
			</span>
			{verdict === null ? (
				<Badge variant={"outline"}>
					{t("my_vacancies.selection_process.language_assessment.no_verdict")}
				</Badge>
			) : verdict ? (
				<Badge className="bg-emerald-500 text-white">
					<CircleCheck />
					{t("my_vacancies.selection_process.language_assessment.passed")}
				</Badge>
			) : (
				<Badge variant={"destructive"}>
					<CircleX />
					{t("my_vacancies.selection_process.language_assessment.failed")}
				</Badge>
			)}
		</div>
	);
}
