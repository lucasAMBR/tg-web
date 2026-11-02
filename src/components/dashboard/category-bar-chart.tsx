import { useNavigate } from "@tanstack/react-router";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Rectangle,
	XAxis,
	YAxis,
} from "recharts";
import type { BarShapeProps } from "recharts/types/cartesian/Bar";
import { useDashboardFormat } from "@/hooks/use-dashboard-format";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "../ui/chart";
import { buildChartConfig, type categoryColor } from "./chart-colors";
import { valueTooltipFormatter } from "./chart-tooltip";

export interface BarSeries {
	key: string;
	label: string;
	color?: ReturnType<typeof categoryColor>;
}

/** Uma linha por categoria: `label` é o texto do eixo e o resto são as séries. */
export type BarRow = { label: string } & Record<string, string | number>;

interface CategoryBarChartProps {
	data: BarRow[];
	series: BarSeries[];
	/** `vertical`: colunas; `horizontal`: barras deitadas, uma categoria por linha. */
	orientation?: "vertical" | "horizontal";
	stacked?: boolean;
	/** Valor na ponta de cada barra, no lugar do eixo. Só nas barras deitadas de uma série. */
	showValues?: boolean;
	/** Selo ao lado do valor, como "2 aguardando você". */
	badge?: (row: BarRow) => string | null;
	/** Largura do eixo das categorias nas barras deitadas. */
	categoryWidth?: number;
	/** Transforma cada categoria (o texto do eixo e a barra) em link. */
	categoryHref?: (row: BarRow) => string;
}

const ROW_HEIGHT = 36;
const AXIS_HEIGHT = 32;
const CHAR_WIDTH = 7;

export function CategoryBarChart({
	data,
	series,
	orientation = "vertical",
	stacked = false,
	showValues = false,
	badge,
	categoryWidth = 128,
	categoryHref,
}: CategoryBarChartProps) {
	const navigate = useNavigate();
	const { formatNumber } = useDashboardFormat();

	const config = buildChartConfig(series);
	const horizontal = orientation === "horizontal";
	const hasLegend = series.length > 1;

	const maxChars = Math.floor(categoryWidth / CHAR_WIDTH);
	const truncate = (text: string) =>
		text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;

	// Numa pilha, só o segmento da ponta leva o canto arredondado
	const lastKey = series.at(-1)?.key;
	const radiusFor = (
		key: string,
	): [number, number, number, number] | number => {
		if (stacked && key !== lastKey) return 0;

		return horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0];
	};

	const rowHeight = stacked
		? ROW_HEIGHT
		: ROW_HEIGHT + (series.length - 1) * 16;
	const height = horizontal
		? data.length * rowHeight +
			(showValues ? 8 : AXIS_HEIGHT) +
			(hasLegend ? 36 : 0)
		: 280;

	const rightMargin = showValues ? (badge ? 160 : 40) : 16;

	return (
		<ChartContainer
			config={config}
			className="aspect-auto w-full"
			style={{ height }}
		>
			<BarChart
				data={data}
				layout={horizontal ? "vertical" : "horizontal"}
				margin={{ left: 0, right: rightMargin, top: 8 }}
				barGap={2}
			>
				<CartesianGrid
					vertical={horizontal && !showValues}
					horizontal={!horizontal}
				/>
				{horizontal ? (
					<>
						<XAxis
							type="number"
							allowDecimals={false}
							hide={showValues}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							type="category"
							dataKey="label"
							width={categoryWidth}
							tickLine={false}
							axisLine={false}
							interval={0}
							tick={({ x, y, payload, index }) => (
								<CategoryTick
									x={Number(x)}
									y={Number(y)}
									label={String(payload.value)}
									text={truncate(String(payload.value))}
									href={categoryHref?.(data[index])}
								/>
							)}
						/>
					</>
				) : (
					<>
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							interval={0}
							tickFormatter={truncate}
						/>
						<YAxis
							allowDecimals={false}
							width={32}
							tickLine={false}
							axisLine={false}
						/>
					</>
				)}
				<ChartTooltip
					content={
						<ChartTooltipContent
							formatter={valueTooltipFormatter(config, formatNumber)}
						/>
					}
				/>
				{hasLegend && (
					<ChartLegend itemSorter={null} content={<ChartLegendContent />} />
				)}
				{series.map((item) => (
					<Bar
						key={item.key}
						dataKey={item.key}
						fill={`var(--color-${item.key})`}
						stackId={stacked ? "stack" : undefined}
						radius={radiusFor(item.key)}
						stroke={stacked ? "var(--card)" : undefined}
						strokeWidth={stacked ? 2 : 0}
						maxBarSize={horizontal ? 24 : 48}
						isAnimationActive={false}
						className={categoryHref ? "cursor-pointer" : undefined}
						// O recharts descarta as barras de largura zero antes de numerar,
						// então a linha vem do `payload`, nunca do índice
						onClick={(bar) => {
							if (categoryHref) navigate({ to: categoryHref(bar.payload) });
						}}
						// Com `shape` próprio as barras zeradas não são descartadas e
						// também ganham o valor na ponta
						shape={
							showValues
								? (bar: BarShapeProps) => (
										<g>
											<Rectangle {...bar} />
											<BarValue
												x={bar.x + bar.width + 8}
												centerY={bar.y + bar.height / 2}
												text={formatNumber(Number(bar.payload[item.key]))}
												badge={badge?.(bar.payload) ?? null}
											/>
										</g>
									)
								: undefined
						}
					/>
				))}
			</BarChart>
		</ChartContainer>
	);
}

interface CategoryTickProps {
	x: number;
	y: number;
	label: string;
	/** Texto do eixo, cortado quando não cabe; o completo fica no `title`. */
	text: string;
	href?: string;
}

function CategoryTick({ x, y, label, text, href }: CategoryTickProps) {
	const navigate = useNavigate();

	const position = {
		x,
		y,
		dx: -8,
		textAnchor: "end",
		dominantBaseline: "central",
	} as const;

	if (!href) {
		return (
			<text {...position} className="fill-muted-foreground">
				<title>{label}</title>
				{text}
			</text>
		);
	}

	// Link do SVG com a navegação do router, sem recarregar a página
	return (
		<a
			href={href}
			onClick={(event) => {
				event.preventDefault();
				navigate({ to: href });
			}}
		>
			<text
				{...position}
				className="cursor-pointer fill-foreground hover:underline"
			>
				<title>{label}</title>
				{text}
			</text>
		</a>
	);
}

interface BarValueProps {
	x: number;
	centerY: number;
	text: string;
	badge: string | null;
}

function BarValue({ x, centerY, text, badge }: BarValueProps) {
	const badgeX = x + text.length * CHAR_WIDTH + 8;
	const badgeWidth = (badge?.length ?? 0) * 6 + 16;

	return (
		<g>
			<text
				x={x}
				y={centerY}
				dominantBaseline="central"
				className="fill-foreground text-xs tabular-nums"
			>
				{text}
			</text>
			{badge && (
				<g>
					<rect
						x={badgeX}
						y={centerY - 9}
						width={badgeWidth}
						height={18}
						rx={9}
						className="fill-primary/15"
					/>
					<text
						x={badgeX + badgeWidth / 2}
						y={centerY}
						textAnchor="middle"
						dominantBaseline="central"
						className="fill-primary text-[11px] font-medium"
					>
						{badge}
					</text>
				</g>
			)}
		</g>
	);
}
