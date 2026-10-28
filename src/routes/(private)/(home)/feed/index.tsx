import { createFileRoute } from "@tanstack/react-router";
import PostFeed from "@/components/social/post-feed";
import WhoToFollowCard from "@/components/social/who-to-follow-card";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/feed/")({
	head: () => ({ meta: [{ title: pageTitle("feed") }] }),
	staticData: { breadcrumb: { labelKey: "page_title.feed" } },
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

function RouteComponent() {
	const permissions = useSocialPermissions();

	return (
		// O espaço que sobra é dividido igualmente antes do feed, entre o feed e o ranking e depois
		// do ranking (justify-evenly); com o px igual ao gap, as três folgas continuam iguais
		// mesmo quando não sobra espaço nenhum.
		<div className="flex flex-1 flex-row justify-evenly gap-8 p-8">
			<div className="flex w-full min-w-0 max-w-3xl flex-col gap-4">
				<PostFeed />
			</div>

			{/* O ranking só aparece com `follow.view`, e só onde cabe ao lado do feed */}
			{permissions.canViewFollows && (
				<aside className="sticky top-8 hidden w-sm shrink-0 self-start xl:flex">
					<WhoToFollowCard />
				</aside>
			)}
		</div>
	);
}
