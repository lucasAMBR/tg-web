import type { UserRole } from "@/types/AuthenticatedUser";

/**
 * O `link` das notificações vem como URL absoluta da API (`APP_URL` mais o
 * caminho do recurso, como `/job-vacancy/{id}`), e não como rota do front. Aqui
 * ele vira a tela certa para o papel de quem recebeu. Caminho desconhecido vai
 * como veio.
 */
export function resolveNotificationRoute(
	link: string | null | undefined,
	type: string,
	role: UserRole | undefined,
): string | null {
	if (!link) return null;

	let pathname: string;

	try {
		pathname = new URL(link, window.location.origin).pathname;
	} catch {
		return null;
	}

	const [resource, id] = pathname.split("/").filter(Boolean);

	switch (resource) {
		case "freelance-job-vacancy":
			if (!id) return "/freelances";

			// A postagem nova abre direto no feed; o resto, no detail do freela
			return type === "freelance_feed_post_created"
				? `/freelances/${id}/feed`
				: `/freelances/${id}`;
		case "job-vacancy":
			if (!id) return null;

			// A empresa abre a vaga como dona; o dev, como candidato
			return role === "company" ? `/my-vacancies/${id}` : `/vacancies/${id}`;
		case "jobs":
			return "/jobs";
		// O backend grava `proficiency-teste`; aceita também a grafia certa
		case "proficiency-teste":
		case "proficiency-test":
			return id ? `/proficiency-test/${id}/start` : null;
		default:
			return pathname;
	}
}
