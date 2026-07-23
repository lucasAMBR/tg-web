import { useAuthStore } from "@/stores/auth-store";
import CreateProjectCard from "./create-project-card";
import ProjectHistoryList from "./project-list";

interface ProjectHistoryTabProps {
	profileId: string;
}

export default function ProjectHistoryTab({
	profileId,
}: ProjectHistoryTabProps) {
	const { user } = useAuthStore();

	return (
		<div className="flex flex-col gap-3">
			{user?.dev_profile?.id === profileId && (
				<CreateProjectCard profileId={profileId} />
			)}
			<ProjectHistoryList profileId={profileId} />
		</div>
	);
}
