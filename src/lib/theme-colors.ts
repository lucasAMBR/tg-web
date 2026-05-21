export interface ThemeVariables {
	background: string;
	foreground: string;
	card: string;
	cardForeground: string;
	popover: string;
	popoverForeground: string;
	primary: string;
	primaryForeground: string;
	secondary: string;
	secondaryForeground: string;
	muted: string;
	mutedForeground: string;
	accent: string;
	accentForeground: string;
	destructive: string;
	destructiveForeground: string;
	border: string;
	input: string;
	ring: string;
	chart1: string;
	chart2: string;
	chart3: string;
	chart4: string;
	chart5: string;
	sidebar: string;
	sidebarForeground: string;
	sidebarPrimary: string;
	sidebarPrimaryForeground: string;
	sidebarAccent: string;
	sidebarAccentForeground: string;
	sidebarBorder: string;
	sidebarRing: string;
	fontSans: string;
	fontSerif: string;
	fontMono: string;
	radius: string;
	shadowX: string;
	shadowY: string;
	shadowBlur: string;
	shadowSpread: string;
	shadowOpacity: string;
	shadowColor: string;
	shadow2xs: string;
	shadowXs: string;
	shadowSm: string;
	shadow: string;
	shadowMd: string;
	shadowLg: string;
	shadowXl: string;
	shadow2xl: string;
	trackingNormal: string;
	spacing: string;
}

export interface CompleteTheme {
	name: string;
	light: ThemeVariables;
	dark: ThemeVariables;
	swatches: string[];
}

export interface FontFamily {
	name: string;
	sans: string;
	serif: string;
	mono: string;
}

export const PRESET_FONTS: FontFamily[] = [
	{
		name: "Sistema",
		sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
		serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
		mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	},
	{
		name: "Inter",
		sans: "Inter, sans-serif",
		serif: "Georgia, serif",
		mono: "JetBrains Mono, monospace",
	},
	{
		name: "Geist",
		sans: "Geist Mono, ui-monospace, monospace",
		serif: "serif",
		mono: "JetBrains Mono, monospace",
	},
	{
		name: "Montserrat",
		sans: "Montserrat, sans-serif",
		serif: "Georgia, serif",
		mono: "Fira Code, monospace",
	},
	{
		name: "Roboto",
		sans: "Roboto, sans-serif",
		serif: "Georgia, serif",
		mono: "Roboto Mono, monospace",
	},
	{
		name: "Open Sans",
		sans: "'Open Sans', sans-serif",
		serif: "Georgia, serif",
		mono: "'Fira Code', monospace",
	},
];

export const DEFAULT_FONT_FAMILY = "Sistema";

const DEFAULT_THEME_PROPERTIES = {
	fontSans:
		"ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
	fontSerif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
	fontMono:
		"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	radius: "0.5rem",
	shadowX: "0",
	shadowY: "1px",
	shadowBlur: "3px",
	shadowSpread: "0px",
	shadowOpacity: "0.1",
	shadowColor: "oklch(0 0 0)",
	shadow2xs: "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
	shadowXs: "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
	shadowSm:
		"0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
	shadow:
		"0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
	shadowMd:
		"0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)",
	shadowLg:
		"0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)",
	shadowXl:
		"0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)",
	shadow2xl: "0 1px 3px 0px hsl(0 0% 0% / 0.25)",
	trackingNormal: "0em",
	spacing: "0.25rem",
} as const;

const DEFAULT_FONT_PROPERTIES = {
	fontSans: DEFAULT_THEME_PROPERTIES.fontSans,
	fontSerif: DEFAULT_THEME_PROPERTIES.fontSerif,
	fontMono: DEFAULT_THEME_PROPERTIES.fontMono,
} as const;

