import { useNavigate } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { JobVacancyResource } from "@/api/generated/models";
import { formatCurrency } from "@/utils/formatter";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import ApplyVacancyButton from "../vacancies/apply-vacancy-button";

interface SearchVacancyCardProps {
	vacancy: JobVacancyResource;
}

export default function SearchVacancyCard({ vacancy }: SearchVacancyCardProps) {
	const { t, i18n } = useTranslation();

	const currencyLocale = i18n.language === "en" ? "en" : "pt";

	const navigate = useNavigate();

	return (
		<Card
			onClick={() =>
				navigate({ to: "/vacancies/$id", params: { id: vacancy.id } })
			}
			className="w-full flex flex-col gap-4 p-4 cursor-pointer hover:border-primary"
		>
			<div className="flex flex-row items-center gap-4">
				<Avatar className="size-14">
					{vacancy.profile?.profile_pic && (
						<AvatarImage
							src={vacancy.profile.profile_pic}
							alt={vacancy.profile.name}
							className="object-cover"
						/>
					)}
					<AvatarFallback className="bg-primary text-primary-foreground">
						<Briefcase className="size-7" />
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex flex-1 flex-col gap-1">
					<p className="font-medium">{vacancy.title}</p>
					{vacancy.profile?.name && (
						<p className="text-sm text-muted-foreground mb-2">
							{vacancy.profile.name}
						</p>
					)}
					<div className="flex flex-wrap gap-2">
						<Badge
							variant={
								vacancy.status === "open_inscriptions"
									? "default"
									: vacancy.status === "canceled"
										? "destructive"
										: "outline"
							}
							className={
								vacancy.status === "open_inscriptions"
									? "bg-emerald-500 text-white"
									: undefined
							}
						>
							{t(`enum.job_vacancy_status.${vacancy.status}`)}
						</Badge>
						<Badge variant={"destructive"}>
							{t(`enum.contract_type.${vacancy.contract_type}`)}
						</Badge>
						<Badge variant={"secondary"}>
							{t(`enum.seniority_level.${vacancy.seniority_level}`)}
						</Badge>
						<Badge variant={"default"}>
							{t(`enum.employment_type.${vacancy.employment_type}`)}
						</Badge>
						{vacancy.specialties && (
							<Badge className="bg-accent text-accent-foreground">
								{t(`enum.dev_specialty.${vacancy.specialties}`)}
							</Badge>
						)}
					</div>
					<p className="text-sm text-muted-foreground line-clamp-2">
						{vacancy.description}
					</p>
					<p className="text-sm text-muted-foreground">
						{t("my_vacancies.estimated_salary")}:{" "}
						{formatCurrency(vacancy.estimated_salary, {
							locale: currencyLocale,
						})}
					</p>
				</div>
			</div>
			<ApplyVacancyButton
				vacancyId={vacancy.id}
				status={vacancy.status}
				className="w-full"
			/>
		</Card>
	);
}
