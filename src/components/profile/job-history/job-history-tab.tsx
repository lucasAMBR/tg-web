import CreateJobHistoryCard from "./create-job-history-card";
import JobHistoryList from "./job-history-list";

interface JobHistoryTabProps {
	profileId: string;
}
export default function JobHistoryTab({ profileId }: JobHistoryTabProps) {
	return (
		<div className="flex flex-col gap-3">
			<CreateJobHistoryCard />
			<JobHistoryList profileId={profileId} />
		</div>
	);
}
