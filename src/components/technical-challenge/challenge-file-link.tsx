import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	type ChallengeMedia,
	formatFileSize,
} from "@/types/technical-challenge";

interface ChallengeFileLinkProps {
	file: ChallengeMedia;
	label: string;
	/** Os cards de candidatura navegam no clique, então o evento para aqui. */
	stopPropagation?: boolean;
}

/** Download de um arquivo único da API (documento guia ou zip da entrega). */
export default function ChallengeFileLink({
	file,
	label,
	stopPropagation,
}: ChallengeFileLinkProps) {
	const size = formatFileSize(file.size);

	return (
		<Button asChild variant={"secondary"} className="w-fit">
			<a
				href={file.url}
				target="_blank"
				rel="noreferrer"
				download={file.name}
				onClick={(event) => stopPropagation && event.stopPropagation()}
			>
				<Download />
				<span className="truncate">{label}</span>
				{size && <span className="text-muted-foreground">({size})</span>}
			</a>
		</Button>
	);
}
