import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface SearchResultSkeletonProps {
	count?: number;
}

export default function SearchResultSkeleton({
	count = 3,
}: SearchResultSkeletonProps) {
	const placeholders = Array.from({ length: count }, (_, index) => index);

	return (
		<div className="w-full flex flex-col gap-2">
			{placeholders.map((placeholder) => (
				<Card
					key={placeholder}
					className="w-full flex flex-row items-center gap-4 p-4"
				>
					<Skeleton className="size-14 rounded-full" />
					<div className="min-w-0 flex flex-1 flex-col gap-1">
						<Skeleton className="h-5 w-40" />
						<div className="flex flex-wrap gap-2">
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-5 w-20" />
						</div>
						<Skeleton className="h-4 w-full max-w-100" />
					</div>
				</Card>
			))}
		</div>
	);
}
