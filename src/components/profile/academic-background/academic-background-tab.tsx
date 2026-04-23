import AcademicBackgroundList from "./academic-background-list";
import CreateAcademicBackgroundCard from "./create-academic-background-card";

interface AcademicBackgroundTabProps {
	profileId: string;
}

export default function AcademicBackgroundTab({
	profileId,
}: AcademicBackgroundTabProps) {
	return (
		<div className="flex flex-col gap-3">
			<CreateAcademicBackgroundCard profileId={profileId} />
			<AcademicBackgroundList profileId={profileId} />
		</div>
	);
}
