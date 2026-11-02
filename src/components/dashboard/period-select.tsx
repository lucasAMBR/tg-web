import { useTranslation } from "react-i18next";
import { useDashboardParams } from "@/hooks/filters/use-dashboard-params";
import { DASHBOARD_MONTHS, type DashboardMonths } from "@/types/dashboard";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

/** Período da série mensal, guardado na URL. O resto da tela é sempre o estado atual. */
export function DashboardPeriodSelect() {
	const { t } = useTranslation();

	const { months, setFilterParams } = useDashboardParams();

	return (
		<Select
			value={String(months)}
			onValueChange={(value) =>
				setFilterParams({ months: Number(value) as DashboardMonths })
			}
		>
			<SelectTrigger className="w-[200px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{DASHBOARD_MONTHS.map((option) => (
					<SelectItem key={option} value={String(option)}>
						{t("dashboard.period.last_months", { count: option })}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
