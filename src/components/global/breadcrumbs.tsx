import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { cn } from "@/lib/utils";
import type { BreadcrumbEntry } from "@/types/breadcrumb";

type BreadcrumbsProps = {
	className?: string;
	/** Acima disso os itens do meio colapsam em um menu "...". */
	maxItems?: number;
};

function CrumbContent({ entry }: { entry: BreadcrumbEntry }) {
	const Icon = entry.icon;

	return (
		<>
			{Icon && <Icon className="size-4" />}
			{entry.label}
		</>
	);
}

function Crumb({ entry }: { entry: BreadcrumbEntry }) {
	if (!entry.href) {
		return (
			<BreadcrumbPage
				className={cn(!entry.isCurrent && "text-muted-foreground font-normal")}
			>
				<CrumbContent entry={entry} />
			</BreadcrumbPage>
		);
	}

	return (
		<BreadcrumbLink asChild>
			<Link to={entry.href}>
				<CrumbContent entry={entry} />
			</Link>
		</BreadcrumbLink>
	);
}

export function Breadcrumbs({ className, maxItems = 4 }: BreadcrumbsProps) {
	const entries = useBreadcrumbs();

	if (entries.length === 0) return null;

	// Abaixo de 3 não sobra espaço para "primeiro + ... + atual".
	const limit = Math.max(maxItems, 3);
	const shouldCollapse = entries.length > limit;
	const tailSize = limit - 2;

	const first = entries[0];
	const collapsed = shouldCollapse ? entries.slice(1, -tailSize) : [];
	const visible = shouldCollapse ? entries.slice(-tailSize) : entries.slice(1);

	return (
		<Breadcrumb className={cn("flex items-center", className)}>
			<BreadcrumbList className="text-base">
				<BreadcrumbItem>
					<Crumb entry={first} />
				</BreadcrumbItem>

				{collapsed.length > 0 && (
					<>
						<BreadcrumbSeparator className="[&>svg]:size-4" />
						<BreadcrumbItem>
							<DropdownMenu>
								<DropdownMenuTrigger
									className="flex items-center gap-1 cursor-pointer"
									aria-label="Toggle breadcrumb menu"
								>
									<BreadcrumbEllipsis className="size-4" />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									{collapsed.map((entry) => (
										<DropdownMenuItem key={entry.key} asChild={!!entry.href}>
											{entry.href ? (
												<Link to={entry.href}>{entry.label}</Link>
											) : (
												<span>{entry.label}</span>
											)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</BreadcrumbItem>
					</>
				)}

				{visible.map((entry) => (
					<Fragment key={entry.key}>
						<BreadcrumbSeparator className="[&>svg]:size-4" />
						<BreadcrumbItem>
							<Crumb entry={entry} />
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
