import { useIndexAcademicBackground } from "@/api/generated/academic-background/academic-background";
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
import type { AcademicBackgroundResource } from "@/api/generated/models";
import DeleteAcademicBackgroundModal from "./academic-background-delete-modal";
import UpdateAcademicBackgroundModal from "./academic-background-update-modal";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";

interface AcademicBackgroundListProps {
	profileId: string;
}

export default function AcademicBackgroundList({
	profileId,
}: AcademicBackgroundListProps) {
	const { t } = useTranslation();

	const { user } = useAuthStore();

	const { page, perPage, search } =
		useAcademicBackgroundParams();

	const debouncedSearch = useDebounce(search, 500);

	const { data: academicBackgrounds } = useIndexAcademicBackground({
		dev_profile_id: profileId,
		page,
		per_page: perPage,
		search: debouncedSearch,
	});

	const academicBackgroundList = academicBackgrounds?.data.data ?? [];

	const [selectedBackground, setSelectedBackground] =
		useState<AcademicBackgroundResource | null>(null);

	const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

	const openDelete = (bg: AcademicBackgroundResource) => {
		setSelectedBackground(bg);
		setOpenDeleteModal(true);
	};

	const closeDelete = () => {
		setSelectedBackground(null);
		setOpenDeleteModal(false);
	};

	const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);

	const openUpdate = (bg: AcademicBackgroundResource) => {
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
				<span className="font-[Anta]">{t("dev_profile.academic_background.title")}</span>
				{user?.dev_profile?.id === profileId && (
					<CreateAcademicBackgroundCard profileId={profileId} />
				)}
			</h2>
			{academicBackgroundList.length === 0 && (
				<Card>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant={"icon"}>
								<GraduationCap />
							</EmptyMedia>
							<EmptyTitle>{t("dev_profile.academic_background.no_academic_background")}</EmptyTitle>
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
				bg={openDeleteModal ? selectedBackground : null}
				open={openDeleteModal}
				onOpenChange={setOpenDeleteModal}
				closeModal={closeDelete}
				profileId={profileId}
			/>
			<UpdateAcademicBackgroundModal
				bg={openUpdateModal ? selectedBackground : null}
				open={openUpdateModal}
				openChange={setOpenUpdateModal}
				closeModal={closeUpdate}
				profileId={profileId}
			/>
		</div>
	);
}
