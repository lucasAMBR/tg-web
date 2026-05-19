import { Link } from "@tanstack/react-router";
import { NavigationMenuLink } from "./navigation-menu";
import { useTranslation } from "react-i18next";

export default function ListItem({
	title,
	description,
	href,
}: {
	title: string;
	description: string;
	href: string;
}) {
	const { t } = useTranslation();

	return (
		<li>
			<NavigationMenuLink className="hover:bg-accent" asChild>
				<Link to={href}>
					<div className="text-sm font-bold leading-none">{t(title)}</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{t(description)}
					</p>
				</Link>
			</NavigationMenuLink>
		</li>
	);
}
