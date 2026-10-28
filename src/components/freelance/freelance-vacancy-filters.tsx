import { BrushCleaning, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	useEnumFreelanceJobType,
	useEnumSeniority,
} from "@/api/generated/enum/enum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL = "all";

export interface FreelanceVacancyFilterValues {
	search: string;
	job_type: string;
	seniority_level: string;
}

interface FreelanceVacancyFiltersProps {
	values: FreelanceVacancyFilterValues;
	/** Quem usa volta para a página 1 a cada troca. */
	onChange: (values: Partial<FreelanceVacancyFilterValues>) => void;
	/**
	 * Na pesquisa o termo vem do campo de busca geral da tela, então aqui ficam
	 * só os filtros de tipo e senioridade.
	 */
	showSearch?: boolean;
	className?: string;
}

export default function FreelanceVacancyFilters({
	values,
	onChange,
	showSearch = true,
	className,
}: FreelanceVacancyFiltersProps) {
	const { t } = useTranslation();

	const { data: jobTypes } = useEnumFreelanceJobType();
	const jobTypeList = jobTypes?.data ?? [];

	const { data: seniorities } = useEnumSeniority();
	const seniorityList = seniorities?.data ?? [];

	const hasFilters = !!(
		(showSearch && values.search) ||
		values.job_type ||
		values.seniority_level
	);

	return (
		<div className={cn("flex flex-col gap-2 md:flex-row", className)}>
			{showSearch && (
				<div className="relative flex flex-1">
					<Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={values.search}
						onChange={(event) => onChange({ search: event.target.value })}
						placeholder={t("freelance.search_placeholder")}
						aria-label={t("freelance.search_placeholder")}
						className="bg-background pl-9"
					/>
				</div>
			)}
			<Select
				value={values.job_type || ALL}
				onValueChange={(value) =>
					onChange({ job_type: value === ALL ? "" : value })
				}
			>
				<SelectTrigger
					className={cn("w-full", showSearch ? "md:w-52" : "md:flex-1")}
					aria-label={t("freelance.filter_job_type")}
				>
					<SelectValue placeholder={t("freelance.filter_job_type")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL}>{t("freelance.all_job_types")}</SelectItem>
					{jobTypeList.map((jobType) => (
						<SelectItem key={jobType.value} value={jobType.value}>
							{t(jobType.i18nKey, { defaultValue: jobType.label })}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				value={values.seniority_level || ALL}
				onValueChange={(value) =>
					onChange({ seniority_level: value === ALL ? "" : value })
				}
			>
				<SelectTrigger
					className={cn("w-full", showSearch ? "md:w-52" : "md:flex-1")}
					aria-label={t("freelance.filter_seniority_level")}
				>
					<SelectValue placeholder={t("freelance.filter_seniority_level")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL}>
						{t("freelance.all_seniority_levels")}
					</SelectItem>
					{seniorityList.map((seniority) => (
						<SelectItem key={seniority.value} value={seniority.value}>
							{t(seniority.i18nKey, { defaultValue: seniority.label })}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Button
				variant={"secondary"}
				disabled={!hasFilters}
				onClick={() =>
					onChange({
						...(showSearch ? { search: "" } : {}),
						job_type: "",
						seniority_level: "",
					})
				}
			>
				<BrushCleaning className="size-4" /> {t("general.clear")}
			</Button>
		</div>
	);
}
