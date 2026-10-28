import { Link } from "@tanstack/react-router";
import { MailOpen, Send, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	type FreelanceVacancy,
	getFreelanceLocale,
	getFreelanceSpecialties,
} from "@/types/freelance";
import { formatDateTime } from "@/utils/formatter";
import { FreelanceStatusBadge } from "./freelance-status-badge";

export type FreelanceDetailRoute =
	| "/freelance-vacancies/$id"
	| "/freelances/$id";

interface FreelanceVacancyCardProps {
	vacancy: FreelanceVacancy;
	/** Detalhe aberto pelo card: o da pesquisa ou o de "Meus Freelances". */
	to?: FreelanceDetailRoute;
	/** Fora do `open` o card mostra o status (em "Meus Freelances"). */
	showStatus?: boolean;
	/** Ações do dono, fora do link do card. */
	actions?: ReactNode;
	/** Informação extra de cada lista: orçamentos recebidos, contrato... */
	children?: ReactNode;
}

/**
 * Card do freela. Não mostra preço: o dev não recebe o budget, e o valor do
 * contrato entra pelo `children` só nas listas das duas pontas.
 */
export default function FreelanceVacancyCard({
	vacancy,
	to = "/freelance-vacancies/$id",
	showStatus = false,
	actions,
	children,
}: FreelanceVacancyCardProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const client = vacancy.profile;
	const languages = vacancy.languages ?? [];
	const specialties = getFreelanceSpecialties(vacancy);

	return (
		<Card className="w-full flex-row items-start gap-2 p-4 transition-colors hover:bg-accent/50">
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<Link
					to={to}
					params={{ id: vacancy.id }}
					className="flex min-w-0 flex-row items-start gap-4"
				>
					<Avatar className="size-14">
						{client?.profile_pic && (
							<AvatarImage
								src={client.profile_pic}
								alt={client.name}
								className="object-cover"
							/>
						)}
						<AvatarFallback className="bg-primary text-primary-foreground">
							<Users className="size-7" />
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-1 flex-col gap-2">
						<div className="flex min-w-0 flex-col">
							<p className="truncate text-md font-semibold">{vacancy.title}</p>
							<p className="truncate text-sm text-muted-foreground">
								{client?.name ?? t("freelance.details.client_unavailable")}
								{" · "}
								{t("freelance.posted_at", {
									date: formatDateTime(vacancy.created_at, {
										locale,
										pattern: "dd/MM/yyyy",
									}),
								})}
							</p>
						</div>
						<div className="flex flex-row flex-wrap gap-2">
							{showStatus && <FreelanceStatusBadge vacancy={vacancy} />}
							{vacancy.is_invited && (
								<Badge className="bg-primary text-primary-foreground">
									<MailOpen className="size-3" />
									{t("freelance.badges.invited")}
								</Badge>
							)}
							{vacancy.my_proposal && (
								<Badge className="bg-emerald-500 text-white">
									<Send className="size-3" />
									{t("freelance.badges.proposal_sent")}
								</Badge>
							)}
							<Badge variant={"default"}>
								{t(`enum.job_type.${vacancy.job_type}`, {
									defaultValue: vacancy.job_type_label,
								})}
							</Badge>
							<Badge variant={"secondary"}>
								{t(`enum.seniority_level.${vacancy.seniority_level}`, {
									defaultValue: vacancy.seniority_level_label,
								})}
							</Badge>
							{specialties.map((specialty) => (
								<Badge
									key={specialty}
									className="bg-accent text-accent-foreground"
								>
									{t(`enum.dev_specialty.${specialty}`)}
								</Badge>
							))}
						</div>
						{languages.length > 0 && (
							<div className="flex flex-row flex-wrap gap-2">
								{languages.map((language) => (
									<Badge key={language.id} variant={"outline"}>
										{language.name}
										{language.language_level && (
											<span className="text-muted-foreground">
												{" · "}
												{t(
													`enum.hard_skill_levels.${language.language_level}`,
													{ defaultValue: language.language_level_label },
												)}
											</span>
										)}
									</Badge>
								))}
							</div>
						)}
					</div>
				</Link>
				{children}
			</div>
			{actions}
		</Card>
	);
}