export const PRESET_THEMES: CompleteTheme[] = [
	{
		name: "Brew (Default)",
		light: {
			background: "oklch(0.9821 0 0)",
			foreground: "oklch(0.2435 0 0)",
			card: "oklch(0.9911 0 0)",
			cardForeground: "oklch(0.2435 0 0)",
			popover: "oklch(0.9911 0 0)",
			popoverForeground: "oklch(0.2435 0 0)",
			primary: "oklch(0.3682 0.0316 42.8244)",
			primaryForeground: "oklch(1.0000 0 0)",
			secondary: "oklch(0.6084 0.0374 75.7155)",
			secondaryForeground: "oklch(1.0000 0 0)",
			muted: "oklch(0.9521 0 0)",
			mutedForeground: "oklch(0.5032 0 0)",
			accent: "oklch(0.9310 0 0)",
			accentForeground: "oklch(0.2435 0 0)",
			destructive: "oklch(0.6271 0.1936 33.3390)",
			destructiveForeground: "oklch(1.0000 0 0)",
			border: "oklch(0.8822 0 0)",
			input: "oklch(78.577% 0.00009 271.152)",
			ring: "oklch(0.4341 0.0392 41.9938)",
			chart1: "oklch(0.4341 0.0392 41.9938)",
			chart2: "oklch(0.9200 0.0651 74.3695)",
			chart3: "oklch(0.9310 0 0)",
			chart4: "oklch(0.9367 0.0523 75.5009)",
			chart5: "oklch(0.4338 0.0437 41.6746)",
			sidebar: "oklch(0.9881 0 0)",
			sidebarForeground: "oklch(0.2645 0 0)",
			sidebarPrimary: "oklch(0.3250 0 0)",
			sidebarPrimaryForeground: "oklch(0.9881 0 0)",
			sidebarAccent: "oklch(0.9761 0 0)",
			sidebarAccentForeground: "oklch(0.3250 0 0)",
			sidebarBorder: "oklch(0.9401 0 0)",
			sidebarRing: "oklch(0.7731 0 0)",
			...DEFAULT_THEME_PROPERTIES,
		},
		dark: {
			background: "oklch(0.2500 0 0)",
			foreground: "oklch(0.9491 0 0)",
			card: "oklch(0.2134 0 0)",
			cardForeground: "oklch(0.9491 0 0)",
			popover: "oklch(0.2134 0 0)",
			popoverForeground: "oklch(0.9491 0 0)",
			primary: "oklch(72.037% 0.10143 64.511)",
			primaryForeground: "oklch(0.2181 0.0041 84.5884)",
			secondary: "oklch(0.3163 0.0190 63.6992)",
			secondaryForeground: "oklch(0.9247 0.0524 66.1732)",
			muted: "oklch(0.2520 0 0)",
			mutedForeground: "oklch(0.7699 0 0)",
			accent: "oklch(0.2850 0 0)",
			accentForeground: "oklch(0.9491 0 0)",
			destructive: "oklch(0.6271 0.1936 33.3390)",
			destructiveForeground: "oklch(1.0000 0 0)",
			border: "oklch(35.197% 0.01208 93.806)",
			input: "oklch(40.167% 0.00005 271.152)",
			ring: "oklch(0.9247 0.0524 66.1732)",
			chart1: "oklch(0.9247 0.0524 66.1732)",
			chart2: "oklch(0.3163 0.0190 63.6992)",
			chart3: "oklch(0.2850 0 0)",
			chart4: "oklch(0.3481 0.0219 67.0001)",
			chart5: "oklch(0.9245 0.0533 67.0855)",
			sidebar: "oklch(0.2103 0.0059 285.8852)",
			sidebarForeground: "oklch(0.9674 0.0013 286.3752)",
			sidebarPrimary: "oklch(0.4882 0.2172 264.3763)",
			sidebarPrimaryForeground: "oklch(1.0000 0 0)",
			sidebarAccent: "oklch(0.2739 0.0055 286.0326)",
			sidebarAccentForeground: "oklch(0.9674 0.0013 286.3752)",
			sidebarBorder: "oklch(0.2739 0.0055 286.0326)",
			sidebarRing: "oklch(0.8711 0.0055 286.2860)",
			...DEFAULT_THEME_PROPERTIES,
		},
		swatches: [
			"oklch(0.3682 0.0316 42.8244)",
			"oklch(0.9821 0 0)",
			"oklch(0.6084 0.0374 75.7155)",
			"oklch(0.2435 0 0)",
		],
	},
	{
		name: "Tangerine",
		light: {
			background: "oklch(0.9383 0.0042 236.4993)",
			foreground: "oklch(0.3211 0 0)",
			card: "oklch(1.0000 0 0)",
			cardForeground: "oklch(0.3211 0 0)",
			popover: "oklch(1.0000 0 0)",
			popoverForeground: "oklch(0.3211 0 0)",
			primary: "oklch(0.6397 0.1720 36.4421)",
			primaryForeground: "oklch(1.0000 0 0)",
			secondary: "oklch(0.9670 0.0029 264.5419)",
			secondaryForeground: "oklch(0.4461 0.0263 256.8018)",
			muted: "oklch(0.9846 0.0017 247.8389)",
			mutedForeground: "oklch(0.5510 0.0234 264.3637)",
			accent: "oklch(0.9119 0.0222 243.8174)",
			accentForeground: "oklch(0.3791 0.1378 265.5222)",
			destructive: "oklch(0.6368 0.2078 25.3313)",
			destructiveForeground: "oklch(1.0000 0 0)",
			border: "oklch(0.9022 0.0052 247.8822)",
			input: "oklch(0.9700 0.0029 264.5420)",
			ring: "oklch(0.6397 0.1720 36.4421)",
			chart1: "oklch(0.7156 0.0605 248.6845)",
			chart2: "oklch(0.7875 0.0917 35.9616)",
			chart3: "oklch(0.5778 0.0759 254.1573)",
			chart4: "oklch(0.5016 0.0849 259.4902)",
			chart5: "oklch(0.4241 0.0952 264.0306)",
			sidebar: "oklch(0.9030 0.0046 258.3257)",
			sidebarForeground: "oklch(0.3211 0 0)",
			sidebarPrimary: "oklch(0.6397 0.1720 36.4421)",
			sidebarPrimaryForeground: "oklch(1.0000 0 0)",
			sidebarAccent: "oklch(0.9119 0.0222 243.8174)",
			sidebarAccentForeground: "oklch(0.3791 0.1378 265.5222)",
			sidebarBorder: "oklch(0.9276 0.0058 264.5313)",
			sidebarRing: "oklch(0.6397 0.1720 36.4421)",
			radius: "0.75rem",
			shadowX: "0px",
			shadowY: "1px",
			shadowBlur: "3px",
			shadowSpread: "0px",
			shadowOpacity: "0.1",
			shadowColor: "hsl(0 0% 0%)",
			shadow2xs: "0px 1px 3px 0px hsl(0 0% 0% / 0.05)",
			shadowXs: "0px 1px 3px 0px hsl(0 0% 0% / 0.05)",
			shadowSm:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)",
			shadow:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)",
			shadowMd:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10)",
			shadowLg:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10)",
			shadowXl:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10)",
			shadow2xl: "0px 1px 3px 0px hsl(0 0% 0% / 0.25)",
			trackingNormal: "0em",
			spacing: "0.25rem",
			...DEFAULT_FONT_PROPERTIES,
		},
		dark: {
			background: "oklch(0.2598 0.0306 262.6666)",
			foreground: "oklch(0.9219 0 0)",
			card: "oklch(0.3106 0.0301 268.6365)",
			cardForeground: "oklch(0.9219 0 0)",
			popover: "oklch(0.2900 0.0249 268.3986)",
			popoverForeground: "oklch(0.9219 0 0)",
			primary: "oklch(0.6397 0.1720 36.4421)",
			primaryForeground: "oklch(1.0000 0 0)",
			secondary: "oklch(0.3095 0.0266 266.7132)",
			secondaryForeground: "oklch(0.9219 0 0)",
			muted: "oklch(0.3095 0.0266 266.7132)",
			mutedForeground: "oklch(0.7155 0 0)",
			accent: "oklch(0.3380 0.0589 267.5867)",
			accentForeground: "oklch(0.8823 0.0571 254.1284)",
			destructive: "oklch(0.6368 0.2078 25.3313)",
			destructiveForeground: "oklch(1.0000 0 0)",
			border: "oklch(0.3843 0.0301 269.7337)",
			input: "oklch(0.3843 0.0301 269.7337)",
			ring: "oklch(0.6397 0.1720 36.4421)",
			chart1: "oklch(0.7156 0.0605 248.6845)",
			chart2: "oklch(0.7693 0.0876 34.1875)",
			chart3: "oklch(0.5778 0.0759 254.1573)",
			chart4: "oklch(0.5016 0.0849 259.4902)",
			chart5: "oklch(0.4241 0.0952 264.0306)",
			sidebar: "oklch(0.3100 0.0283 267.7408)",
			sidebarForeground: "oklch(0.9219 0 0)",
			sidebarPrimary: "oklch(0.6397 0.1720 36.4421)",
			sidebarPrimaryForeground: "oklch(1.0000 0 0)",
			sidebarAccent: "oklch(0.3380 0.0589 267.5867)",
			sidebarAccentForeground: "oklch(0.8823 0.0571 254.1284)",
			sidebarBorder: "oklch(0.3843 0.0301 269.7337)",
			sidebarRing: "oklch(0.6397 0.1720 36.4421)",
			radius: "0.75rem",
			shadowX: "0px",
			shadowY: "1px",
			shadowBlur: "3px",
			shadowSpread: "0px",
			shadowOpacity: "0.1",
			shadowColor: "hsl(0 0% 0%)",
			shadow2xs: "0px 1px 3px 0px hsl(0 0% 0% / 0.05)",
			shadowXs: "0px 1px 3px 0px hsl(0 0% 0% / 0.05)",
			shadowSm:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)",
			shadow:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)",
			shadowMd:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10)",
			shadowLg:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10)",
			shadowXl:
				"0px 1px 3px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10)",
			shadow2xl: "0px 1px 3px 0px hsl(0 0% 0% / 0.25)",
			trackingNormal: "0em",
			spacing: "0.25rem",
			...DEFAULT_FONT_PROPERTIES,
		},
		swatches: [
			"oklch(0.6397 0.1720 36.4421)",
			"oklch(0.9383 0.0042 236.4993)",
			"oklch(0.9119 0.0222 243.8174)",
			"oklch(0.3211 0 0)",
		],
	},
	{
		name: "Darkmatter",
		light: {
			background: "oklch(1.0000 0 0)",
			foreground: "oklch(0.2101 0.0318 264.6645)",
			card: "oklch(1.0000 0 0)",
			cardForeground: "oklch(0.2101 0.0318 264.6645)",
			popover: "oklch(1.0000 0 0)",
			popoverForeground: "oklch(0.2101 0.0318 264.6645)",
			primary: "oklch(0.6716 0.1368 48.5130)",
			primaryForeground: "oklch(1.0000 0 0)",
			secondary: "oklch(0.5360 0.0398 196.0280)",
			secondaryForeground: "oklch(1.0000 0 0)",
			muted: "oklch(0.9670 0.0029 264.5419)",
			mutedForeground: "oklch(0.5510 0.0234 264.3637)",
			accent: "oklch(0.9491 0 0)",
			accentForeground: "oklch(0.2101 0.0318 264.6645)",
			destructive: "oklch(0.6368 0.2078 25.3313)",
			destructiveForeground: "oklch(0.9851 0 0)",
			border: "oklch(0.9276 0.0058 264.5313)",
			input: "oklch(0.9276 0.0058 264.5313)",
			ring: "oklch(0.6716 0.1368 48.5130)",
			chart1: "oklch(0.5940 0.0443 196.0233)",
			chart2: "oklch(0.7214 0.1337 49.9802)",
			chart3: "oklch(0.8721 0.0864 68.5474)",
			chart4: "oklch(0.6268 0 0)",
			chart5: "oklch(0.6830 0 0)",
			sidebar: "oklch(0.9670 0.0029 264.5419)",
			sidebarForeground: "oklch(0.2101 0.0318 264.6645)",
			sidebarPrimary: "oklch(0.6716 0.1368 48.5130)",
			sidebarPrimaryForeground: "oklch(1.0000 0 0)",
			sidebarAccent: "oklch(1.0000 0 0)",
			sidebarAccentForeground: "oklch(0.2101 0.0318 264.6645)",
			sidebarBorder: "oklch(0.9276 0.0058 264.5313)",
			sidebarRing: "oklch(0.6716 0.1368 48.5130)",
			radius: "0.75rem",
			shadowX: "0px",
			shadowY: "1px",
			shadowBlur: "4px",
			shadowSpread: "0px",
			shadowOpacity: "0.05",
			shadowColor: "#000000",
			shadow2xs: "0px 1px 4px 0px hsl(0 0% 0% / 0.03)",
			shadowXs: "0px 1px 4px 0px hsl(0 0% 0% / 0.03)",
			shadowSm:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)",
			shadow:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)",
			shadowMd:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 2px 4px -1px hsl(0 0% 0% / 0.05)",
			shadowLg:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 4px 6px -1px hsl(0 0% 0% / 0.05)",
			shadowXl:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 8px 10px -1px hsl(0 0% 0% / 0.05)",
			shadow2xl: "0px 1px 4px 0px hsl(0 0% 0% / 0.13)",
			trackingNormal: "0rem",
			spacing: "0.25rem",
			...DEFAULT_FONT_PROPERTIES,
		},
		dark: {
			background: "oklch(0.1797 0.0043 308.1928)",
			foreground: "oklch(0.8109 0 0)",
			card: "oklch(0.1822 0 0)",
			cardForeground: "oklch(0.8109 0 0)",
			popover: "oklch(0.1797 0.0043 308.1928)",
			popoverForeground: "oklch(0.8109 0 0)",
			primary: "oklch(0.7214 0.1337 49.9802)",
			primaryForeground: "oklch(0.1797 0.0043 308.1928)",
			secondary: "oklch(0.5940 0.0443 196.0233)",
			secondaryForeground: "oklch(0.1797 0.0043 308.1928)",
			muted: "oklch(0.2520 0 0)",
			mutedForeground: "oklch(0.6268 0 0)",
			accent: "oklch(0.3211 0 0)",
			accentForeground: "oklch(0.8109 0 0)",
			destructive: "oklch(0.5940 0.0443 196.0233)",
			destructiveForeground: "oklch(0.1797 0.0043 308.1928)",
			border: "oklch(0.2520 0 0)",
			input: "oklch(0.2520 0 0)",
			ring: "oklch(0.7214 0.1337 49.9802)",
			chart1: "oklch(0.5940 0.0443 196.0233)",
			chart2: "oklch(0.7214 0.1337 49.9802)",
			chart3: "oklch(0.8721 0.0864 68.5474)",
			chart4: "oklch(0.6268 0 0)",
			chart5: "oklch(0.6830 0 0)",
			sidebar: "oklch(0.1822 0 0)",
			sidebarForeground: "oklch(0.8109 0 0)",
			sidebarPrimary: "oklch(0.7214 0.1337 49.9802)",
			sidebarPrimaryForeground: "oklch(0.1797 0.0043 308.1928)",
			sidebarAccent: "oklch(0.3211 0 0)",
			sidebarAccentForeground: "oklch(0.8109 0 0)",
			sidebarBorder: "oklch(0.2520 0 0)",
			sidebarRing: "oklch(0.7214 0.1337 49.9802)",
			radius: "0.75rem",
			shadowX: "0px",
			shadowY: "1px",
			shadowBlur: "4px",
			shadowSpread: "0px",
			shadowOpacity: "0.05",
			shadowColor: "#000000",
			shadow2xs: "0px 1px 4px 0px hsl(0 0% 0% / 0.03)",
			shadowXs: "0px 1px 4px 0px hsl(0 0% 0% / 0.03)",
			shadowSm:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)",
			shadow:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)",
			shadowMd:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 2px 4px -1px hsl(0 0% 0% / 0.05)",
			shadowLg:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 4px 6px -1px hsl(0 0% 0% / 0.05)",
			shadowXl:
				"0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 8px 10px -1px hsl(0 0% 0% / 0.05)",
			shadow2xl: "0px 1px 4px 0px hsl(0 0% 0% / 0.13)",
			trackingNormal: "0rem",
			spacing: "0.25rem",
			...DEFAULT_FONT_PROPERTIES,
		},
		swatches: [
			"oklch(0.6716 0.1368 48.5130)",
			"oklch(0.1797 0.0043 308.1928)",
			"oklch(0.5360 0.0398 196.0233)",
			"oklch(0.2101 0.0318 264.6645)",
		],
	},
	{
		name: "Graphite",
		light: {
			background: "oklch(0.9551 0 0)",
			foreground: "oklch(0.3211 0 0)",
			card: "oklch(0.9702 0 0)",
			cardForeground: "oklch(0.3211 0 0)",
			popover: "oklch(0.9702 0 0)",
			popoverForeground: "oklch(0.3211 0 0)",
			primary: "oklch(0.4891 0 0)",
			primaryForeground: "oklch(1.0000 0 0)",
			secondary: "oklch(0.9067 0 0)",
			secondaryForeground: "oklch(0.3211 0 0)",
			muted: "oklch(0.8853 0 0)",
			mutedForeground: "oklch(0.5103 0 0)",
			accent: "oklch(0.8078 0 0)",
			accentForeground: "oklch(0.3211 0 0)",
			destructive: "oklch(0.5594 0.1900 25.8625)",
			destructiveForeground: "oklch(1.0000 0 0)",
			border: "oklch(0.8576 0 0)",
			input: "oklch(0.9067 0 0)",
			ring: "oklch(0.4891 0 0)",
			chart1: "oklch(0.4891 0 0)",
			chart2: "oklch(0.4863 0.0361 196.0278)",
			chart3: "oklch(0.6534 0 0)",
			chart4: "oklch(0.7316 0 0)",
			chart5: "oklch(0.8078 0 0)",
			sidebar: "oklch(0.9370 0 0)",
			sidebarForeground: "oklch(0.3211 0 0)",
			sidebarPrimary: "oklch(0.4891 0 0)",
			sidebarPrimaryForeground: "oklch(1.0000 0 0)",
			sidebarAccent: "oklch(0.8078 0 0)",
			sidebarAccentForeground: "oklch(0.3211 0 0)",
			sidebarBorder: "oklch(0.8576 0 0)",
			sidebarRing: "oklch(0.4891 0 0)",
			radius: "0.35rem",
			shadowX: "0px",
			shadowY: "2px",
			shadowBlur: "0px",
			shadowSpread: "0px",
			shadowOpacity: "0.15",
			shadowColor: "hsl(0 0% 20% / 0.1)",
			shadow2xs: "0px 2px 0px 0px hsl(0 0% 20% / 0.07)",
			shadowXs: "0px 2px 0px 0px hsl(0 0% 20% / 0.07)",
			shadowSm:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 1px 2px -1px hsl(0 0% 20% / 0.15)",
			shadow:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 1px 2px -1px hsl(0 0% 20% / 0.15)",
			shadowMd:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 2px 4px -1px hsl(0 0% 20% / 0.15)",
			shadowLg:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 4px 6px -1px hsl(0 0% 20% / 0.15)",
			shadowXl:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 8px 10px -1px hsl(0 0% 20% / 0.15)",
			shadow2xl: "0px 2px 0px 0px hsl(0 0% 20% / 0.38)",
			trackingNormal: "0em",
			spacing: "0.25rem",
			...DEFAULT_FONT_PROPERTIES,
		},
		dark: {
			background: "oklch(0.2178 0 0)",
			foreground: "oklch(0.8853 0 0)",
			card: "oklch(0.2435 0 0)",
			cardForeground: "oklch(0.8853 0 0)",
			popover: "oklch(0.2435 0 0)",
			popoverForeground: "oklch(0.8853 0 0)",
			primary: "oklch(0.7058 0 0)",
			primaryForeground: "oklch(0.2178 0 0)",
			secondary: "oklch(0.3092 0 0)",
			secondaryForeground: "oklch(0.8853 0 0)",
			muted: "oklch(0.2850 0 0)",
			mutedForeground: "oklch(0.5999 0 0)",
			accent: "oklch(0.3715 0 0)",
			accentForeground: "oklch(0.8853 0 0)",
			destructive: "oklch(0.6591 0.1530 22.1703)",
			destructiveForeground: "oklch(1.0000 0 0)",
			border: "oklch(0.3290 0 0)",
			input: "oklch(0.3092 0 0)",
			ring: "oklch(0.7058 0 0)",
			chart1: "oklch(0.7058 0 0)",
			chart2: "oklch(0.6714 0.0339 206.3482)",
			chart3: "oklch(0.5452 0 0)",
			chart4: "oklch(0.4604 0 0)",
			chart5: "oklch(0.3715 0 0)",
			sidebar: "oklch(0.2393 0 0)",
			sidebarForeground: "oklch(0.8853 0 0)",
			sidebarPrimary: "oklch(0.7058 0 0)",
			sidebarPrimaryForeground: "oklch(0.2178 0 0)",
			sidebarAccent: "oklch(0.3715 0 0)",
			sidebarAccentForeground: "oklch(0.8853 0 0)",
			sidebarBorder: "oklch(0.3290 0 0)",
			sidebarRing: "oklch(0.7058 0 0)",
			radius: "0.35rem",
			shadowX: "0px",
			shadowY: "2px",
			shadowBlur: "0px",
			shadowSpread: "0px",
			shadowOpacity: "0.15",
			shadowColor: "hsl(0 0% 20% / 0.1)",
			shadow2xs: "0px 2px 0px 0px hsl(0 0% 20% / 0.07)",
			shadowXs: "0px 2px 0px 0px hsl(0 0% 20% / 0.07)",
			shadowSm:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 1px 2px -1px hsl(0 0% 20% / 0.15)",
			shadow:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 1px 2px -1px hsl(0 0% 20% / 0.15)",
			shadowMd:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 2px 4px -1px hsl(0 0% 20% / 0.15)",
			shadowLg:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 4px 6px -1px hsl(0 0% 20% / 0.15)",
			shadowXl:
				"0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 8px 10px -1px hsl(0 0% 20% / 0.15)",
			shadow2xl: "0px 2px 0px 0px hsl(0 0% 20% / 0.38)",
			trackingNormal: "0em",
			spacing: "0.25rem",
			...DEFAULT_FONT_PROPERTIES,
		},
		swatches: [
			"oklch(0.4891 0 0)",
			"oklch(0.9551 0 0)",
			"oklch(0.7058 0 0)",
			"oklch(0.3211 0 0)",
		],
	},
	{
        name: "Vanguard",
        light: {
            ...DEFAULT_THEME_PROPERTIES,
            background: "oklch(1 0 0)",
            foreground: "oklch(0.145 0 0)",
            card: "oklch(1 0 0)",
            cardForeground: "oklch(0.145 0 0)",
            popover: "oklch(1 0 0)",
            popoverForeground: "oklch(0.145 0 0)",
            primary: "oklch(0.531 0.218 29.234)",
            primaryForeground: "oklch(1 0.001 0)",
            secondary: "oklch(0.97 0 0)",
            secondaryForeground: "oklch(0.205 0 0)",
            muted: "oklch(0.97 0 0)",
            mutedForeground: "oklch(0.556 0 0)",
            accent: "oklch(0.97 0 0)",
            accentForeground: "oklch(0.205 0 0)",
            destructive: "oklch(0.577 0.245 27.325)",
            destructiveForeground: "oklch(1 0 0)",
            border: "oklch(0.922 0 0)",
            input: "oklch(0.922 0 0)",
            ring: "oklch(0.708 0 0)",
            chart1: "oklch(0.646 0.222 41.116)",
            chart2: "oklch(0.6 0.118 184.704)",
            chart3: "oklch(0.398 0.07 227.392)",
            chart4: "oklch(0.828 0.189 84.429)",
            chart5: "oklch(0.769 0.188 70.08)",
            sidebar: "oklch(0.985 0 0)",
            sidebarForeground: "oklch(0.145 0 0)",
            sidebarPrimary: "oklch(0.205 0 0)",
            sidebarPrimaryForeground: "oklch(0.985 0 0)",
            sidebarAccent: "oklch(0.97 0 0)",
            sidebarAccentForeground: "oklch(0.205 0 0)",
            sidebarBorder: "oklch(0.922 0 0)",
            sidebarRing: "oklch(0.708 0 0)",
            fontSans: "'Inter', system-ui, -apple-system, sans-serif",
            fontSerif: "'Playfair Display', Georgia, serif",
            fontMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            radius: "1.5rem",
        },
        dark: {
            ...DEFAULT_THEME_PROPERTIES,
            background: "oklch(0.145 0 0)",
            foreground: "oklch(0.985 0 0)",
            card: "oklch(0.205 0 0)",
            cardForeground: "oklch(0.985 0 0)",
            popover: "oklch(0.269 0 0)",
            popoverForeground: "oklch(0.985 0 0)",
            primary: "oklch(0.531 0.218 29.234)",
            primaryForeground: "oklch(1 0.001 0)",
            secondary: "oklch(0.269 0 0)",
            secondaryForeground: "oklch(0.985 0 0)",
            muted: "oklch(0.269 0 0)",
            mutedForeground: "oklch(0.708 0 0)",
            accent: "oklch(0.371 0 0)",
            accentForeground: "oklch(0.985 0 0)",
            destructive: "oklch(0.704 0.191 22.216)",
            destructiveForeground: "oklch(1 0 0)",
            border: "oklch(1 0 0 / 0.10)",
            input: "oklch(1 0 0 / 0.15)",
            ring: "oklch(0.556 0 0)",
            chart1: "oklch(0.488 0.243 264.376)",
            chart2: "oklch(0.696 0.17 162.48)",
            chart3: "oklch(0.769 0.188 70.08)",
            chart4: "oklch(0.627 0.265 303.9)",
            chart5: "oklch(0.645 0.246 16.439)",
            sidebar: "oklch(0.205 0 0)",
            sidebarForeground: "oklch(0.985 0 0)",
            sidebarPrimary: "oklch(0.488 0.243 264.376)",
            sidebarPrimaryForeground: "oklch(0.985 0 0)",
            sidebarAccent: "oklch(0.269 0 0)",
            sidebarAccentForeground: "oklch(0.985 0 0)",
            sidebarBorder: "oklch(1 0 0 / 0.10)",
            sidebarRing: "oklch(0.439 0 0)",
            fontSans: "'Inter', system-ui, -apple-system, sans-serif",
            fontSerif: "'Playfair Display', Georgia, serif",
            fontMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            radius: "1.5rem",
        },
        swatches: [
            "oklch(0.531 0.218 29.234)",
            "oklch(1 0 0)",
            "oklch(0.97 0 0)",
            "oklch(0.145 0 0)",
        ],
    },
	{
        name: "Netrunner",
        light: {
            ...DEFAULT_THEME_PROPERTIES,
            background: "oklch(0.9816 0.0017 247.8390)",
            foreground: "oklch(0.1649 0.0352 281.8285)",
            card: "oklch(1.0000 0 0)",
            cardForeground: "oklch(0.1649 0.0352 281.8285)",
            popover: "oklch(1.0000 0 0)",
            popoverForeground: "oklch(0.1649 0.0352 281.8285)",
            primary: "oklch(0.6726 0.2904 341.4084)",
            primaryForeground: "oklch(1.0000 0 0)",
            secondary: "oklch(0.9595 0.0200 286.0164)",
            secondaryForeground: "oklch(0.1649 0.0352 281.8285)",
            muted: "oklch(0.9595 0.0200 286.0164)",
            mutedForeground: "oklch(0.1649 0.0352 281.8285)",
            accent: "oklch(0.8903 0.1739 171.2690)",
            accentForeground: "oklch(0.1649 0.0352 281.8285)",
            destructive: "oklch(0.6535 0.2348 34.0370)",
            destructiveForeground: "oklch(1.0000 0 0)",
            border: "oklch(0.9205 0.0086 225.0878)",
            input: "oklch(0.9205 0.0086 225.0878)",
            ring: "oklch(0.6726 0.2904 341.4084)",
            chart1: "oklch(0.6726 0.2904 341.4084)",
            chart2: "oklch(0.5488 0.2944 299.0954)",
            chart3: "oklch(0.8442 0.1457 209.2851)",
            chart4: "oklch(0.8903 0.1739 171.2690)",
            chart5: "oklch(0.9168 0.1915 101.4070)",
            sidebar: "oklch(0.9595 0.0200 286.0164)",
            sidebarForeground: "oklch(0.1649 0.0352 281.8285)",
            sidebarPrimary: "oklch(0.6726 0.2904 341.4084)",
            sidebarPrimaryForeground: "oklch(1.0000 0 0)",
            sidebarAccent: "oklch(0.8903 0.1739 171.2690)",
            sidebarAccentForeground: "oklch(0.1649 0.0352 281.8285)",
            sidebarBorder: "oklch(0.9205 0.0086 225.0878)",
            sidebarRing: "oklch(0.6726 0.2904 341.4084)",
            fontSans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
            fontSerif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            fontMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            radius: "0.625rem",
        },
        dark: {
            ...DEFAULT_THEME_PROPERTIES,
            background: "oklch(0.1649 0.0352 281.8285)",
            foreground: "oklch(0.9513 0.0074 260.7315)",
            card: "oklch(0.2542 0.0611 281.1423)",
            cardForeground: "oklch(0.9513 0.0074 260.7315)",
            popover: "oklch(0.2542 0.0611 281.1423)",
            popoverForeground: "oklch(0.9513 0.0074 260.7315)",
            primary: "oklch(0.6726 0.2904 341.4084)",
            primaryForeground: "oklch(1.0000 0 0)",
            secondary: "oklch(0.2542 0.0611 281.1423)",
            secondaryForeground: "oklch(0.9513 0.0074 260.7315)",
            muted: "oklch(0.2123 0.0522 280.9917)",
            mutedForeground: "oklch(0.6245 0.0500 278.1046)",
            accent: "oklch(0.8903 0.1739 171.2690)",
            accentForeground: "oklch(0.1649 0.0352 281.8285)",
            destructive: "oklch(0.6535 0.2348 34.0370)",
            destructiveForeground: "oklch(1.0000 0 0)",
            border: "oklch(0.3279 0.0832 280.7890)",
            input: "oklch(0.3279 0.0832 280.7890)",
            ring: "oklch(0.6726 0.2904 341.4084)",
            chart1: "oklch(0.6726 0.2904 341.4084)",
            chart2: "oklch(0.5488 0.2944 299.0954)",
            chart3: "oklch(0.8442 0.1457 209.2851)",
            chart4: "oklch(0.8903 0.1739 171.2690)",
            chart5: "oklch(0.9168 0.1915 101.4070)",
            sidebar: "oklch(0.1649 0.0352 281.8285)",
            sidebarForeground: "oklch(0.9513 0.0074 260.7315)",
            sidebarPrimary: "oklch(0.6726 0.2904 341.4084)",
            sidebarPrimaryForeground: "oklch(1.0000 0 0)",
            sidebarAccent: "oklch(0.8903 0.1739 171.2690)",
            sidebarAccentForeground: "oklch(0.1649 0.0352 281.8285)",
            sidebarBorder: "oklch(0.3279 0.0832 280.7890)",
            sidebarRing: "oklch(0.6726 0.2904 341.4084)",
            fontSans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
            fontSerif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            fontMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            radius: "0.625rem",
        },
        swatches: [
            "oklch(0.6726 0.2904 341.4084)", // Primary (Neon Pink)
            "oklch(0.8903 0.1739 171.2690)", // Accent (Cyan)
            "oklch(0.1649 0.0352 281.8285)", // Background (Dark Purple)
            "oklch(0.9816 0.0017 247.8390)", // Light Background
        ],
    }, 
	{
        name: "Cipher",
        light: {
            ...DEFAULT_THEME_PROPERTIES,
            background: "oklch(0.9813 0.0100 238.5069)",
            foreground: "oklch(0.1807 0.0207 239.8394)",
            card: "oklch(1.0000 0 0)",
            cardForeground: "oklch(0.1807 0.0207 239.8394)",
            popover: "oklch(1.0000 0 0)",
            popoverForeground: "oklch(0.1807 0.0207 239.8394)",
            primary: "oklch(0.6236 0.1833 147.4139)",
            primaryForeground: "oklch(0.9813 0.0100 238.5069)",
            secondary: "oklch(0.9396 0.0204 243.4220)",
            secondaryForeground: "oklch(0.2791 0.0203 242.6079)",
            muted: "oklch(0.9396 0.0204 243.4220)",
            mutedForeground: "oklch(0.4501 0.0191 239.4931)",
            accent: "oklch(0.6999 0.1796 150.1066)",
            accentForeground: "oklch(0.9813 0.0100 238.5069)",
            destructive: "oklch(0.6207 0.2306 24.9164)",
            destructiveForeground: "oklch(0.9813 0.0100 238.5069)",
            border: "oklch(0.8999 0.0196 240.7516)",
            input: "oklch(0.8999 0.0196 240.7516)",
            ring: "oklch(0.6236 0.1833 147.4139)",
            chart1: "oklch(0.6236 0.1833 147.4139)",
            chart2: "oklch(0.6004 0.1694 249.8812)",
            chart3: "oklch(0.6818 0.1924 45.7782)",
            chart4: "oklch(0.6396 0.2105 300.0543)",
            chart5: "oklch(0.6491 0.2201 19.8586)",
            sidebar: "oklch(0.9813 0.0100 238.5069)",
            sidebarForeground: "oklch(0.1807 0.0207 239.8394)",
            sidebarPrimary: "oklch(0.6236 0.1833 147.4139)",
            sidebarPrimaryForeground: "oklch(0.9813 0.0100 238.5069)",
            sidebarAccent: "oklch(0.6999 0.1796 150.1066)",
            sidebarAccentForeground: "oklch(0.9813 0.0100 238.5069)",
            sidebarBorder: "oklch(0.8999 0.0196 240.7516)",
            sidebarRing: "oklch(0.6236 0.1833 147.4139)",
            fontSans: "'Space Grotesk', ui-sans-serif, sans-serif, system-ui",
            fontSerif: "'PT Serif', ui-serif, serif",
            fontMono: "'Space Mono', ui-monospace, monospace",
            radius: "0.75rem",
            shadowX: "0",
            shadowY: "1px",
            shadowBlur: "3px",
            shadowSpread: "0px",
            shadowOpacity: "0.1",
            shadowColor: "oklch(0 0 0)",
            shadow2xs: "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
            shadowXs: "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
            shadowSm: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
            shadow: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
            shadowMd: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)",
            shadowLg: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)",
            shadowXl: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)",
            shadow2xl: "0 1px 3px 0px hsl(0 0% 0% / 0.25)",
        },
        dark: {
            ...DEFAULT_THEME_PROPERTIES,
            background: "oklch(0.1289 0.0199 238.9108)",
            foreground: "oklch(0.9513 0.0101 238.5127)",
            card: "oklch(0.1807 0.0207 239.8394)",
            cardForeground: "oklch(0.9513 0.0101 238.5127)",
            popover: "oklch(0.1807 0.0207 239.8394)",
            popoverForeground: "oklch(0.9513 0.0101 238.5127)",
            primary: "oklch(0.7007 0.1804 148.9872)",
            primaryForeground: "oklch(0.1004 0.0209 233.5083)",
            secondary: "oklch(0.2414 0.0196 239.1401)",
            secondaryForeground: "oklch(0.9513 0.0101 238.5127)",
            muted: "oklch(0.2414 0.0196 239.1401)",
            mutedForeground: "oklch(0.6499 0.0194 240.1577)",
            accent: "oklch(0.7211 0.1805 150.0521)",
            accentForeground: "oklch(0.1004 0.0209 233.5083)",
            destructive: "oklch(0.6207 0.2306 24.9164)",
            destructiveForeground: "oklch(0.9813 0.0100 238.5069)",
            border: "oklch(0.2791 0.0203 242.6079)",
            input: "oklch(0.2791 0.0203 242.6079)",
            ring: "oklch(0.7007 0.1804 148.9872)",
            chart1: "oklch(0.7007 0.1804 148.9872)",
            chart2: "oklch(0.6798 0.1703 250.1921)",
            chart3: "oklch(0.7309 0.1840 51.3191)",
            chart4: "oklch(0.6928 0.1956 302.0666)",
            chart5: "oklch(0.6899 0.2008 18.6316)",
            sidebar: "oklch(0.2050 0 0)",
            sidebarForeground: "oklch(0.9850 0 0)",
            sidebarPrimary: "oklch(0.4880 0.2430 264.3760)",
            sidebarPrimaryForeground: "oklch(0.9850 0 0)",
            sidebarAccent: "oklch(0.2690 0 0)",
            sidebarAccentForeground: "oklch(0.9850 0 0)",
            sidebarBorder: "oklch(0.2750 0 0)",
            sidebarRing: "oklch(0.4390 0 0)",
            fontSans: "'Space Grotesk', ui-sans-serif, sans-serif, system-ui",
            fontSerif: "'PT Serif', ui-serif, serif",
            fontMono: "'Space Mono', ui-monospace, monospace",
            radius: "0.625rem",
            shadowX: "0",
            shadowY: "1px",
            shadowBlur: "3px",
            shadowSpread: "0px",
            shadowOpacity: "0.1",
            shadowColor: "oklch(0 0 0)",
            shadow2xs: "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
            shadowXs: "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
            shadowSm: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
            shadow: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
            shadowMd: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)",
            shadowLg: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)",
            shadowXl: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)",
            shadow2xl: "0 1px 3px 0px hsl(0 0% 0% / 0.25)",
        },
        swatches: [
            "oklch(0.6236 0.1833 147.4139)", // Primary (Neon Green)
            "oklch(0.1289 0.0199 238.9108)", // Dark Background
            "oklch(0.9813 0.0100 238.5069)", // Light Background
            "oklch(0.2414 0.0196 239.1401)", // Dark Muted
        ],
    }
];

