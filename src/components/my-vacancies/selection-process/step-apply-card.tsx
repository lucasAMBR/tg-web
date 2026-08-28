import { useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { DevJobVacancyResource } from "@/api/generated/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateTime } from "@/utils/formatter";

interface StepApplyCardProps {
	apply: DevJobVacancyResource;
	selected?: boolean;
	onSelectedChange?: (selected: boolean) => void;
	/** Dados extras da etapa, exibidos abaixo dos dados do desenvolvedor. */
	children?: ReactNode;
}

export default function StepApplyCard({
	apply,
	selected,
	onSelectedChange,
	children,
}: StepApplyCardProps) {
	const { t, i18n } = useTranslation();

	const navigate = useNavigate();

	const dev = apply.profile;

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const statusVariant =
		apply.status === "approved"
			? "default"
			: apply.status === "rejected"
				? "destructive"
				: "secondary";

	return (
		<Card
			onClick={() =>
				navigate({
					to: "/devs/$id",
					params: { id: dev?.id ?? apply.dev_profile_id },
				})
			}
			className="w-full flex flex-col gap-4 p-4 cursor-pointer hover:border-primary"
		>
			<div className="flex flex-row items-center gap-4">
				<Avatar className="size-14">
					{dev?.profile_pic && (
						<AvatarImage
							src={dev.profile_pic}
							alt={dev.name}
							className="object-cover"
						/>
					)}
					<AvatarFallback className="bg-primary text-primary-foreground">
						<User className="size-7" />
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex flex-1 flex-col gap-1">
					<p className="font-medium">{dev?.name ?? "—"}</p>
					<div className="flex flex-wrap gap-2">
						{dev?.specialty && (
							<Badge variant={"secondary"}>
								{t(`enum.dev_specialty.${dev.specialty}`)}
							</Badge>
						)}
						{dev?.seniority_level && (
							<Badge className="bg-accent text-accent-foreground">
								{t(`enum.seniority_level.${dev.seniority_level}`)}
							</Badge>
						)}
						<Badge
							variant={statusVariant}
							className={
								apply.status === "approved"
									? "bg-emerald-500 text-white"
									: undefined
							}
						>
							{t(`enum.dev_job_vacancy_status.${apply.status}`)}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						{t("my_vacancies.applies.table.applied_at")}:{" "}
						{formatDateTime(apply.applied_at, {
							locale: dateLocale,
							fallback: "—",
						})}
					</p>
				</div>
				{onSelectedChange && (
					// biome-ignore lint/a11y/noStaticElementInteractions: impede que o clique no checkbox navegue para o perfil
					<div
						className="shrink-0"
						onClick={(event) => event.stopPropagation()}
						onKeyDown={(event) => event.stopPropagation()}
					>
						<Checkbox
							className="size-5"
							checked={selected}
							onCheckedChange={(checked) => onSelectedChange(checked === true)}
						/>
					</div>
				)}
			</div>
			{children}
		</Card>
	);
}
