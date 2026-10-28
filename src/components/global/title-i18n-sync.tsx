import i18n from "@/i18n";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * O `head` das rotas é resolvido durante o load da match, fora do ciclo do React.
 * Sem isso o título ficaria com a chave crua quando o backend do i18next ainda não
 * respondeu, e ficaria no idioma antigo depois de trocar de idioma.
 */
export function TitleI18nSync() {
	const router = useRouter();

	useEffect(() => {
		const revalidateHead = () => {
			router.invalidate();
		};

		i18n.on("languageChanged", revalidateHead);
		i18n.on("loaded", revalidateHead);

		return () => {
			i18n.off("languageChanged", revalidateHead);
			i18n.off("loaded", revalidateHead);
		};
	}, [router]);

	return null;
}
