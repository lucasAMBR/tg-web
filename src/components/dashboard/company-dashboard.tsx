import { Link } from "@tanstack/react-router";
import {
	Briefcase,
	CalendarClock,
	CalendarDays,
	Code,
	FolderPlus,
	Percent,
	UserCheck,
	Users,
	Video,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDashboardParams } from "@/hooks/filters/use-dashboard-params";
import { useCompanyDashboard } from "@/hooks/use-dashboard";
import { useDashboardFormat } from "@/hooks/use-dashboard-format";
import { cn } from "@/lib/utils";
import {
	type CompanyDashboard as CompanyDashboardData,
	hasData,
} from "@/types/dashboard";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CategoryBarChart } from "./category-bar-chart";
import { ChartCard } from "./chart-card";
import { SINGLE_SERIES_COLOR } from "./chart-colors";
import {
	DashboardError,
	DashboardMessage,
	DashboardPage,
	DashboardSkeleton,
} from "./dashboard-states";
import { DonutChart, enumDonutItems } from "./donut-chart";
import { StatCard } from "./stat-card";
import { TimelineChart } from "./timeline-chart";

export default function CompanyDashboard() {
	const { t } = useTranslation();

	const { months } = useDashboardParams();
	const { data, error, isPending, isPlaceholderData, isFetching, refetch } =
		useCompanyDashboard(months);

	return (
		<DashboardPage
			title={t("dashboard.company.title")}
			description={t("dashboard.company.description")}
			isRefreshing={isPlaceholderData && isFetching}
		>
			{isPending ? (
				<DashboardSkeleton />
			) : error ? (
				<DashboardError error={error} dashboard="company" onRetry={refetch} />
			) : data.summary.vacancies_total === 0 ? (
				<DashboardMessage
					icon={<FolderPlus />}
					title={t("dashboard.company.empty.no_vacancies")}
				>
					<Button asChild>
						<Link to="/my-vacancies">
							{t("dashboard.company.empty.create_vacancy")}
						</Link>
					</Button>
				</DashboardMessage>
			) : (
				<CompanyDashboardContent data={data} />
			)}
		</DashboardPage>
	);
}