export const DEFAULT_THEME_COLOR = 34.44;

export interface ThemeColorPalette {
	primary: string;
	primaryForeground: string;
	ring: string;
	sidebarPrimary: string;
	sidebarPrimaryForeground: string;
	chart1: string;
	chart5: string;
}

function generateOKLCH(l: number, c: number, h: number): string {
	return `oklch(${l} ${c} ${h})`;
}

export function generateLightPalette(hue: number): ThemeColorPalette {
	return {
		primary: generateOKLCH(0.607, 0.0936, hue),
		primaryForeground: generateOKLCH(1, 0, 0),
		ring: generateOKLCH(0.607, 0.0936, hue),
		sidebarPrimary: generateOKLCH(0.607, 0.0936, hue),
		sidebarPrimaryForeground: generateOKLCH(0.9881, 0, 0),
		chart1: generateOKLCH(0.5583, 0.1276, hue),
		chart5: generateOKLCH(0.5608, 0.1348, hue),
	};
}

export function generateDarkPalette(hue: number): ThemeColorPalette {
	return {
		primary: generateOKLCH(0.607, 0.0936, hue),
		primaryForeground: generateOKLCH(1, 0, 0),
		ring: generateOKLCH(0.607, 0.0936, hue),
		sidebarPrimary: generateOKLCH(0.325, 0, 0),
		sidebarPrimaryForeground: generateOKLCH(0.9881, 0, 0),
		chart1: generateOKLCH(0.5583, 0.1276, hue),
		chart5: generateOKLCH(0.5608, 0.1348, hue),
	};
}

