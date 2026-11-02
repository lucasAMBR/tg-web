import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AsideSheetProps {
	/** Texto do botão e título (só para leitores de tela) do painel. */
	label: string;
	icon: LucideIcon;
	/** Classes extras do botão, para posicioná-lo conforme a tela. */
	className?: string;
	children: ReactNode;
}

/**
 * Botão que abre num painel deslizante o conteúdo que fica ao lado da tela
 * principal. Aparece só onde a coluna lateral some (abaixo de `xl`).
 */
export default function AsideSheet({
	label,
	icon: Icon,
	className,
	children,
}: AsideSheetProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant={"outline"}
					className={cn("self-end xl:hidden", className)}
				>
					<Icon /> {label}
				</Button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-[90vw] max-w-sm overflow-y-auto p-4 pt-12 sm:max-w-sm"
				aria-describedby={undefined}
			>
				<SheetTitle className="sr-only">{label}</SheetTitle>
				{children}
			</SheetContent>
		</Sheet>
	);
}
