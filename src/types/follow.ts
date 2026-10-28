import type {
	FollowResource,
	IndexPopularUsersParams,
	PopularUserResource,
	ToggleFollow200Data,
	UserResource,
} from "@/api/generated/models";

/** Usuários por página em `GET /follow/{id}/followers` e `/following`. */
export const FOLLOWS_PER_PAGE = 20;

/** Itens por página do bloco "Quem seguir", ao lado do feed. */
export const WHO_TO_FOLLOW_PER_PAGE = 5;

/** A partir daqui os contadores passam para a notação compacta ("12 mil"). */
export const FOLLOW_COUNT_COMPACT_FROM = 10_000;

/** Campos que `GET /profile/{tipo}/{id}` traz em `data.user`. */
export interface FollowStats {
	/** Quantos seguem o dono do perfil. */
	followers_count: number;
	/** Quantos o dono do perfil segue. */
	following_count: number;
	/** O usuário logado segue o dono do perfil. Vem `false` no próprio perfil. */
	is_followed: boolean;
	/** O dono do perfil segue o usuário logado. Vem `false` no próprio perfil. */
	follows_you: boolean;
}

/**
 * Item das listas de seguidores e de seguidos. `is_followed` e `follows_you`
 * são sempre em relação a quem está logado, não ao dono da lista.
 */
export type FollowListItem = FollowResource;

/** Estado final depois do toggle, com o total de seguidores já atualizado. */
export type ToggleFollow = ToggleFollow200Data;

export type FollowListKind = "followers" | "following";

/**
 * Item do ranking de `GET /user/popular`. `popularity_score` é a soma das
 * curtidas, comentários e favoritos que os posts do usuário receberam de outras
 * pessoas, mais os seguidores.
 */
export type PopularUser = PopularUserResource;

/** Filtro do ranking; ausente traz todos os tipos de perfil. */
export type RankingProfileType = NonNullable<
	IndexPopularUsersParams["profile_type"]
>;

/**
 * Os contadores só vêm nas rotas que os carregam (exibição de perfil e
 * `/auth/profile`), por isso são opcionais no `UserResource` gerado.
 */
export function getFollowStats(
	user: Partial<UserResource> | null | undefined,
): FollowStats | undefined {
	if (!user) return undefined;

	return {
		followers_count: user.followers_count ?? 0,
		following_count: user.following_count ?? 0,
		is_followed: user.is_followed ?? false,
		follows_you: user.follows_you ?? false,
	};
}

/** Chave de tradução do botão de seguir. */
export function followButtonLabelKey(
	isFollowed: boolean,
	followsYou: boolean,
): string {
	if (isFollowed) return "social.follow.following";

	return followsYou ? "social.follow.follow_back" : "social.follow.follow";
}

/** Aplica o clique na hora; a resposta da API corrige o total depois. */
export function optimisticToggle<
	T extends { is_followed: boolean; followers_count: number },
>(state: T): T {
	return {
		...state,
		is_followed: !state.is_followed,
		followers_count: state.followers_count + (state.is_followed ? -1 : 1),
	};
}

/** "9.999", e a partir de 10 mil a notação compacta: "12 mil" / "12K". */
export function formatFollowCount(count: number, locale: "pt" | "en"): string {
	const intlLocale = locale === "en" ? "en-US" : "pt-BR";

	if (count < FOLLOW_COUNT_COMPACT_FROM) {
		return new Intl.NumberFormat(intlLocale).format(count);
	}

	return new Intl.NumberFormat(intlLocale, { notation: "compact" }).format(
		count,
	);
}
