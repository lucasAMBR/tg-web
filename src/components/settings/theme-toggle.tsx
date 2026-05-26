import * as React from "react";

import { CheckIcon, MinusIcon } from "lucide-react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { ColorPicker } from "./color-picker";
import { useTranslation } from "react-i18next";

const items  = [
	{ value: "light", label: "Light", image: "/ui-light.png" },
	{ value: "dark", label: "Dark", image: "/ui-dark.png" },
	{ value: "system", label: "System", image: "/ui-system.png" }
];

export function ToggleTheme() {
	const { t } = useTranslation();

	const id = React.useId();

	const { theme, setTheme } = useTheme();

	return (
        <Card className="p-4 flex flex-col justify-between gap-12">
			<div className="flex flex-row justify-between gap-12">
			<div className='flex-1'>
				<h3 className='text-xl font-medium'>{t("settings.theme.change_theme.title")}</h3>
				<p className='text-sm text-muted-foreground'>{t("settings.theme.change_theme.description")}</p>
			</div>
		<fieldset className="space-y-4">
			<RadioGroup
				className="flex gap-3"
				value={theme}
				onValueChange={(value) =>
					setTheme(value)
				}
			>
				{items.map((item) => (
					<label key={`${id}-${item.value}`}>
						<RadioGroupItem
							id={`${id}-${item.value}`}
							value={item.value}
							className="peer sr-only after:absolute after:inset-0"
						/>
						<img
							src={item.image}
							alt={item.label}
							width={200}
							height={182}
							className="border-input peer-focus-visible:ring-ring/50 peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent relative cursor-pointer overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] outline-none peer-focus-visible:ring-[3px] peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50"
						/>
						<span className="group peer-data-[state=unchecked]:text-muted-foreground/70 mt-2 flex items-center gap-1">
							<CheckIcon
								size={20}
								className="group-peer-data-[state=unchecked]:hidden"
								aria-hidden="true"
							/>
							<MinusIcon
								size={20}
								className="group-peer-data-[state=checked]:hidden"
								aria-hidden="true"
							/>
							<span className="text-sm font-medium">{t(`general.${item.value}`)}</span>
						</span>
					</label>
				))}
			</RadioGroup>
		</fieldset>
		</div>
		<Separator />
		<div className="flex flex-row justify-between gap-12">
			<div className="flex-1">
				<h3 className='text-xl font-medium'>{t("settings.theme.theme.title")}</h3>
				<p className='text-sm text-muted-foreground'>{t("settings.theme.theme.description")}</p>
			</div>
			<div className="flex-2 min-w-0">
				<ColorPicker />
			</div>
		</div>
        </Card>
	);
}