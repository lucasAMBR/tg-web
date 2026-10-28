import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { FreelanceDevSummary } from "@/types/freelance";

interface FreelanceDevSummaryProps {
	/** `null` quando o perfil do dev não existe mais. */
	dev: FreelanceDevSummary | null | undefined;
	/** Selos extras ao lado da senioridade e da especialidade. */
	badges?: ReactNode;
}

/** Foto, nome, senioridade e especialidade do dev, com link para o perfil. */
export default function FreelanceDevSummaryRow({
	dev,
	badges,
}: FreelanceDevSummaryProps) {
	const { t } = useTranslation();

	if (!dev) {
		return (
			<div className="flex flex-row items-center gap-3">
				<Avatar className="size-12">
					<AvatarFallback className="bg-muted">
						<User className="size-6" />
					</AvatarFallback>
				</Avatar>
				<p className="text-sm italic text-muted-foreground">
					{t("freelance.proposals.dev_unavailable")}
				</p>
			</div>
		);
	}

	return (
		<div className="flex min-w-0 flex-row items-center gap-3">
			<Link to="/devs/$id" params={{ id: dev.id }} className="shrink-0">
				<Avatar className="size-12">
					{dev.profile_pic && (
						<AvatarImage
							src={dev.profile_pic}
							alt={dev.name}
							className="object-cover"
						/>
					)}
					<AvatarFallback className="bg-primary text-primary-foreground">
						<User className="size-6" />
					</AvatarFallback>
				</Avatar>
			</Link>
			<div className="flex min-w-0 flex-col gap-1">
				<Link
					to="/devs/$id"
					params={{ id: dev.id }}
					className="truncate font-semibold hover:underline"
				>
					{dev.name}
				</Link>
				<div className="flex flex-row flex-wrap gap-2">
					{dev.seniority_level && (
						<Badge variant={"outline"}>
							{t(`enum.seniority_level.${dev.seniority_level}`, {
								defaultValue: dev.seniority_level_label ?? dev.seniority_level,
							})}
						</Badge>
					)}
					{dev.specialty && (
						<Badge variant={"outline"}>
							{t(`enum.dev_specialty.${dev.specialty}`, {
								defaultValue: dev.specialty_label ?? dev.specialty,
							})}
						</Badge>
					)}
					{badges}
				</div>
			</div>
		</div>
	);
}
