import { useTheme } from "next-themes";
import { useLayoutEffect } from "react";

import {
	reapplyPaletteForDisplayMode,
	useThemeStore,
} from "@/stores/theme-store";

/**
 * Mantém variáveis CSS de cor alinhadas ao modo resolvido do next-themes.
 * `applyCompleteTheme` grava cores no estilo inline do `<html>`, que prevalece sobre `.dark { }` no CSS.
 */
export function ThemePaletteSync() {
	const { resolvedTheme } = useTheme();

	useLayoutEffect(() => {
		useThemeStore.getState().hydrate();
		// `resolvedTheme` pode ainda ser undefined no primeiro paint do next-themes
		reapplyPaletteForDisplayMode(
			document.documentElement.classList.contains("dark"),
		);
	}, []);

	useLayoutEffect(() => {
		if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
		reapplyPaletteForDisplayMode(resolvedTheme === "dark");
	}, [resolvedTheme]);

	return null;
}
