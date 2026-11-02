import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useDashboardFormat } from "@/hooks/use-dashboard-format";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "../ui/chart";
import { buildChartConfig } from "./chart-colors";
import { valueTooltipFormatter } from "./chart-tooltip";

interface TimelineChartProps {
	/** Um item por mês (`YYYY-MM`), com um número por série. */
	data: ({ month: string } & Record<string, string | number>)[];
	series: { key: string; label: string }[];
}

/** Evolução mês a mês, uma linha por série na mesma escala. */
export function TimelineChart({ data, series }: TimelineChartProps) {
	const { formatNumber, formatMonth } = useDashboardFormat();

	const config = buildChartConfig(series);

	return (
		<ChartContainer config={config} className="aspect-auto h-[300px] w-full">
			<LineChart data={data} margin={{ left: 0, right: 16, top: 8 }}>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="month"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					tickFormatter={formatMonth}
				/>
				<YAxis
					allowDecimals={false}
					width={32}
					tickLine={false}
					axisLine={false}
				/>
				<ChartTooltip
					content={
						<ChartTooltipContent
							labelFormatter={(month) => formatMonth(String(month))}
							formatter={valueTooltipFormatter(config, formatNumber)}
						/>
					}
				/>
				<ChartLegend itemSorter={null} content={<ChartLegendContent />} />
				{series.map((item) => (
					<Line
						key={item.key}
						dataKey={item.key}
						type="monotone"
						stroke={`var(--color-${item.key})`}
						strokeWidth={2}
						dot={{
							r: 4,
							fill: `var(--color-${item.key})`,
							stroke: "var(--card)",
							strokeWidth: 2,
						}}
						activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
						isAnimationActive={false}
					/>
				))}
			</LineChart>
		</ChartContainer>
	);
}
