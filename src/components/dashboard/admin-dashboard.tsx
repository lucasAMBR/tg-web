import {
	Bookmark,
	Briefcase,
	Building,
	Code,
	Contact,
	FileText,
	Heart,
	MessageCircle,
	MessagesSquare,
	Send,
	Sparkles,
	UserCheck,
	UserPlus,
	Users,
	Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDashboardParams } from "@/hooks/filters/use-dashboard-params";
import { useAdminDashboard } from "@/hooks/use-dashboard";
import { useDashboardFormat } from "@/hooks/use-dashboard-format";
import {
	type AdminDashboard as AdminDashboardData,
	type EnumCount,
	hasData,
	type LanguageCount,
} from "@/types/dashboard";
import { CategoryBarChart } from "./category-bar-chart";
import { ChartCard } from "./chart-card";
import { SINGLE_SERIES_COLOR } from "./chart-colors";
import {
	DashboardError,
	DashboardPage,
	DashboardSkeleton,
} from "./dashboard-states";
import { DonutChart, enumDonutItems } from "./donut-chart";
import { StatCard } from "./stat-card";
import { TimelineChart } from "./timeline-chart";

export default function AdminDashboard() {
	const { t } = useTranslation();

	const { months } = useDashboardParams();
	const { data, error, isPending, isPlaceholderData, isFetching, refetch } =
		useAdminDashboard(months);

	return (
		<DashboardPage
			title={t("dashboard.admin.title")}
			description={t("dashboard.admin.description")}
			isRefreshing={isPlaceholderData && isFetching}
		>
			{isPending ? (
				<DashboardSkeleton />
			) : error ? (
				<DashboardError error={error} dashboard="admin" onRetry={refetch} />
			) : (
				<AdminDashboardContent data={data} />
			)}
		</DashboardPage>
	);
}

