import CompanyProjectList from "./company-project-list";
import CreateCompanyProjectCard from "./create-company-project-card";

interface CompanyProjectTabProps{
    profileId: string
}
export default function CompanyProjectTab({ profileId }: CompanyProjectTabProps) {

    return(
        <div className="flex flex-col gap-3">
            <CreateCompanyProjectCard profileId={profileId} />
            <CompanyProjectList profileId={profileId} />
        </div>
    );
}