export function applyThemeColors(hue: number, isDark: boolean): void {
	if (typeof window === "undefined") return;

	const palette = isDark ? generateDarkPalette(hue) : generateLightPalette(hue);
	const root = window.document.documentElement;

	root.style.setProperty("--primary", palette.primary);
	root.style.setProperty("--primary-foreground", palette.primaryForeground);
	root.style.setProperty("--ring", palette.ring);
	root.style.setProperty("--sidebar-primary", palette.sidebarPrimary);
	root.style.setProperty(
		"--sidebar-primary-foreground",
		palette.sidebarPrimaryForeground,
	);
	root.style.setProperty("--chart-1", palette.chart1);
	root.style.setProperty("--chart-5", palette.chart5);
}

export function applyFontFamily(fontFamily: FontFamily): void {
	if (typeof window === "undefined") return;

	const root = window.document.documentElement;
	root.style.setProperty("--font-sans", fontFamily.sans);
	root.style.setProperty("--font-serif", fontFamily.serif);
	root.style.setProperty("--font-mono", fontFamily.mono);
}

function applyThemeVariables(
	variables: ThemeVariables,
	root: HTMLElement,
): void {
	root.style.setProperty("--background", variables.background);
	root.style.setProperty("--foreground", variables.foreground);
	root.style.setProperty("--card", variables.card);
	root.style.setProperty("--card-foreground", variables.cardForeground);
	root.style.setProperty("--popover", variables.popover);
	root.style.setProperty("--popover-foreground", variables.popoverForeground);
	root.style.setProperty("--primary", variables.primary);
	root.style.setProperty("--primary-foreground", variables.primaryForeground);
	root.style.setProperty("--secondary", variables.secondary);
	root.style.setProperty(
		"--secondary-foreground",
		variables.secondaryForeground,
	);
	root.style.setProperty("--muted", variables.muted);
	root.style.setProperty("--muted-foreground", variables.mutedForeground);
	root.style.setProperty("--accent", variables.accent);
	root.style.setProperty("--accent-foreground", variables.accentForeground);
	root.style.setProperty("--destructive", variables.destructive);
	root.style.setProperty(
		"--destructive-foreground",
		variables.destructiveForeground,
	);
	root.style.setProperty("--border", variables.border);
	root.style.setProperty("--input", variables.input);
	root.style.setProperty("--ring", variables.ring);
	root.style.setProperty("--chart-1", variables.chart1);
	root.style.setProperty("--chart-2", variables.chart2);
	root.style.setProperty("--chart-3", variables.chart3);
	root.style.setProperty("--chart-4", variables.chart4);
	root.style.setProperty("--chart-5", variables.chart5);
	root.style.setProperty("--sidebar", variables.sidebar);
	root.style.setProperty("--sidebar-foreground", variables.sidebarForeground);
	root.style.setProperty("--sidebar-primary", variables.sidebarPrimary);
	root.style.setProperty(
		"--sidebar-primary-foreground",
		variables.sidebarPrimaryForeground,
	);
	root.style.setProperty("--sidebar-accent", variables.sidebarAccent);
	root.style.setProperty(
		"--sidebar-accent-foreground",
		variables.sidebarAccentForeground,
	);
	root.style.setProperty("--sidebar-border", variables.sidebarBorder);
	root.style.setProperty("--sidebar-ring", variables.sidebarRing);
	root.style.setProperty("--font-sans", variables.fontSans);
	root.style.setProperty("--font-serif", variables.fontSerif);
	root.style.setProperty("--font-mono", variables.fontMono);
	root.style.setProperty("--radius", variables.radius);
	root.style.setProperty("--shadow-x", variables.shadowX);
	root.style.setProperty("--shadow-y", variables.shadowY);
	root.style.setProperty("--shadow-blur", variables.shadowBlur);
	root.style.setProperty("--shadow-spread", variables.shadowSpread);
	root.style.setProperty("--shadow-opacity", variables.shadowOpacity);
	root.style.setProperty("--shadow-color", variables.shadowColor);
	root.style.setProperty("--shadow-2xs", variables.shadow2xs);
	root.style.setProperty("--shadow-xs", variables.shadowXs);
	root.style.setProperty("--shadow-sm", variables.shadowSm);
	root.style.setProperty("--shadow", variables.shadow);
	root.style.setProperty("--shadow-md", variables.shadowMd);
	root.style.setProperty("--shadow-lg", variables.shadowLg);
	root.style.setProperty("--shadow-xl", variables.shadowXl);
	root.style.setProperty("--shadow-2xl", variables.shadow2xl);
	root.style.setProperty("--tracking-normal", variables.trackingNormal);
	root.style.setProperty("--spacing", variables.spacing);
}

