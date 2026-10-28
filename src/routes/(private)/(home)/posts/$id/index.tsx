import { createFileRoute } from "@tanstack/react-router";
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

	const permissions = useSocialPermissions();

	return (
		// Mesmo layout do feed: post e participantes com folgas iguais nas laterais
		// e entre os dois
		<div className="flex flex-1 flex-row justify-evenly gap-8 p-8">
			<div className="flex w-full min-w-0 max-w-3xl flex-col gap-4">
				<PostDetail postId={id} />
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
