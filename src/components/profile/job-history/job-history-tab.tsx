import { useAuthStore } from "@/stores/auth-store";
import CreateJobHistoryCard from "./create-job-history-card";
import JobHistoryList from "./job-history-list";

interface JobHistoryTabProps {
	profileId: string;
}
export default function JobHistoryTab({ profileId }: JobHistoryTabProps) {
	const { user } = useAuthStore();

	return (
		<div className="flex flex-col gap-3">
			{user?.dev_profile?.id === profileId && (
				<CreateJobHistoryCard />
			)}
			<JobHistoryList profileId={profileId} />
		</div>
	);
}
