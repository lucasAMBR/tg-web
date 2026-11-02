import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import AsideSheet from "@/components/global/aside-sheet";
import PostDetail from "@/components/social/post-detail";
import PostParticipantsCard from "@/components/social/post-participants-card";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/posts/$id/")({
	head: () => ({ meta: [{ title: pageTitle("post") }] }),
	staticData: {
		breadcrumb: {
			labelKey: "page_title.post",
			parents: [{ labelKey: "page_title.feed", href: "/feed" }],
		},
	},
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

function RouteComponent() {
	const { id } = Route.useParams();

	const { t } = useTranslation();

	const permissions = useSocialPermissions();

	// Onde os participantes não cabem ao lado, eles abrem num painel. No celular
	// o botão fica entre o post e os comentários; até `xl`, no topo da tela.
	const participantsSheet = (className: string) =>
		permissions.canViewPostParticipants && (
			<AsideSheet
				label={t("social.participants.title")}
				icon={Users}
				className={className}
			>
				<PostParticipantsCard postId={id} />
			</AsideSheet>
		);

	return (
		// Mesmo layout do feed: post e participantes com folgas iguais nas laterais
		// e entre os dois
		<div className="flex flex-1 flex-row justify-evenly gap-8 p-4 md:p-8">
			<div className="flex w-full min-w-0 max-w-3xl flex-col gap-4">
				{participantsSheet("max-md:hidden")}
				<PostDetail
					postId={id}
					beforeComments={participantsSheet("w-full md:hidden")}
				/>
			</div>

			{/* Os participantes só aparecem com `comment.view`, e só onde cabem ao lado do post */}
			{permissions.canViewPostParticipants && (
				<aside className="sticky top-8 hidden w-sm shrink-0 self-start xl:flex">
					<PostParticipantsCard postId={id} />
				</aside>
			)}
		</div>
	);
}
