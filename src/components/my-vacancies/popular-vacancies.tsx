import { useTopJobVacancies } from "@/api/generated/search/search";
import { Link } from "@tanstack/react-router";
import { formatCurrency } from "@/utils/formatter";
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { Skeleton } from "../ui/skeleton";

function PopularVacanciesSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			{[0, 1, 2].map((placeholder) => (
				<Card
					key={placeholder}
					className="p-4 flex-row justify-between items-center"
				>
					<div className="flex flex-row gap-4">
						<Skeleton className="size-14 rounded-full" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-5 w-40" />
							<div className="flex flex-row gap-2">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-5 w-20" />
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}

export default function PopularVacancies() {
	const { t, i18n } = useTranslation();

	const currencyLocale = i18n.language === "en" ? "en" : "pt";

  const { data: vacancies, isLoading } = useTopJobVacancies();

	const vacancyList = vacancies?.data ?? [];

	return (
		<aside className="flex flex-col gap-4">
			<h2 className="text-xl font-bold">{t("my_vacancies.popular_title")}</h2>
			{isLoading && <PopularVacanciesSkeleton />}
			{!isLoading && vacancyList.length === 0 && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant={"icon"}>
							<Briefcase />
						</EmptyMedia>
						<EmptyTitle>{t("general.no_results")}</EmptyTitle>
					</EmptyHeader>
				</Empty>
			)}
			{!isLoading && vacancyList.length > 0 && (
				<div className="flex flex-col gap-2">
					{vacancyList.map((vacancy) => (
						<Link
							key={String(vacancy.id)}
							to="/my-vacancies/$id"
							params={{ id: String(vacancy.id) }}
						>
						<Card
							className="p-4 flex-row justify-between items-center transition-colors hover:bg-accent/50"
						>
							<div className="flex flex-row gap-4">
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
								<div className="flex flex-col gap-2">
									<span className="flex flex-row gap-4 text-md font-semibold">
										<p className="truncate">{vacancy.title}</p>
										<Badge variant={"destructive"}>
											{t("my_vacancies.candidates")}:{" "}
											{vacancy.dev_profiles_count ?? 0}
										</Badge>
									</span>
                  <div className="flex flex-row flex-wrap gap-2">
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
                    {vacancy.status !== "open_inscriptions" && (
                      <Badge variant={"outline"}>
                        {t(`enum.selection_process_stage.${vacancy.process_step}`)}
                      </Badge>
                    )}
                    <Badge variant={"destructive"}>
                      {t(`enum.contract_type.${vacancy.contract_type}`)}
                    </Badge>
										<Badge variant={"secondary"}>
											{t(`enum.seniority_level.${vacancy.seniority_level}`)}
										</Badge>
										<Badge variant={"default"}>
											{t(`enum.employment_type.${vacancy.employment_type}`)}
										</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("my_vacancies.estimated_salary")}:{" "}
                      {formatCurrency(vacancy.estimated_salary, {
                        locale: currencyLocale,
                      })}
                    </p>
									</div>
								</div>
							</div>
						</Card>
						</Link>
					))}
				</div>
			)}
		</aside>
	);
}
