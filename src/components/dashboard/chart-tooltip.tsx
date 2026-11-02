import type { ReactNode } from "react";
import type { Formatter } from "recharts/types/component/DefaultTooltipContent";
import type { ChartConfig } from "@/components/ui/chart";

/**
 * Linha do tooltip com o valor formatado no idioma da tela. O conteúdo padrão
 * do shadcn usa `toLocaleString()` do navegador e não mostra porcentagem.
 */
export function valueTooltipFormatter(
	config: ChartConfig,
	formatValue: (value: number) => string,
): Formatter {
	return (value, name, item) => (
		<TooltipRow
			color={item.payload?.fill ?? item.color}
			label={config[String(name)]?.label ?? name}
			value={formatValue(Number(value))}
		/>
	);
}

function TooltipRow({
	color,
	label,
	value,
}: {
	color?: string;
	label: ReactNode;
	value: string;
}) {
	return (
		<>
			<div
				className="size-2.5 shrink-0 rounded-[2px]"
				style={{ backgroundColor: color }}
			/>
			<div className="flex flex-1 items-center justify-between gap-4 leading-none">
				<span className="text-muted-foreground">{label}</span>
				<span className="font-mono font-medium text-foreground tabular-nums">
					{value}
				</span>
			</div>
		</>
	);
}
