import { useNavigate } from "@tanstack/react-router";
import { FileX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

interface PostUnavailableProps {
	/** `thread` quando o que sumiu foi a conversa, não a postagem. */
	variant?: "post" | "thread";
}

/**
 * Postagem excluída: a API passa a responder 422 em qualquer rota com o id
 * dela, e o link direto precisa dizer isso em vez de ficar carregando.
 */
export default function PostUnavailable({
	variant = "post",
}: PostUnavailableProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	return (
		<Empty className="border">
			<EmptyHeader>
				<EmptyMedia variant={"icon"}>
					<FileX />
				</EmptyMedia>
				<EmptyTitle>
					{variant === "thread"
						? t("social.errors.thread_unavailable")
						: t("social.errors.post_unavailable")}
				</EmptyTitle>
				<EmptyDescription>
					{t("social.errors.unavailable_description")}
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button variant={"outline"} onClick={() => navigate({ to: "/feed" })}>
					{t("social.feed.back_to_feed")}
				</Button>
			</EmptyContent>
		</Empty>
	);
}
