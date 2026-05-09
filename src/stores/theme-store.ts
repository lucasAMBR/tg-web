import { create } from "zustand";

import {
	applyCompleteTheme,
	applyFontFamily,
	applyThemeColors,
	type CompleteTheme,
	DEFAULT_FONT_FAMILY,
	DEFAULT_THEME_COLOR,
	extractHueFromOKLCH,
	PRESET_FONTS,
	PRESET_THEMES,
} from "@/lib/theme-colors";

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "vite-ui-theme";
export const THEME_COLOR_STORAGE_KEY = "vite-ui-theme-color";
export const THEME_NAME_STORAGE_KEY = "vite-ui-theme-name";
export const FONT_FAMILY_STORAGE_KEY = "vite-ui-font-family";
export const DEFAULT_THEME: Theme = "dark";

/** Modo claro/escuro efetivo no DOM (next-themes controla a classe em `documentElement`). */
function getResolvedUiIsDark(): boolean {
	if (typeof window === "undefined") return false;
	return window.document.documentElement.classList.contains("dark");
}

/**
 * Reaplica variáveis CSS de cor conforme claro/escuro.
 * Precisa ser chamado quando o modo muda (ex.: next-themes), pois `applyCompleteTheme`
 * define as variáveis no estilo inline do `<html>`, que sobrescreve `.dark { }` no CSS.
 */
export function reapplyPaletteForDisplayMode(isDark: boolean): void {
	const { themeName, themeColor, fontFamily } = useThemeStore.getState();

	if (themeName) {
		const completeTheme = PRESET_THEMES.find((t) => t.name === themeName);
		if (completeTheme) {
			applyCompleteTheme(completeTheme, isDark);
			const selectedFont = PRESET_FONTS.find((f) => f.name === fontFamily);
			if (selectedFont) {
				applyFontFamily(selectedFont);
			}
			return;
		}
	}

	applyThemeColors(themeColor, isDark);
	const selectedFont = PRESET_FONTS.find((f) => f.name === fontFamily);
	if (selectedFont) {
		applyFontFamily(selectedFont);
	}
}

function getStoredThemeColor(storageKey: string, fallback: number): number {
	if (typeof window === "undefined") return fallback;

	const stored = window.localStorage.getItem(storageKey);
	if (stored) {
		const parsed = Number.parseFloat(stored);
		if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 360) {
			return parsed;
		}
	}
	return fallback;
}

function getStoredTheme(storageKey: string, fallback: Theme): Theme {
	if (typeof window === "undefined") return fallback;

	const stored = window.localStorage.getItem(storageKey);
	if (stored === "light" || stored === "dark" || stored === "system") {
		return stored;
	}
	return fallback;
}

function getStoredFontFamily(storageKey: string, fallback: string): string {
	if (typeof window === "undefined") return fallback;

	const stored = window.localStorage.getItem(storageKey);
	if (stored) {
		return stored;
	}
	return fallback;
}

interface ThemeState {
	theme: Theme;
	themeColor: number; // Hue em graus (0-360)
	themeName: string | null; // Nome do tema completo selecionado
	fontFamily: string; // Nome da família de fontes selecionada
}

interface ThemeActions {
	setTheme: (theme: Theme) => void;
	setThemeColor: (hue: number) => void;
	setCompleteTheme: (theme: CompleteTheme) => void;
	setFontFamily: (fontFamilyName: string) => void;
	hydrate: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>((set, get) => ({
	theme: DEFAULT_THEME,
	themeColor: DEFAULT_THEME_COLOR,
	themeName: null,
	fontFamily: DEFAULT_FONT_FAMILY,

	setTheme: (theme) => {
		set({ theme });
		if (typeof window !== "undefined") {
			window.localStorage.setItem(THEME_STORAGE_KEY, theme);
		}
		const isDark = getResolvedUiIsDark();
		const { themeColor, themeName } = get();

		if (themeName) {
			const completeTheme = PRESET_THEMES.find((t) => t.name === themeName);
			if (completeTheme) {
				applyCompleteTheme(completeTheme, isDark);
				return;
			}
		}

		applyThemeColors(themeColor, isDark);
	},

	setThemeColor: (hue) => {
		// Garantir que hue está no range válido
		const clampedHue = Math.max(0, Math.min(360, hue));
		set({ themeColor: clampedHue, themeName: null });
		if (typeof window !== "undefined") {
			window.localStorage.setItem(
				THEME_COLOR_STORAGE_KEY,
				clampedHue.toString(),
			);
			window.localStorage.removeItem(THEME_NAME_STORAGE_KEY);
		}
		applyThemeColors(clampedHue, getResolvedUiIsDark());
	},

	setCompleteTheme: (completeTheme) => {
		const { fontFamily } = get();
		const hue = applyCompleteTheme(completeTheme, getResolvedUiIsDark());

		set({
			themeColor: hue,
			themeName: completeTheme.name,
		});

		if (typeof window !== "undefined") {
			window.localStorage.setItem(THEME_COLOR_STORAGE_KEY, hue.toString());
			window.localStorage.setItem(THEME_NAME_STORAGE_KEY, completeTheme.name);
		}

		const selectedFont = PRESET_FONTS.find((f) => f.name === fontFamily);
		if (selectedFont) {
			applyFontFamily(selectedFont);
		}
	},

	setFontFamily: (fontFamilyName) => {
		const fontFamily = PRESET_FONTS.find((f) => f.name === fontFamilyName);
		if (!fontFamily) return;

		set({ fontFamily: fontFamilyName });
		if (typeof window !== "undefined") {
			window.localStorage.setItem(FONT_FAMILY_STORAGE_KEY, fontFamilyName);
		}
		applyFontFamily(fontFamily);
	},

	hydrate: () => {
		const theme = getStoredTheme(THEME_STORAGE_KEY, DEFAULT_THEME);
		const themeColor = getStoredThemeColor(
			THEME_COLOR_STORAGE_KEY,
			DEFAULT_THEME_COLOR,
		);
		const fontFamily = getStoredFontFamily(
			FONT_FAMILY_STORAGE_KEY,
			DEFAULT_FONT_FAMILY,
		);

		// Verificar se há um tema completo salvo
		let themeName: string | null = null;
		if (typeof window !== "undefined") {
			const stored = window.localStorage.getItem(THEME_NAME_STORAGE_KEY);
			if (stored) {
				themeName = stored;
			}
		}

		// Tentar extrair hue das cores CSS existentes se não houver valor salvo
		let finalThemeColor = themeColor;
		if (themeColor === DEFAULT_THEME_COLOR && typeof window !== "undefined") {
			const root = window.document.documentElement;
			const computedPrimary =
				getComputedStyle(root).getPropertyValue("--primary");
			if (computedPrimary) {
				const extractedHue = extractHueFromOKLCH(computedPrimary);
				if (extractedHue !== DEFAULT_THEME_COLOR) {
					finalThemeColor = extractedHue;
				}
			}
		}

		if (get().theme !== theme) {
			set({ theme });
		}

		if (get().themeColor !== finalThemeColor) {
			set({ themeColor: finalThemeColor });
		}

		if (get().themeName !== themeName) {
			set({ themeName });
		}

		if (get().fontFamily !== fontFamily) {
			set({ fontFamily });
		}

		// Cores: `ThemePaletteSync` + `reapplyPaletteForDisplayMode` após next-themes definir a classe
	},
}));