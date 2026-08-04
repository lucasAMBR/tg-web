import { useTestReview } from "@/api/generated/proficiency-test/proficiency-test";
import type {
    ProficencyTestModel,
    QuestionModel,
    QuestionResponseModel,
} from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { CodeBlock, CodeBlockCopyButton } from "@/components/ai/code-block";
import type { BundledLanguage } from "shiki";

interface ProficiencyTestViewProps {
    test: ProficencyTestModel | null;
    clearSelected: () => void;
}

export default function ProficiencyTestView({ test, clearSelected }: ProficiencyTestViewProps) {
    const { t, i18n } = useTranslation();

    const {
        data: review,
        isLoading,
        isError,
    } = useTestReview(test?.id ?? "", {
        query: { enabled: !!test },
    });

    if (!test) {
        return null;
    }

    const questionText = (question: QuestionModel) => {
        if (question.translation_status !== "translated") return question.question;

        return (
            (i18n.language === "pt" ? question.question_pt : question.question_en) ??
            question.question
        );
    };

    const responseText = (response: QuestionResponseModel) => {
        if (response.translation_status !== "translated") return response.response;

        return (
            (i18n.language === "pt" ? response.response_pt : response.response_en) ??
            response.response
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <Card className="p-4 flex">
                <Button variant={"outline"} size={"sm"} className="max-w-20" onClick={clearSelected}>
                    <ChevronLeft />
                    <p>{t("general.back")}</p>
                </Button>
            </Card>

            {isLoading && <p>{t("general.search")}...</p>}

            {isError && <p>{t("dev_profile.proficiency_test.start.error")}</p>}

            {review && review.data.length === 0 && (
                <p>{t("dev_profile.proficiency_test.no_questions")}</p>
            )}

            {review?.data.map((item, index) => {
                const devResponse = item.dev_response;
                const correctResponse = item.correct_response;
                const isDevResponseCorrect = item.is_dev_response_correct;
                // Só mostra a resposta correta quando o dev errou.
                const showCorrectResponse = !!correctResponse && !isDevResponseCorrect;

                return (
                    <Card key={item.question.id} className="flex flex-col gap-4 bg-card p-4">
                        <div className="flex gap-3 items-center">
                            <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary font-bold">
                                {index + 1}
                            </span>
                            <p className="text-lg">{questionText(item.question)}</p>
                        </div>

                        {item.question.code_snippet && (
                            <CodeBlock
                                language={item.question.code_snippet.language as BundledLanguage}
                                code={item.question.code_snippet.code}
                                showLineNumbers
                                showHeader
                                filename="Pseudocode.tsx"
                            >
                                <CodeBlockCopyButton />
                            </CodeBlock>
                        )}

                        <div className="flex flex-col gap-2">
                            {devResponse && (
                                <div className="flex flex-col gap-1">
                                    <div
                                        className={cn(
                                            "flex items-center justify-between gap-3 rounded-md border p-3",
                                            isDevResponseCorrect
                                                ? "border-green-500 bg-green-500/10"
                                                : "border-red-500 bg-red-500/10",
                                        )}
                                    >
                                        <p>{responseText(devResponse)}</p>
                                        {isDevResponseCorrect ? (
                                            <Check className="shrink-0 text-green-500" />
                                        ) : (
                                            <X className="shrink-0 text-red-600" />
                                        )}
                                    </div>
                                </div>
                            )}
                            {showCorrectResponse && (
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-muted-foreground">
                                        {t("dev_profile.proficiency_test.review.correct_response")}
                                    </p>
                                    <div className="rounded-md border p-3">
                                        <p>{responseText(correctResponse)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
