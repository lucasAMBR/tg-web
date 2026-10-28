import { Circle, SquareCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ScreeningQuestionnaireResource } from "@/api/generated/models";
import { ScreeningQuestionTypeEnum } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import {
	getOptionText,
	getOrderedOptions,
	getOrderedQuestions,
	getQuestionnaireDescription,
	getQuestionnaireTitle,
	getQuestionText,
} from "@/types/screening-questionnaire";

interface QuestionnaireViewProps {
	questionnaire: ScreeningQuestionnaireResource;
}

/** Leitura do formulário montado pela empresa, sem nenhum campo editável. */
export default function QuestionnaireView({
	questionnaire,
}: QuestionnaireViewProps) {
	const { t, i18n } = useTranslation();

	const questions = getOrderedQuestions(questionnaire);

	const description = getQuestionnaireDescription(questionnaire, i18n.language);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h3 className="text-lg font-bold">
					{getQuestionnaireTitle(questionnaire, i18n.language)}
				</h3>
				{description && (
					<p className="text-sm text-muted-foreground whitespace-pre-line">
						{description}
					</p>
				)}
			</div>
			<div className="flex flex-col gap-3">
				{questions.map((question, index) => (
					<div
						key={question.id}
						className="flex flex-col gap-2 rounded-md border p-4"
					>
						<div className="flex flex-row flex-wrap items-center gap-2">
							<Badge variant={"secondary"}>{index + 1}</Badge>
							<Badge variant={"outline"}>
								{t(`enum.screening_question_type.${question.type}`)}
							</Badge>
							{question.is_required && (
								<Badge className="bg-accent text-accent-foreground">
									{t("screening_questionnaire.required")}
								</Badge>
							)}
						</div>
						<p className="font-medium whitespace-pre-line">
							{getQuestionText(question, i18n.language)}
						</p>
						{question.type === ScreeningQuestionTypeEnum.essay ? (
							<p className="text-sm text-muted-foreground">
								{t("screening_questionnaire.essay_hint")}
							</p>
						) : (
							<ul className="flex flex-col gap-1">
								{getOrderedOptions(question).map((option) => (
									<li
										key={option.id}
										className="flex flex-row items-center gap-2 text-sm text-muted-foreground"
									>
										{question.type ===
										ScreeningQuestionTypeEnum.multiple_choice ? (
											<SquareCheck className="size-4 shrink-0" />
										) : (
											<Circle className="size-4 shrink-0" />
										)}
										{getOptionText(option, i18n.language)}
									</li>
								))}
							</ul>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
