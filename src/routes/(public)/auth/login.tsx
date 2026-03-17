import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/auth/login')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(public)/auth/login"!</div>;
}
