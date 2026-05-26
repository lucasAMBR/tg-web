import { useId } from "react";
import {
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { IndexProjectHistory200DataPagination } from "@/api/generated/models";
import { useTranslation } from "react-i18next";

export type GenericPagination = {
	total: number;
	count: number;
	per_page: number;
	current_page: number;
	total_pages: number;
};

// Interface exata do seu objeto de paginação
interface DataTablePaginationProps {
	data: GenericPagination;
	// Passamos diretamente as funções de atualização do estado que o Orval observa
	setPage: (page: number) => void;
	setPerPage: (perPage: number) => void;
}

const DataTablePagination = ({
	data,
	setPage,
	setPerPage,
}: DataTablePaginationProps) => {
	const { t } = useTranslation();
	const id = useId();
	const {
		total = 0,
		per_page = 10,
		current_page = 1,
		total_pages = 1,
	} = data || {};

	const from = total === 0 ? 0 : (current_page - 1) * per_page + 1;
	const to = Math.min(current_page * per_page, total);

	// Helper para não repetir lógica de clique
	const goTo = (e: React.MouseEvent, page: number) => {
		e.preventDefault();
		setPage(page);
	};

	return (
		<div className="flex w-full flex-row items-center justify-between gap-6 flex-nowrap">
			{/* Rows per page - O Orval reage ao setPerPage automaticamente */}
			<div className="flex shrink-0 items-center gap-3">
				<Label
					htmlFor={id}
					className="text-xs font-medium text-muted-foreground"
				>
					{t("pagination.lines_per_page")}
				</Label>
				<Select
					value={String(per_page)}
					onValueChange={(value) => {
						setPerPage(Number(value));
						setPage(1); // Boa prática: resetar para pag 1 ao mudar o limite
					}}
				>
					<SelectTrigger id={id} className="h-8 w-[70px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{[10, 20, 30, 50].map((option) => (
							<SelectItem key={option} value={String(option)}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Info de exibição */}
			<div className="text-sm text-muted-foreground">
				{t("pagination.displaying")} <span className="font-medium text-foreground">{from}</span>-
				<span className="font-medium text-foreground">{to}</span> {t("pagination.of")} {" "}
				<span className="font-medium text-foreground">{total}</span>
			</div>

			<div className="flex justify-end shrink-0">
				<Pagination className="w-fit">
					<PaginationContent>
						<PaginationItem>
							<PaginationLink
								href="#"
								onClick={(e) => goTo(e, 1)}
								className={cn(
									"rounded-full size-8",
									current_page === 1 && "pointer-events-none opacity-50",
								)}
							>
								<ChevronFirstIcon className="size-4" />
							</PaginationLink>
						</PaginationItem>

						<PaginationItem>
							<PaginationLink
								href="#"
								onClick={(e) => goTo(e, current_page - 1)}
								className={cn(
									"rounded-full size-8",
									current_page === 1 && "pointer-events-none opacity-50",
								)}
							>
								<ChevronLeftIcon className="size-4" />
							</PaginationLink>
						</PaginationItem>

						{/* Página Atual Simplificada */}
						<PaginationItem>
							<div className="text-sm font-medium px-2">
								{t("pagination.page")} {current_page} {t("pagination.of")} {total_pages}
							</div>
						</PaginationItem>

						<PaginationItem>
							<PaginationLink
								href="#"
								onClick={(e) => goTo(e, current_page + 1)}
								className={cn(
									"rounded-full size-8",
									current_page === total_pages &&
										"pointer-events-none opacity-50",
								)}
							>
								<ChevronRightIcon className="size-4" />
							</PaginationLink>
						</PaginationItem>

						<PaginationItem>
							<PaginationLink
								href="#"
								onClick={(e) => goTo(e, total_pages)}
								className={cn(
									"rounded-full size-8",
									current_page === total_pages &&
										"pointer-events-none opacity-50",
								)}
							>
								<ChevronLastIcon className="size-4" />
							</PaginationLink>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
};

export default DataTablePagination;
