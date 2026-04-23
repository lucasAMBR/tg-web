import CreateProjectCard from "./create-project-card";
import ProjectHistoryList from "./project-list";

interface ProjectHistoryTabProps {
	profileId: string;
}

export default function ProjectHistoryTab({
	profileId,
}: ProjectHistoryTabProps) {
	return (
		<div className="flex flex-col gap-3">
			<CreateProjectCard profileId={profileId} />
			<ProjectHistoryList profileId={profileId} />
		</div>
	);
}