export function applyCompleteTheme(
	theme: CompleteTheme,
	isDark: boolean,
): number {
	if (typeof window === "undefined") return DEFAULT_THEME_COLOR;

	const root = window.document.documentElement;
	const variables = isDark ? theme.dark : theme.light;

	applyThemeVariables(variables, root);

	const hue = extractHueFromOKLCH(variables.primary);

	return hue;
}

type Oklch = { l: number; c: number; h: number };
type Hsl = { h: number; s: number; l: number };

export function oklchToHsl(oklch: Oklch): Hsl {
	const { l, c, h } = oklch;

	const hRad = (h * Math.PI) / 180;
	const a = c * Math.cos(hRad);
	const b = c * Math.sin(hRad);

	const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = l - 0.0894841775 * a - 1.291485548 * b;

	const l3 = l_ * l_ * l_;
	const m3 = m_ * m_ * m_;
	const s3 = s_ * s_ * s_;

	let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
	let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
	let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

	const transfer = (v: number) => {
		const vClamped = v < 0 ? 0 : v > 1 ? 1 : v;
		return vClamped <= 0.0031308
			? 12.92 * vClamped
			: 1.055 * Math.pow(vClamped, 1 / 2.4) - 0.055;
	};

	r = transfer(r);
	g = transfer(g);
	bl = transfer(bl);

	const max = Math.max(r, g, bl);
	const min = Math.min(r, g, bl);
	let hHsl = 0;
	let sHsl = 0;
	const lHsl = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		sHsl = lHsl > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				hHsl = (g - bl) / d + (g < bl ? 6 : 0);
				break;
			case g:
				hHsl = (bl - r) / d + 2;
				break;
			case bl:
				hHsl = (r - g) / d + 4;
				break;
		}
		hHsl /= 6;
	}

	return {
		h: Math.round(hHsl * 360),
		s: Math.round(sHsl * 100),
		l: Math.round(lHsl * 100),
	};
}

export function getHslStringFromOklchString(oklchStr: string): string {
	const match = oklchStr.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);

	if (!match) return "transparent";

	const [, l, c, h] = match.map(Number);
	const hsl = oklchToHsl({ l, c, h });

	return `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
}

export function extractHueFromOKLCH(color: string): number {
	const match = color.match(/oklch\(([^)]+)\)/);
	if (match) {
		const parts = match[1].trim().split(/\s+/);
		if (parts.length >= 3) {
			const hue = Number.parseFloat(parts[2]);
			if (!Number.isNaN(hue) && hue >= 0 && hue <= 360) {
				return hue;
			}
		}
	}
	return DEFAULT_THEME_COLOR;
}