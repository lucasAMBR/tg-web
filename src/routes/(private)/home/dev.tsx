import ThemeToggle from "@/components/global/theme-toggle-button";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/home/dev")({
	component: RouteComponent,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});

function RouteComponent() {
	return (
		<div>
			Hello "/(private)/home/dev"!
			<ThemeToggle />
		</div>
	);
}
