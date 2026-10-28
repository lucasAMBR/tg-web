import { useIndexProficiencyTest } from "@/api/generated/proficiency-test/proficiency-test";
import { useProficiencyTestParams } from "@/hooks/filters/use-proficiency-test-params";
import ProficiencyTestCard from "./proficiency-test-card";
import { useState } from "react";
import type { ProficiencyTestResource } from "@/api/generated/models";
import ProficiencyTestView from "./proficiency-test-view";

interface ProficiencyTestListProps {
    profileId: string
}

export default function ProficiencyTestList({ profileId }: ProficiencyTestListProps) {

    const {
        page,
        perPage,
        search,
    } = useProficiencyTestParams();

    const { 
        data,
    } = useIndexProficiencyTest({
        page: page,
        per_page: perPage,
        search: search,
        dev_profile_id: profileId
    })

    const proficiencyTestList = data?.data.data ?? [];

    const [ selectedTest, setSelectedTest ] = useState<ProficiencyTestResource | null>(null)

    const clearSelection = () => {
        setSelectedTest(null)
    }

    return (
        <div className="flex flex-col gap-3">
            {selectedTest ? (
                <ProficiencyTestView 
                    test={selectedTest} 
                    clearSelected={clearSelection}
                />
            ) : (
                <div className="flex flex-col gap-3">
                    {proficiencyTestList.map((test) => (
                        <ProficiencyTestCard test={test} selectTest={setSelectedTest}/>
                    ))}
                </div>
            )}
        </div>
    );
}