import { useIndexAcademicBackground } from "@/api/generated/academic-background-doc/academic-background-doc";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { useAcademicBackgroundParams } from "@/hooks/filters/use-academic-background-params";
import useDebounce from "@/hooks/use-debounce";
import { GraduationCap } from "lucide-react";

import AcademicBackgroundCard from "./academic-background-card";
import CreateAcademicBackgroundCard from "./create-academic-background-card";
import { useState } from "react";
import type { AcademicBackgroundModel } from "@/api/generated/models";
import DeleteAcademicBackgroundModal from "./academic-background-delete-modal";
import UpdateAcademicBackgroundModal from "./academic-background-update-modal";

interface AcademicBackgroundListProps {
	profileId: string;
}

export default function AcademicBackgroundList({
	profileId,
}: AcademicBackgroundListProps) {
	const { page, perPage, search, setFilterParams } =
		useAcademicBackgroundParams();

	const debouncedSearch = useDebounce(search, 500);

	const { data: academicBackgrounds, isLoading } = useIndexAcademicBackground({
		dev_profile_id: profileId,
		page,
		per_page: perPage,
		search: debouncedSearch,
	});

	const academicBackgroundList = academicBackgrounds?.data.data ?? [];

	const [selectedBackground, setSelectedBackground] =
		useState<AcademicBackgroundModel | null>(null);

	const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

	const openDelete = (bg: AcademicBackgroundModel) => {
		setSelectedBackground(bg);
		setOpenDeleteModal(true);
	};

	const closeDelete = () => {
		setSelectedBackground(null);
		setOpenDeleteModal(false);
	};

	const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);

	const openUpdate = (bg: AcademicBackgroundModel) => {
		setSelectedBackground(bg);
		setOpenUpdateModal(true);
	};

	const closeUpdate = () => {
		setSelectedBackground(null);
		setOpenUpdateModal(false);
	};

	return (
		<div className="flex flex-col gap-3">
			<h2 className="text-3xl flex justify-between">
				<span className="font-[Anta]">Academic Background</span>
				<CreateAcademicBackgroundCard profileId={profileId} />
			</h2>
			{academicBackgroundList.length === 0 && (
				<Card>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant={"icon"}>
								<GraduationCap />
							</EmptyMedia>
							<EmptyTitle>No Academic background</EmptyTitle>
						</EmptyHeader>
					</Empty>
				</Card>
			)}
			{academicBackgroundList.length > 0 && (
				<div className="flex flex-col gap-3">
					{academicBackgroundList.map((background) => (
						<AcademicBackgroundCard
							openDelete={openDelete}
							openUpdate={openUpdate}
							background={background}
							profileId={profileId}
						/>
					))}
				</div>
			)}
			<DeleteAcademicBackgroundModal
				bg={selectedBackground}
				open={openDeleteModal}
				onOpenChange={setOpenDeleteModal}
				closeModal={closeDelete}
				profileId={profileId}
			/>
			<UpdateAcademicBackgroundModal
				bg={selectedBackground}
				open={openUpdateModal}
				openChange={setOpenUpdateModal}
				closeModal={closeUpdate}
				profileId={profileId}
			/>
		</div>
	);
}