function AdminDashboardContent({ data }: { data: AdminDashboardData }) {
	const { t } = useTranslation();
	const { formatNumber, formatCurrency, enumLabel } = useDashboardFormat();

	const { summary, social } = data;

	const profiles = [
		{ key: "dev", label: t("role.dev"), count: summary.devs },
		{ key: "company", label: t("role.company"), count: summary.companies },
		{ key: "client", label: t("role.client"), count: summary.clients },
		{ key: "admin", label: t("role.admin"), count: summary.admins },
	];

	const statusCharts: { title: string; items: EnumCount[] }[] = [
		{
			title: t("dashboard.admin.charts.job_vacancies_by_status"),
			items: data.job_vacancies_by_status,
		},
		{
			title: t("dashboard.admin.charts.applications_by_status"),
			items: data.applications_by_status,
		},
		{
			title: t("dashboard.admin.charts.freelance_vacancies_by_status"),
			items: data.freelance_vacancies_by_status,
		},
		{
			title: t("dashboard.admin.charts.freelance_proposals_by_status"),
			items: data.freelance_proposals_by_status,
		},
	];

	const segments = data.companies_by_segment
		.filter((item) => item.count > 0)
		.sort((a, b) => b.count - a.count);

	return (
		<>
			<div className="flex flex-col gap-2">
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<StatCard
						label={t("dashboard.admin.summary.users")}
						value={formatNumber(summary.users_total)}
						hint={t("dashboard.admin.summary.new_users", {
							total: formatNumber(summary.new_users_last_30_days),
						})}
						icon={Users}
					/>
					<StatCard
						label={t("dashboard.admin.summary.devs")}
						value={formatNumber(summary.devs)}
						hint={t("dashboard.admin.summary.devs_open_to_work", {
							total: formatNumber(summary.devs_open_to_work),
						})}
						icon={Code}
					/>
					<StatCard
						label={t("dashboard.admin.summary.companies")}
						value={formatNumber(summary.companies)}
						icon={Building}
					/>
					<StatCard
						label={t("dashboard.admin.summary.clients")}
						value={formatNumber(summary.clients)}
						icon={Contact}
					/>
					<StatCard
						label={t("dashboard.admin.summary.open_vacancies")}
						value={formatNumber(summary.job_vacancies_open)}
						hint={t("dashboard.admin.summary.vacancies_total", {
							total: formatNumber(summary.job_vacancies_total),
						})}
						icon={Briefcase}
					/>
					<StatCard
						label={t("dashboard.admin.summary.applications")}
						value={formatNumber(summary.applications_total)}
						icon={Send}
					/>
					<StatCard
						label={t("dashboard.admin.summary.hired")}
						value={formatNumber(summary.hired_total)}
						icon={UserCheck}
					/>
					<StatCard
						label={t("dashboard.admin.summary.freelance_volume")}
						value={formatCurrency(summary.freelance_contracted_volume)}
						hint={t("dashboard.admin.summary.freelance_totals", {
							vacancies: formatNumber(summary.freelance_vacancies_total),
							proposals: formatNumber(summary.freelance_proposals_total),
						})}
						icon={Wallet}
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					{t("dashboard.admin.summary.footnote", {
						blocked: formatNumber(summary.blocked_users),
						admins: formatNumber(summary.admins),
						tested: formatNumber(summary.devs_seniority_tested),
					})}
				</p>
			</div>

			<div className="grid gap-6 xl:grid-cols-5">
				<ChartCard
					title={t("dashboard.admin.charts.users_by_profile")}
					className="xl:col-span-2"
					emptyMessage={hasData(profiles) ? null : t("dashboard.empty")}
				>
					<DonutChart items={profiles} />
				</ChartCard>
				<ChartCard
					title={t("dashboard.admin.charts.specialties")}
					description={t("dashboard.admin.charts.specialties_hint")}
					className="xl:col-span-3"
				>
					<CategoryBarChart
						series={[
							{ key: "devs", label: t("dashboard.series.devs") },
							{ key: "job_vacancies", label: t("dashboard.series.vacancies") },
							{
								key: "applications",
								label: t("dashboard.series.applications"),
							},
						]}
						data={data.specialties.map((specialty) => ({
							label: enumLabel(specialty),
							devs: specialty.devs,
							job_vacancies: specialty.job_vacancies,
							applications: specialty.applications,
						}))}
					/>
				</ChartCard>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<ChartCard
					title={t("dashboard.admin.charts.devs_by_seniority")}
					emptyMessage={
						hasData(data.devs_by_seniority) ? null : t("dashboard.empty")
					}
				>
					<CategoryBarChart
						series={[
							{
								key: "count",
								label: t("dashboard.series.devs"),
								color: SINGLE_SERIES_COLOR,
							},
						]}
						data={data.devs_by_seniority.map((item) => ({
							label: enumLabel(item),
							count: item.count,
						}))}
					/>
				</ChartCard>
				<ChartCard
					title={t("dashboard.admin.charts.companies_by_segment")}
					emptyMessage={segments.length > 0 ? null : t("dashboard.empty")}
				>
					<CategoryBarChart
						orientation="horizontal"
						showValues
						categoryWidth={180}
						series={[
							{
								key: "count",
								label: t("dashboard.series.companies"),
								color: SINGLE_SERIES_COLOR,
							},
						]}
						data={segments.map((item) => ({
							label: enumLabel(item),
							count: item.count,
						}))}
					/>
				</ChartCard>
			</div>

			<div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
				{statusCharts.map((chart) => (
					<ChartCard
						key={chart.title}
						title={chart.title}
						emptyMessage={hasData(chart.items) ? null : t("dashboard.empty")}
					>
						<DonutChart
							size="sm"
							items={enumDonutItems(chart.items, enumLabel)}
						/>
					</ChartCard>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<LanguagesCard
					title={t("dashboard.admin.charts.top_dev_languages")}
					seriesLabel={t("dashboard.series.devs")}
					languages={data.top_dev_languages}
				/>
				<LanguagesCard
					title={t("dashboard.admin.charts.top_vacancy_languages")}
					seriesLabel={t("dashboard.series.vacancies")}
					languages={data.top_vacancy_languages}
				/>
			</div>

			<div className="flex flex-col gap-3">
				<h3 className="text-lg font-semibold">
					{t("dashboard.admin.social.title")}
				</h3>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<StatCard
						label={t("dashboard.admin.social.interactions")}
						value={formatNumber(social.interactions)}
						hint={t("dashboard.admin.social.interactions_hint")}
						icon={Sparkles}
						highlight
						className="col-span-2 md:row-span-2 md:justify-center"
					/>
					<StatCard
						label={t("dashboard.admin.social.posts")}
						value={formatNumber(social.posts)}
						icon={FileText}
					/>
					<StatCard
						label={t("dashboard.admin.social.comments")}
						value={formatNumber(social.comments)}
						icon={MessageCircle}
					/>
					<StatCard
						label={t("dashboard.admin.social.likes")}
						value={formatNumber(social.likes)}
						icon={Heart}
					/>
					<StatCard
						label={t("dashboard.admin.social.favorites")}
						value={formatNumber(social.favorites)}
						icon={Bookmark}
					/>
					<StatCard
						label={t("dashboard.admin.social.follows")}
						value={formatNumber(social.follows)}
						icon={UserPlus}
					/>
					<StatCard
						label={t("dashboard.admin.social.chat")}
						value={formatNumber(social.chat_messages)}
						hint={t("dashboard.admin.social.chat_conversations", {
							total: formatNumber(social.chat_conversations),
						})}
						icon={MessagesSquare}
					/>
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				<ChartCard
					title={t("dashboard.admin.charts.timeline_platform")}
					description={t("dashboard.admin.charts.timeline_platform_hint")}
				>
					<TimelineChart
						data={data.timeline}
						series={[
							{ key: "users", label: t("dashboard.series.signups") },
							{
								key: "applications",
								label: t("dashboard.series.applications"),
							},
						]}
					/>
				</ChartCard>
				<ChartCard
					title={t("dashboard.admin.charts.timeline_social")}
					description={t("dashboard.admin.charts.timeline_social_hint")}
				>
					<TimelineChart
						data={data.timeline}
						series={[
							{ key: "posts", label: t("dashboard.admin.social.posts") },
							{ key: "comments", label: t("dashboard.admin.social.comments") },
							{ key: "likes", label: t("dashboard.admin.social.likes") },
						]}
					/>
				</ChartCard>
			</div>
		</>
	);
}

function LanguagesCard({
	title,
	seriesLabel,
	languages,
}: {
	title: string;
	seriesLabel: string;
	languages: LanguageCount[];
}) {
	const { t } = useTranslation();

	return (
		<ChartCard
			title={title}
			emptyMessage={hasData(languages) ? null : t("dashboard.empty")}
		>
			<CategoryBarChart
				orientation="horizontal"
				showValues
				categoryWidth={120}
				series={[
					{ key: "count", label: seriesLabel, color: SINGLE_SERIES_COLOR },
				]}
				data={languages.map((language) => ({
					label: language.name,
					count: language.count,
				}))}
			/>
		</ChartCard>
	);
}
