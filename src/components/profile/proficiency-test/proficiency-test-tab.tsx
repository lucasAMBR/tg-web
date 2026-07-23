import { useAuthStore } from "@/stores/auth-store";
import ProficiencyTestSolicitationCard from "./proficiency-test-solicitation-card";
import ProficiencyTestList from "./proficency-test-list";

interface ProficiencyTestTabProps {
    profileId: string
}
export default function ProficiencyTestTab({ profileId }: ProficiencyTestTabProps) {

    const { user } = useAuthStore();

    return (
        <div className="flex flex-col gap-3">
            {user?.dev_profile?.id === profileId && (
                <ProficiencyTestSolicitationCard profileId={profileId} />
            )}
            <ProficiencyTestList profileId={profileId} />
        </div>
    );
}
