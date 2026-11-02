import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

interface StatCardProps {
	label: string;
	value: string;
	/** Texto menor embaixo do número, como o total de onde ele sai. */
	hint?: string;
	icon?: LucideIcon;
	highlight?: boolean;
	className?: string;
}

export function StatCard({
	label,
	value,
	hint,
	icon: Icon,
	highlight = false,
	className,
}: StatCardProps) {
	return (
		<Card
			className={cn(
				"min-w-0 gap-1 p-4",
				highlight && "border-primary bg-primary/5",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-2 text-sm leading-tight text-muted-foreground">
				<span>{label}</span>
				{Icon && <Icon className="size-4 shrink-0" />}
			</div>
			<p className={cn("font-bold", highlight ? "text-4xl" : "text-2xl")}>
				{value}
			</p>
			{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
		</Card>
	);
}
