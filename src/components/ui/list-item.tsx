import { Link } from "@tanstack/react-router";
import { NavigationMenuLink } from "./navigation-menu";

export default function ListItem({
  title,
  description,
  href,
}: { title: string, description: string, href: string}) {
  return (
    <li>
      <NavigationMenuLink className="hover:bg-accent" asChild>
        <Link
          to={href}
        >
          <div className="text-sm font-bold leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}