import { AlertCircle, Briefcase, type LucideIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import SearchResultSkeleton from "@/components/search/search-result-skeleton";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

interface FreelanceInfiniteListProps<T> {
	items: T[];
	getKey: (item: T) => string;
	renderItem: (item: T) => ReactNode;
	isLoading: boolean;
	isError: boolean;
	/** Mensagem do erro da primeira página. */
	errorMessage?: string;
	onRetry?: () => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	emptyTitle: string;
	emptyDescription?: string;
	emptyIcon?: LucideIcon;
	/** Atalho mostrado embaixo da mensagem de lista vazia. */
	emptyAction?: ReactNode;
}

/**
 * Lista com rolagem infinita das telas do módulo freelance, no mesmo formato da
 * lista de postagens: carrega a próxima página quando o fim da lista aparece.
 */
export default function FreelanceInfiniteList<T>({
	items,
	getKey,
	renderItem,
	isLoading,
	isError,
	errorMessage,
	onRetry,
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	emptyTitle,
	emptyDescription,
	emptyIcon: EmptyIcon = Briefcase,
	emptyAction,
}: FreelanceInfiniteListProps<T>) {
	const { t } = useTranslation();

	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;

		if (!sentinel || !hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) fetchNextPage();
		});

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (isLoading) return <SearchResultSkeleton />;

	if (isError && items.length === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<AlertCircle />
					</EmptyMedia>
					<EmptyTitle>{t("freelance.load_error")}</EmptyTitle>
					{errorMessage && <EmptyDescription>{errorMessage}</EmptyDescription>}
				</EmptyHeader>
				{onRetry && (
					<EmptyContent>
						<Button variant={"outline"} onClick={onRetry}>
							{t("freelance.retry")}
						</Button>
					</EmptyContent>
				)}
			</Empty>
		);
	}

	if (items.length === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<EmptyIcon />
					</EmptyMedia>
					<EmptyTitle>{emptyTitle}</EmptyTitle>
					{emptyDescription && (
						<EmptyDescription>{emptyDescription}</EmptyDescription>
					)}
				</EmptyHeader>
				{emptyAction && <EmptyContent>{emptyAction}</EmptyContent>}
			</Empty>
		);
	}

	return (
		<div className="flex w-full flex-col gap-2">
			{items.map((item) => (
				<div key={getKey(item)}>{renderItem(item)}</div>
			))}
			{isFetchingNextPage && (
				<div className="flex justify-center py-2">
					<Spinner className="size-4" />
				</div>
			)}
			<div ref={sentinelRef} className="h-px w-full" />
		</div>
	);
}
