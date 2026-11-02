import { ChartNoAxesColumn } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

interface ChartCardProps {
	title: string;
	description?: string;
	action?: ReactNode;
	/** Troca o gráfico pela mensagem de estado vazio. */
	emptyMessage?: string | null;
	className?: string;
	children: ReactNode;
}

export function ChartCard({
	title,
	description,
	action,
	emptyMessage,
	className,
	children,
}: ChartCardProps) {
	return (
		<Card className={cn("min-w-0 gap-4", className)}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
				{action && <CardAction>{action}</CardAction>}
			</CardHeader>
			<CardContent className="flex flex-1 flex-col justify-center">
				{emptyMessage ? <ChartEmpty message={emptyMessage} /> : children}
			</CardContent>
		</Card>
	);
}

export function ChartEmpty({ message }: { message: string }) {
	return (
		<div className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
			<ChartNoAxesColumn className="size-6" />
			<p>{message}</p>
		</div>
	);
}
