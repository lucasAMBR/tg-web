import {
	useListTestQuestions,
	useSubmitProficiencyTest,
} from "@/api/generated/proficiency-test/proficiency-test";
import type { QuestionResource } from "@/api/generated/models";
import { SubmitProficiencyTestSchema } from "@/schemas/proficiency-test/SubmitProficiencyTestSchema";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { ApiError } from "@/utils/api-error";
import type { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Field, FieldContent, FieldLabel, FieldTitle } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CodeBlock, CodeBlockCopyButton } from "../ai/code-block";
import type { BundledLanguage } from "shiki";

interface TestPageProps {
	testId: string;
}

export default function TestPage({ testId }: TestPageProps) {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();

	const { data: questions, isLoading, isError } = useListTestQuestions(testId);

	const [pageIndex, setPageIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	const { mutate: submitTest, isPending: isSubmitting } =
		useSubmitProficiencyTest();

	// Métricas por página (tempo em segundos e perdas de foco), fora do state
	// porque não afetam a renderização.
	const pageStatsRef = useRef<
		Record<number, { timeTaken: number; altTabs: number }>
	>({});
	const pageIndexRef = useRef(pageIndex);
	const pageStartRef = useRef(Date.now());

	const getPageStats = (index: number) => {
		pageStatsRef.current[index] ??= { timeTaken: 0, altTabs: 0 };
		return pageStatsRef.current[index];
	};

	useEffect(() => {
		const handleBlur = () => {
			getPageStats(pageIndexRef.current).altTabs += 1;
		};

		window.addEventListener("blur", handleBlur);
		return () => window.removeEventListener("blur", handleBlur);
	}, []);

	const commitPageTime = () => {
		getPageStats(pageIndexRef.current).timeTaken += Math.round(
			(Date.now() - pageStartRef.current) / 1000,
		);
		pageStartRef.current = Date.now();
	};

	const goToPage = (index: number) => {
		commitPageTime();
		pageIndexRef.current = index;
		setPageIndex(index);
	};

	if (isLoading) {
		return <p>{t("general.search")}...</p>;
	}

	if (isError || !questions) {
		return <p>{t("dev_profile.proficiency_test.start.error")}</p>;
	}

	const pages = questions.data;

	if (pages.length === 0) {
		return <p>{t("dev_profile.proficiency_test.no_questions")}</p>;
	}

	const isFirstPage = pageIndex === 0;
	const isLastPage = pageIndex === pages.length - 1;

	const questionNumberOffset = pages
		.slice(0, pageIndex)
		.reduce((total, page) => total + page.length, 0);

	const questionText = (question: QuestionResource) => {
		if (question.translation_status !== "translated") return question.question;

		return (
			(i18n.language === "pt" ? question.question_pt : question.question_en) ??
			question.question
		);
	};

	const responseText = (
		response: QuestionResource["responses"][number],
	) => {
		if (response.translation_status !== "translated") return response.response;

		return (
			(i18n.language === "pt" ? response.response_pt : response.response_en) ??
			response.response
		);
	};

	const handleFinish = () => {
		commitPageTime();

		const chunks = pages.map((page, index) => {
			const stats = getPageStats(index);

			return {
				time_taken: stats.timeTaken,
				alt_tabs: stats.altTabs,
				responses: page.map((question) => ({
					question_id: question.id,
					response_id: answers[question.id] ?? "",
				})),
			};
		});

		const parsed = SubmitProficiencyTestSchema.safeParse({ chunks });

		if (!parsed.success) {
			CustomToaster.errorToast(
				t("dev_profile.proficiency_test.all_questions_required"),
			);
			return;
		}

		submitTest(
			{ id: testId, data: parsed.data },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("dev_profile.proficiency_test.submit_success"),
					);
					navigate({ to: "/profile" });
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-8 w-full">
			<div className="flex flex-col gap-8">
				{pages[pageIndex].map((question, index) => (
					<div key={question.id} className="flex flex-col gap-4">
						<div className="flex gap-3 items-center">
							<span className="shrink-0 text-s flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary font-bold">
								{questionNumberOffset + index + 1}
							</span>
							<p className="text-lg pt-1">{questionText(question)}</p>
						</div>

						{question.code_snippet && (
							<CodeBlock
								language={question.code_snippet.language as BundledLanguage}
								code={question.code_snippet.code}
								showLineNumbers
								showHeader
                                filename="Pseudocode.tsx"
							>
								<CodeBlockCopyButton />
							</CodeBlock>
						)}

						<RadioGroup
							value={answers[question.id] ?? ""}
							onValueChange={(value) =>
								setAnswers((previous) => ({ ...previous, [question.id]: value }))
							}
							className="gap-2 w-full p-0"
						>
							{question.responses.map((response) => (
								<FieldLabel
									key={response.id}
									htmlFor={response.id}
									className="m-0 p-0"
								>
									<Field
										className="cursor-pointer hover:bg-primary/5"
										orientation={"horizontal"}
									>
										<FieldContent>
											<FieldTitle>{responseText(response)}</FieldTitle>
										</FieldContent>
										<RadioGroupItem value={response.id} id={response.id} />
									</Field>
								</FieldLabel>
							))}
						</RadioGroup>
					</div>
				))}
			</div>

			<div className="flex items-center justify-between gap-4">
				<Button
					type="button"
					variant={"outline"}
					onClick={() => goToPage(pageIndex - 1)}
					className={isFirstPage ? "invisible" : ""}
				>
					<ChevronLeft /> {t("dev_profile.proficiency_test.previous_page")}
				</Button>

				<p className="text-sm text-muted-foreground">
					{t("dev_profile.proficiency_test.page_indicator", {
						current: pageIndex + 1,
						total: pages.length,
					})}
				</p>

				{isLastPage ? (
					<Button type="button" onClick={handleFinish} disabled={isSubmitting}>
						<Check /> {t("dev_profile.proficiency_test.finish")}
					</Button>
				) : (
					<Button type="button" onClick={() => goToPage(pageIndex + 1)}>

						{t("dev_profile.proficiency_test.next_page")} <ChevronRight />
					</Button>
				)}
			</div>
		</div>
	);
}
