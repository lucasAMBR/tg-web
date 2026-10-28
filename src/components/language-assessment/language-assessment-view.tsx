import {
	CalendarClock,
	Circle,
	CircleCheck,
	Languages,
	Square,
	Trophy,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LanguageAssessmentResource } from "@/api/generated/models";
import { LanguageAssessmentQuestionTypeEnum } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	getExpectedAnswers,
	getMaxScore,
	getOrderedOptions,
	getOrderedQuestions,
	getPassingScore,
	getQuestionType,
	getQuestionWeight,
	optionIsCorrect,
	questionAcceptsOptions,
} from "@/types/language-assessment";
import { apiDateOnly, formatIsoDateOnlyBr } from "@/utils/date-only";

interface LanguageAssessmentViewProps {
	assessment: LanguageAssessmentResource;
}

/** Leitura da prova montada pela empresa, com o gabarito destacado. */
export default function LanguageAssessmentView({
	assessment,
}: LanguageAssessmentViewProps) {
	const { t } = useTranslation();

	const questions = getOrderedQuestions(assessment);

	const passingScore = getPassingScore(assessment);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h3 className="text-lg font-bold">{assessment.title}</h3>
				{assessment.description && (
					<p className="text-sm text-muted-foreground whitespace-pre-line">
						{assessment.description}
					</p>
				)}
			</div>
			<div className="flex flex-row flex-wrap gap-2">
				<Badge variant={"outline"}>
					<Languages />
					{t("language_assessment.language")}: {assessment.language}
				</Badge>
				<Badge variant={"outline"}>
					<CalendarClock />
					{t("language_assessment.due_date")}:{" "}
					{formatIsoDateOnlyBr(apiDateOnly(assessment.due_date)) || "—"}
				</Badge>
				<Badge variant={"outline"}>
					<Trophy />
					{t("language_assessment.max_score")}: {getMaxScore(assessment)}
				</Badge>
				{passingScore !== undefined && (
					<Badge className="bg-accent text-accent-foreground">
						{t("language_assessment.passing_score")}: {passingScore}
					</Badge>
				)}
			</div>
			{passingScore === undefined && (
				<p className="text-sm text-muted-foreground">
					{t("language_assessment.no_passing_score")}
				</p>
			)}
			<div className="flex flex-col gap-3">
				{questions.map((question, index) => {
					const type = getQuestionType(question);

					return (
						<div
							key={question.id}
							className="flex flex-col gap-2 rounded-md border p-4"
						>
							<div className="flex flex-row flex-wrap items-center gap-2">
								<Badge variant={"secondary"}>{index + 1}</Badge>
								<Badge variant={"outline"}>
									{t(`enum.language_assessment_question.type.${type}`)}
								</Badge>
								<Badge className="bg-accent text-accent-foreground">
									{t("language_assessment.points", {
										count: getQuestionWeight(question),
									})}
								</Badge>
							</div>
							<p className="font-medium whitespace-pre-line">
								{question.question}
							</p>
							{questionAcceptsOptions(type) ? (
								<ul className="flex flex-col gap-1">
									{getOrderedOptions(question).map((option) => {
										const isCorrect = optionIsCorrect(option);

										return (
											<li
												key={option.id}
												className={cn(
													"flex flex-row items-center gap-2 text-sm",
													isCorrect
														? "font-medium text-emerald-600 dark:text-emerald-400"
														: "text-muted-foreground",
												)}
											>
												{isCorrect ? (
													<CircleCheck className="size-4 shrink-0" />
												) : type ===
													LanguageAssessmentQuestionTypeEnum.multiple_choice ? (
													<Square className="size-4 shrink-0" />
												) : (
													<Circle className="size-4 shrink-0" />
												)}
												{option.option}
												{isCorrect && (
													<span className="sr-only">
														{t("language_assessment.correct_option")}
													</span>
												)}
											</li>
										);
									})}
								</ul>
							) : (
								<div className="flex flex-col gap-1">
									<p className="text-sm text-muted-foreground">
										{t("language_assessment.expected_answers")}
									</p>
									<div className="flex flex-row flex-wrap gap-2">
										{getExpectedAnswers(question).map((expected) => (
											<Badge
												key={expected}
												className="bg-emerald-500 text-white"
											>
												{expected}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
