import CertificationList from "./certification-list";
import CreateCertificationCard from "./create-certitifcations-card";

interface CertificationsTabProps{
    profileId: string
}
export default function CertificationsTab({ profileId }: CertificationsTabProps){

    return(
        <div className="flex flex-col gap-3">
            <CreateCertificationCard profileId={profileId} />
            <CertificationList profileId={profileId} />
        </div>
    );
}