function CompanyDashboardContent({ data }: { data: CompanyDashboardData }) {
	const { t } = useTranslation();
	const { formatNumber, formatPercent, enumLabel, vacancyTitle } =
		useDashboardFormat();

	const { summary } = data;

	// Sem candidaturas, os gráficos delas dão lugar à mensagem e os de vagas continuam
	const noApplications =
		summary.applications_total === 0
			? t("dashboard.company.empty.no_applications")
			: null;

	const applicationSeries = [
		{ key: "in_progress", label: t("enum.dev_job_vacancy_status.in_progress") },
		{ key: "approved", label: t("enum.dev_job_vacancy_status.approved") },
		{ key: "rejected", label: t("enum.dev_job_vacancy_status.rejected") },
	];

	return (
		<>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
				<StatCard
					label={t("dashboard.company.summary.vacancies_active")}
					value={formatNumber(summary.vacancies_active)}
					hint={t("dashboard.company.summary.vacancies_total", {
						count: summary.vacancies_total,
						total: formatNumber(summary.vacancies_total),
					})}
					icon={Briefcase}
				/>
				<StatCard
					label={t("dashboard.company.summary.applications")}
					value={formatNumber(summary.applications_total)}
					hint={t("dashboard.company.summary.applications_in_progress", {
						total: formatNumber(summary.applications_in_progress),
					})}
					icon={Users}
				/>
				<StatCard
					label={t("dashboard.company.summary.applications_last_30_days")}
					value={formatNumber(summary.applications_last_30_days)}
					icon={CalendarDays}
				/>
				<StatCard
					label={t("dashboard.company.summary.hired")}
					value={formatNumber(summary.hired_total)}
					icon={UserCheck}
				/>
				<StatCard
					label={t("dashboard.company.summary.hire_rate")}
					value={formatPercent(summary.hire_rate)}
					icon={Percent}
				/>
				<StatCard
					label={t("dashboard.company.summary.average_per_vacancy")}
					value={formatNumber(summary.average_applications_per_vacancy)}
					icon={Users}
				/>
			</div>

			<AgendaCard agenda={data.agenda} />

			<div className="grid gap-6 lg:grid-cols-2">
				<ChartCard
					title={t("dashboard.company.charts.vacancies_by_status")}
					emptyMessage={
						hasData(data.vacancies_by_status) ? null : t("dashboard.empty")
					}
				>
					<DonutChart
						items={enumDonutItems(data.vacancies_by_status, enumLabel)}
					/>
				</ChartCard>
				<ChartCard
					title={t("dashboard.company.charts.applications_by_status")}
					emptyMessage={noApplications}
				>
					<DonutChart
						items={enumDonutItems(data.applications_by_status, enumLabel)}
					/>
				</ChartCard>
			</div>

			<ChartCard
				title={t("dashboard.company.charts.applications_by_vacancy")}
				description={t("dashboard.company.charts.applications_by_vacancy_hint")}
				emptyMessage={noApplications}
			>
				<CategoryBarChart
					orientation="horizontal"
					stacked
					categoryWidth={200}
					series={applicationSeries}
					data={data.applications_by_vacancy.map((vacancy) => ({
						label: vacancyTitle(vacancy),
						id: vacancy.id,
						in_progress: vacancy.in_progress,
						approved: vacancy.approved,
						rejected: vacancy.rejected,
					}))}
					categoryHref={(row) => `/my-vacancies/${row.id}`}
				/>
			</ChartCard>

			<div className="grid gap-6 xl:grid-cols-2">
				<ChartCard
					title={t("dashboard.company.charts.funnel")}
					description={t("dashboard.company.charts.funnel_hint")}
					emptyMessage={
						noApplications ??
						(data.applications_by_process_step.length === 0
							? t("dashboard.empty")
							: null)
					}
				>
					<CategoryBarChart
						orientation="horizontal"
						stacked
						categoryWidth={160}
						series={applicationSeries.filter((item) => item.key !== "approved")}
						data={data.applications_by_process_step.map((stage) => ({
							label: enumLabel(stage),
							in_progress: stage.in_progress,
							rejected: stage.rejected,
						}))}
					/>
				</ChartCard>
				<ChartCard
					title={t("dashboard.company.charts.vacancies_by_process_step")}
					description={t(
						"dashboard.company.charts.vacancies_by_process_step_hint",
					)}
					emptyMessage={
						hasData(data.vacancies_by_process_step)
							? null
							: t("dashboard.company.empty.no_vacancies_in_process")
					}
				>
					<CategoryBarChart
						orientation="horizontal"
						showValues
						categoryWidth={160}
						series={[
							{
								key: "count",
								label: t("dashboard.series.vacancies"),
								color: SINGLE_SERIES_COLOR,
							},
						]}
						data={data.vacancies_by_process_step.map((stage) => ({
							label: enumLabel(stage),
							count: stage.count,
							awaiting_count: stage.awaiting_count,
						}))}
						badge={(row) =>
							Number(row.awaiting_count) > 0
								? t("dashboard.company.awaiting_you", {
										count: Number(row.awaiting_count),
									})
								: null
						}
					/>
				</ChartCard>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<ChartCard
					title={t("dashboard.company.charts.applicants_by_specialty")}
					emptyMessage={noApplications}
				>
					<DonutChart
						items={enumDonutItems(data.applicants_by_specialty, enumLabel)}
					/>
				</ChartCard>
				<ChartCard
					title={t("dashboard.company.charts.applicants_by_seniority")}
					emptyMessage={noApplications}
				>
					<CategoryBarChart
						series={[
							{
								key: "count",
								label: t("dashboard.series.applicants"),
								color: SINGLE_SERIES_COLOR,
							},
						]}
						data={data.applicants_by_seniority.map((item) => ({
							label: enumLabel(item),
							count: item.count,
						}))}
					/>
				</ChartCard>
			</div>

			<ChartCard
				title={t("dashboard.charts.timeline")}
				description={t("dashboard.company.charts.timeline_hint")}
			>
				<TimelineChart
					data={data.timeline}
					series={[
						{
							key: "vacancies",
							label: t("dashboard.series.vacancies_created"),
						},
						{
							key: "applications",
							label: t("dashboard.series.applications_received"),
						},
					]}
				/>
			</ChartCard>
		</>
	);
}

/** Calls marcadas e, em destaque, as que esperam a empresa confirmar o horário. */
function AgendaCard({ agenda }: { agenda: CompanyDashboardData["agenda"] }) {
	const { t } = useTranslation();
	const { formatNumber } = useDashboardFormat();

	const items = [
		{
			label: t("dashboard.company.agenda.upcoming_interviews"),
			value: agenda.upcoming_interviews,
			icon: Video,
			awaiting: false,
		},
		{
			label: t("dashboard.company.agenda.upcoming_live_codings"),
			value: agenda.upcoming_live_codings,
			icon: Code,
			awaiting: false,
		},
		{
			label: t("dashboard.company.agenda.interviews_awaiting"),
			value: agenda.interviews_awaiting_confirmation,
			icon: CalendarClock,
			awaiting: true,
		},
		{
			label: t("dashboard.company.agenda.live_codings_awaiting"),
			value: agenda.live_codings_awaiting_confirmation,
			icon: CalendarClock,
			awaiting: true,
		},
	];

	return (
		<Card className="gap-4">
			<CardHeader>
				<CardTitle>{t("dashboard.company.agenda.title")}</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-2 gap-4 xl:grid-cols-4">
				{items.map(({ label, value, icon: Icon, awaiting }) => (
					<div
						key={label}
						className={cn(
							"flex flex-col gap-1 rounded-lg border p-3",
							awaiting && value > 0 && "border-primary bg-primary/5",
						)}
					>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Icon className="size-4 shrink-0" />
							<span>{label}</span>
						</div>
						<p className="text-2xl font-bold">{formatNumber(value)}</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
