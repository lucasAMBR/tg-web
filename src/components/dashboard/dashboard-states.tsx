import { Link } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { CircleAlert, ShieldOff, UserPen } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";
import { Skeleton } from "../ui/skeleton";
import { DashboardPeriodSelect } from "./period-select";

interface DashboardPageProps {
	title: string;
	description: string;
	/** Enquanto o novo período carrega, a tela anterior fica esmaecida. */
	isRefreshing?: boolean;
	children: ReactNode;
}

export function DashboardPage({
	title,
	description,
	isRefreshing = false,
	children,
}: DashboardPageProps) {
	return (
		<div className="flex flex-1 flex-col gap-6 p-4 sm:p-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h2 className="text-3xl font-bold">{title}</h2>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
				<DashboardPeriodSelect />
			</div>
			<div
				className={cn(
					"flex flex-col gap-6 transition-opacity",
					isRefreshing && "pointer-events-none opacity-60",
				)}
			>
				{children}
			</div>
		</div>
	);
}

const STAT_SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export function DashboardSkeleton() {
	return (
		<>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
				{STAT_SKELETON_KEYS.map((key) => (
					<Skeleton key={key} className="h-[104px] rounded-xl" />
				))}
			</div>
			<div className="grid gap-6 lg:grid-cols-2">
				<Skeleton className="h-[320px] rounded-xl" />
				<Skeleton className="h-[320px] rounded-xl" />
			</div>
			<Skeleton className="h-[360px] rounded-xl" />
		</>
	);
}

interface DashboardMessageProps {
	icon: ReactNode;
	title: string;
	description?: string;
	children?: ReactNode;
}

export function DashboardMessage({
	icon,
	title,
	description,
	children,
}: DashboardMessageProps) {
	return (
		<Card>
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>{icon}</EmptyMedia>
					<EmptyTitle>{title}</EmptyTitle>
					{description && <EmptyDescription>{description}</EmptyDescription>}
				</EmptyHeader>
				{children && <EmptyContent>{children}</EmptyContent>}
			</Empty>
		</Card>
	);
}

interface DashboardErrorProps {
	error: unknown;
	dashboard: "company" | "admin";
	onRetry: () => void;
}

/**
 * Decide pelo status e pelo contexto, nunca pelo texto de `message`. Na dashboard
 * da empresa, um 403 com a permissão em mãos é o admin usando outro perfil, e o
 * 500 é a empresa sem perfil cadastrado.
 */
export function DashboardError({
	error,
	dashboard,
	onRetry,
}: DashboardErrorProps) {
	const { t } = useTranslation();

	const hasCompanyPermission = usePermissionStore((state) =>
		state.hasPermission("company.dashboard"),
	);

	const status = (error as AxiosError | null)?.response?.status;

	if (status === 403) {
		const needsCompanyProfile = dashboard === "company" && hasCompanyPermission;

		return (
			<DashboardMessage
				icon={<ShieldOff />}
				title={
					needsCompanyProfile
						? t("dashboard.errors.switch_to_company")
						: t("dashboard.errors.forbidden")
				}
			/>
		);
	}

	if (status === 500 && dashboard === "company") {
		return (
			<DashboardMessage
				icon={<UserPen />}
				title={t("dashboard.errors.missing_profile")}
			>
				<Button asChild>
					<Link to="/create/profile/company">
						{t("dashboard.errors.complete_profile")}
					</Link>
				</Button>
			</DashboardMessage>
		);
	}

	return (
		<DashboardMessage
			icon={<CircleAlert />}
			title={t("dashboard.errors.unexpected")}
		>
			<Button variant={"secondary"} onClick={onRetry}>
				{t("dashboard.errors.retry")}
			</Button>
		</DashboardMessage>
	);
}
