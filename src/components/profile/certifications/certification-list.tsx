import { useIndexAdditionalCourses } from "@/api/generated/additional-course/additional-course"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useCertificationParams } from "@/hooks/filters/use-certification-params"
import useDebounce from "@/hooks/use-debounce"
import { BrushCleaning, Captions, Search } from "lucide-react"

import DefaultPagination, {
	type GenericPagination,
} from "@/components/global/pagination";
import { Input } from "@/components/ui/input"
import { useState } from "react"
import type { AdditionalCourseResource } from "@/api/generated/models"
import CertificationCard from "./certification-card"
import DeleteCertificationModal from "./delete-certification-modal"
import UpdateCertificationModal from "./update-certification-modal"
import { useTranslation } from "react-i18next"

interface CertificationListProps{
    profileId: string
}

export default function CertificationList({ profileId }: CertificationListProps) {
    const { t } = useTranslation();

    const {
        page,
        perPage,
        search,
        setFilterParams
    } = useCertificationParams();

    const debouncedSearch = useDebounce(search, 500);

    const clearFilters = () => setFilterParams({ page: 1, perPage: 10, search: ""}); 

    const { data: certifications } = useIndexAdditionalCourses({
        dev_profile_id: profileId, 
        page, 
        per_page: perPage, 
        search: debouncedSearch
    })

    const certificationList = certifications?.data.data ?? [];

    const [selectedCertificate, setSelectedCertificate] =
            useState<AdditionalCourseResource | null>(null);
    
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

    const openDelete = (cert: AdditionalCourseResource) => {
        setSelectedCertificate(cert);
        setOpenDeleteModal(true);
    };

    const closeDelete = () => {
        setSelectedCertificate(null);
        setOpenDeleteModal(false);
    };

    const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);

    const openUpdate = (cert: AdditionalCourseResource) => {
        setSelectedCertificate(cert);
        setOpenUpdateModal(true);
    };

    const closeUpdate = () => {
        setSelectedCertificate(null);
        setOpenUpdateModal(false);
    };

    return(
        <div className="flex flex-col gap-3">
			<Card className="p-4 flex flex-row gap-2">
				<div className="relative flex-1">
					<div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
						<Search className="size-4" />
						<span className="sr-only">User</span>
					</div>
					<Input
						value={search}
						onChange={(e) => setFilterParams({ search: e.target.value })}
						type="text"
						placeholder={t("placeholder.certification_search")}
						className="peer pl-9"
					/>
				</div>
				<Button variant={"secondary"} onClick={clearFilters}>
					<BrushCleaning className="size-4" /> {t("general.clear")}
				</Button>
			</Card>
			{certificationList.length === 0 && (
				<Card>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant={"icon"}>
								<Captions />
							</EmptyMedia>
							<EmptyTitle>{t("dev_profile.certifications.no_certifications")}</EmptyTitle>
						</EmptyHeader>
					</Empty>
				</Card>
			)}
			{certificationList.length > 0 && (
				<div className="flex flex-col gap-3">
					{certificationList.map((cert) => (
						<CertificationCard
                            certificate={cert}
                            profileId={profileId}
                            openDelete={openDelete}
                            openUpdate={openUpdate}
                        />
					))}
				</div>
			)}
			<Card className="p-4 bg-muted">
				<DefaultPagination
					data={certifications?.data.pagination as GenericPagination}
					setPage={(p) => setFilterParams({ page: p })}
					setPerPage={(pp) => setFilterParams({ perPage: pp })}
				/>
			</Card>
            <DeleteCertificationModal
                profileId={profileId}
                open={openDeleteModal}
                openChange={setOpenDeleteModal}
                certificate={selectedCertificate}
                closeModal={closeDelete}
            />
            <UpdateCertificationModal
                profileId={profileId}
                open={openUpdateModal}
                openChange={setOpenUpdateModal}
                certificate={selectedCertificate}
                closeModal={closeUpdate}
            />
        </div>
    )
}