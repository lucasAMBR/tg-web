import { useIndexEmploymentHistory } from "@/api/generated/employment-history-doc/employment-history-doc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useJobHistoryParams } from "@/hooks/filters/use-job-history-filters";
import useDebounce from "@/hooks/use-debounce";
import { Briefcase, BrushCleaning, Search } from "lucide-react";
import JobHistoryCard from "./job-history-card";

import DefaultPagination, {
	type GenericPagination,
} from "@/components/global/pagination";
import { useState } from "react";
import type { EmploymentHistoryModel } from "@/api/generated/models";
import DeletejobHistoryModal from "./delete-job-history-modal";
import UpdateJobHistoryModal from "./update-job-history-modal";
import { useTranslation } from "react-i18next";

interface JobHistoryListProps {
	profileId: string;
}

export default function JobHistoryList({ profileId }: JobHistoryListProps) {
	const { t } = useTranslation();
		
	const { page, perPage, search, setFilterParams } = useJobHistoryParams();

	const debounceSearch = useDebounce(search, 500);

	const clearFilters = () => {
		setFilterParams({ page: 1, perPage: 10, search: "" });
	};

	const { data: employmentHistory, isPending } = useIndexEmploymentHistory({
		profile_id: profileId,
		page,
		per_page: perPage,
		search: debounceSearch,
	});

	const employmentList = employmentHistory?.data.data ?? [];

	const [selectedJob, setSelectedJob] = useState<EmploymentHistoryModel | null>(
		null,
	);

	const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

	const openDeleteModal = (job: EmploymentHistoryModel) => {
		setSelectedJob(job);
		setDeleteModalIsOpen(true);
	};

	const closeDeleteModal = () => {
		setSelectedJob(null);
		setDeleteModalIsOpen(false);
	};

	const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);

	const openUpdateModal = (job: EmploymentHistoryModel) => {
		setSelectedJob(job);
		setUpdateModalIsOpen(true);
	};

	const closeUpdateModal = () => {
		setSelectedJob(null);
		setUpdateModalIsOpen(false);
	};

	return (
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
						placeholder={t("placeholder.employment_search")}
						className="peer pl-9"
					/>
				</div>
				<Button variant={"secondary"} onClick={clearFilters}>
					<BrushCleaning className="size-4" /> {t("general.clear")}
				</Button>
			</Card>
			{employmentList.length === 0 && (
				<Card>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant={"icon"}>
								<Briefcase />
							</EmptyMedia>
							<EmptyTitle>{t("dev_profile.job_history.no_jobs")}</EmptyTitle>
						</EmptyHeader>
					</Empty>
				</Card>
			)}
			{employmentList.length > 0 && (
				<div className="flex flex-col gap-3">
					{employmentList.map((job) => (
						<JobHistoryCard
							job={job}
							profileId={profileId}
							openDelete={openDeleteModal}
							openUpdate={openUpdateModal}
						/>
					))}
				</div>
			)}
			<Card className="p-4 bg-muted">
				<DefaultPagination
					data={employmentHistory?.data.pagination as GenericPagination}
					setPage={(p) => setFilterParams({ page: p })}
					setPerPage={(pp) => setFilterParams({ perPage: pp })}
				/>
			</Card>
			<DeletejobHistoryModal
				profileId={profileId}
				open={deleteModalIsOpen}
				openChange={setDeleteModalIsOpen}
				closeModal={closeDeleteModal}
				job={selectedJob}
			/>
			<UpdateJobHistoryModal
				profileId={profileId}
				open={updateModalIsOpen}
				openChange={setUpdateModalIsOpen}
				closeModal={closeUpdateModal}
				job={selectedJob}
			/>
		</div>
	);
}
