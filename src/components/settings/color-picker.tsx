import { CheckIcon } from "lucide-react";

import {
	type CompleteTheme,
	getHslStringFromOklchString,
	PRESET_THEMES,
} from "@/lib/theme-colors";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/theme-store"

export function ColorPicker() {
	const themeName = useThemeStore((s) => s.themeName);
	const setCompleteTheme = useThemeStore((s) => s.setCompleteTheme);

	const handleThemeClick = (completeTheme: CompleteTheme) => {
		setCompleteTheme(completeTheme);
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				{PRESET_THEMES.map((presetTheme) => {
					const isSelected = themeName === presetTheme.name;
					return (
						<button
							key={presetTheme.name}
							type="button"
							onClick={() => handleThemeClick(presetTheme)}
							className={cn(
								"group relative flex w-full items-center gap-3 rounded-md border p-3 transition-all border-input bg-background hover:border-ring/50 hover:bg-accent/50",
								isSelected &&
									"bg-accent/30 shadow-sm ring-offset-2 ring-1 ring-primary ring-offset-background",
							)}
							aria-label={`Selecionar tema ${presetTheme.name}`}
							aria-pressed={isSelected}
						>
							<div className="flex gap-1">
								{presetTheme.swatches.map((swatch) => (
									<div
										key={`${presetTheme.name}-${swatch}`}
										className="size-4 rounded border border-border/50"
										style={{
											backgroundColor: getHslStringFromOklchString(swatch),
										}}
									/>
								))}
							</div>

							<span className="text-foreground text-sm font-medium">
								{presetTheme.name}
							</span>

							{isSelected && (
								<CheckIcon
									className="absolute right-3 text-foreground size-4"
									aria-hidden="true"
								/>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}