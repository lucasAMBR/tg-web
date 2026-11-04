import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useRef } from "react";
import PostFeed from "@/components/social/post-feed";
import WhoToFollowCard from "@/components/social/who-to-follow-card";
import RecommendedVacanciesCard from "@/components/vacancies/recommended-vacancies-card";
import { useSocialPermissions } from "@/hooks/use-social-permissions";
import { useStickySidebar } from "@/hooks/use-sticky-sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { pageTitle } from "@/utils/page-title";
import { getUserMainRole } from "@/utils/role-helper";
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

	const user = useAuthStore((state) => state.user);

	// A recomendação de vagas só existe para dev (a API responde 403 aos outros)
	const showRecommendedVacancies = getUserMainRole(user) === "dev";
	// O ranking só aparece com `follow.view`
	const showWhoToFollow = permissions.canViewFollows;

	return (
		// O espaço que sobra é dividido igualmente antes do feed, entre o feed e a coluna lateral e
		// depois dela (justify-evenly); com o px igual ao gap, as três folgas continuam iguais
		// mesmo quando não sobra espaço nenhum.
		<div className="flex flex-1 flex-row justify-evenly gap-8 p-4 md:p-8">
			<div className="flex w-full min-w-0 max-w-3xl flex-col gap-4">
				<PostFeed />
			</div>

			{(showRecommendedVacancies || showWhoToFollow) && (
				<FeedAside>
					{showRecommendedVacancies && <RecommendedVacanciesCard />}
					{showWhoToFollow && <WhoToFollowCard />}
				</FeedAside>
			)}
		</div>
	);
}

/** Folga da coluna lateral até as bordas da área visível: o mesmo `top-8`. */
const ASIDE_OFFSET = 32;

/**
 * Coluna lateral do feed, só onde cabe ao lado dele. Mais alta que a tela, ela
 * rola junto com as postagens até mostrar o resto e então fica presa
 * (`useStickySidebar`). O wrapper ocupa a altura toda do feed, para a coluna
 * poder acompanhá-lo até o fim, e o `overflow-anchor: none` impede o navegador
 * de usar o que está nele como âncora de rolagem, já que o espaçador muda de
 * altura enquanto a coluna está presa.
 */
function FeedAside({ children }: { children: ReactNode }) {
	const asideRef = useRef<HTMLElement>(null);
	const spacerRef = useRef<HTMLDivElement>(null);

	useStickySidebar(asideRef, spacerRef, ASIDE_OFFSET);

	return (
		<div className="hidden w-sm shrink-0 flex-col [overflow-anchor:none] xl:flex">
			<div ref={spacerRef} aria-hidden className="shrink-0" />
			<aside ref={asideRef} className="sticky top-8 flex flex-col gap-8">
				{children}
			</aside>
		</div>
	);
}
