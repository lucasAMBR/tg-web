import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Label, Pie, PieChart } from "recharts";
import { useDashboardFormat } from "@/hooks/use-dashboard-format";
import { cn } from "@/lib/utils";
import type { EnumCount } from "@/types/dashboard";
import {
	ChartContainer,
	ChartStyle,
	ChartTooltip,
	ChartTooltipContent,
} from "../ui/chart";
import { buildChartConfig } from "./chart-colors";
import { valueTooltipFormatter } from "./chart-tooltip";

export interface DonutItem {
	key: string;
	label: string;
	count: number;
}

interface DonutChartProps {
	items: DonutItem[];
	size?: "sm" | "md";
}

/** Rosca de uma distribuição, com o total no centro e a legenda com a porcentagem. */
export function DonutChart({ items, size = "md" }: DonutChartProps) {
	const { t } = useTranslation();
	const { formatNumber, formatPercent } = useDashboardFormat();

	// A legenda fica fora do `ChartContainer`, então declara as mesmas cores
	const scopeId = `donut-${useId().replace(/[^\w-]/g, "")}`;

	const config = buildChartConfig(items);
	const total = items.reduce((sum, item) => sum + item.count, 0);
	const percentOf = (count: number) =>
		formatPercent(total > 0 ? (count / total) * 100 : 0);

	const data = items
		.filter((item) => item.count > 0)
		.map((item) => ({
			key: item.key,
			count: item.count,
			fill: `var(--color-${item.key})`,
		}));

	return (
		<div
			data-chart={scopeId}
			className={cn(
				"flex flex-col items-center gap-4",
				size === "md" && "sm:flex-row sm:justify-center sm:gap-8",
			)}
		>
			<ChartStyle id={scopeId} config={config} />
			<ChartContainer
				config={config}
				className={cn(
					"aspect-square shrink-0",
					size === "md" ? "h-[200px]" : "h-[160px]",
				)}
			>
				<PieChart>
					<ChartTooltip
						content={
							<ChartTooltipContent
								hideLabel
								nameKey="key"
								formatter={valueTooltipFormatter(
									config,
									(count) => `${formatNumber(count)} (${percentOf(count)})`,
								)}
							/>
						}
					/>
					<Pie
						data={data}
						dataKey="count"
						nameKey="key"
						innerRadius="62%"
						stroke="var(--card)"
						strokeWidth={2}
						isAnimationActive={false}
					>
						<Label
							content={({ viewBox }) => {
								if (!viewBox || !("cx" in viewBox)) return null;

								const cx = viewBox.cx ?? 0;
								const cy = viewBox.cy ?? 0;

								return (
									<text x={cx} y={cy} textAnchor="middle">
										<tspan
											x={cx}
											y={cy}
											className={cn(
												"fill-foreground font-bold",
												size === "md" ? "text-2xl" : "text-xl",
											)}
										>
											{formatNumber(total)}
										</tspan>
										<tspan
											x={cx}
											y={cy + 18}
											className="fill-muted-foreground text-xs"
										>
											{t("dashboard.total")}
										</tspan>
									</text>
								);
							}}
						/>
					</Pie>
				</PieChart>
			</ChartContainer>

			<ul className="grid w-full max-w-64 gap-1.5 text-sm">
				{items.map((item) => (
					<li key={item.key} className="flex items-center gap-2">
						<span
							className="size-2.5 shrink-0 rounded-[2px]"
							style={{ backgroundColor: `var(--color-${item.key})` }}
						/>
						<span className="truncate text-muted-foreground">{item.label}</span>
						<span className="ml-auto shrink-0 tabular-nums">
							{formatNumber(item.count)}
							<span className="ml-1.5 text-xs text-muted-foreground">
								{percentOf(item.count)}
							</span>
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Itens da rosca a partir de uma distribuição por enum da API. */
export function enumDonutItems(
	items: EnumCount[],
	enumLabel: (item: EnumCount) => string,
): DonutItem[] {
	return items.map((item) => ({
		key: item.value,
		label: enumLabel(item),
		count: item.count,
	}));
}
