import { useIndexProficencyTest } from "@/api/generated/proficiency-test/proficiency-test";
import { useProficiencyTestParams } from "@/hooks/filters/use-proficiency-test-params";
import ProficiencyTestCard from "./proficiency-test-card";

interface ProficiencyTestListProps {
    profileId: string
}

export default function ProficiencyTestList({ profileId }: ProficiencyTestListProps) {

    const {
        page,
        perPage,
        search,
        setFilterParams
    } = useProficiencyTestParams();

    const { 
        data,
        isLoading 
    } = useIndexProficencyTest({
        page: page,
        per_page: perPage,
        search: search,
        dev_profile_id: profileId
    })

    const proficiencyTestList = data?.data.data ?? [];

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
                {proficiencyTestList.map((test) => (
                    <ProficiencyTestCard test={test} />
                ))}
            </div>
        </div>
    );
}