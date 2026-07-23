import { useAuthStore } from "@/stores/auth-store";
import CompanyProjectList from "./company-project-list";
import CreateCompanyProjectCard from "./create-company-project-card";

interface CompanyProjectTabProps{
    profileId: string
}
export default function CompanyProjectTab({ profileId }: CompanyProjectTabProps) {

    const { user } = useAuthStore();

    return(
        <div className="flex flex-col gap-3">
            {user?.company_profile?.id === profileId && (
                <CreateCompanyProjectCard profileId={profileId} />
            )}
            <CompanyProjectList profileId={profileId} />
        </div>
    );
}