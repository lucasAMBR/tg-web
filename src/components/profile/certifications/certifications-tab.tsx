import { useAuthStore } from "@/stores/auth-store";
import CertificationList from "./certification-list";
import CreateCertificationCard from "./create-certitifcations-card";

interface CertificationsTabProps{
    profileId: string
}
export default function CertificationsTab({ profileId }: CertificationsTabProps){
	const { user } = useAuthStore();

    return(
        <div className="flex flex-col gap-3">
            {user?.dev_profile?.id === profileId && (
                <CreateCertificationCard profileId={profileId} />
            )}
            <CertificationList profileId={profileId} />
        </div>
    );
}