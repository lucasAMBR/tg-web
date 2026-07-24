import type { ProficencyTestModel } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Hand, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProficiencyTestCardProps {
    test: ProficencyTestModel;
    selectTest: (test: ProficencyTestModel) => void; 
}

export default function ProficiencyTestCard({ test, selectTest }: ProficiencyTestCardProps) {

    const { user } = useAuthStore();

    const { t } = useTranslation();

    const navigate = useNavigate();

    return (
        <Card className="p-4">
            <div className="flex w-full justify-between">
                <h2 className="font-bold text-xl">{t(`enum.seniority_level.${test.seniority_level}`)} <span className="text-sm font-light">{t("dev_profile.proficiency_test.score")}{`${test.score} / ${test.max_score}`}</span></h2>
                <Badge>{t(`enum.proficiency_test_status.${test.status}`)}</Badge> 
            </div>
            {(test.status == "generated" && test.dev_profile_id === user?.dev_profile?.id) && <Button variant={"default"} onClick={() => navigate({ to: `/proficiency-test/${test.id}/start` })}><Play /> {t("dev_profile.proficiency_test.start_test")}</Button>}
            {(test.status == "generated" && test.dev_profile_id !== user?.dev_profile?.id) && <Button variant={"outline"} disabled><Hand /> {t("dev_profile.proficiency_test.await_responses")}</Button>}
            {test.status == "completed" && <Button variant={"outline"} onClick={() => selectTest(test)}><Eye /> {t("dev_profile.proficiency_test.view_results")}</Button>}
        </Card>
    );
}