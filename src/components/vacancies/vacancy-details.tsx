import { AlertCircle, Briefcase, Eye, Hourglass } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import VacancyActions from "@/components/my-vacancies/vacancy-actions";
import VacancyDevsTabs from "@/components/my-vacancies/vacancy-devs-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ApplyVacancyButton from "@/components/vacancies/apply-vacancy-button";
import { useBreadcrumbLabel } from "@/hooks/use-breadcrumbs";
import i18n from "@/i18n";
import { formatCurrency } from "@/utils/formatter";

interface VacancyDetailsProps {
	vacancyId: string;
	/** Exibe as ações de dono da vaga e a listagem de candidatos. */
	ownerView?: boolean;
}

function VacancyDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<Card className="w-full flex-row items-center gap-4 px-12 py-8">
				<Skeleton className="size-32 rounded-full" />
				<div className="flex flex-1 flex-col gap-3">
					<Skeleton className="h-9 w-80" />
					<div className="flex flex-row gap-2">
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-6 w-24" />
					</div>
					<Skeleton className="h-5 w-56" />
				</div>
			</Card>
			<Card className="w-full gap-3 p-8">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</Card>
		</div>
	);
}

export default function VacancyDetails({
	vacancyId,
	ownerView = false,
}: VacancyDetailsProps) {
	const { t } = useTranslation();

	const { data: vacancy, isLoading } = useShowJobVacancy(vacancyId);

	const vacancyData = vacancy?.data;

	useBreadcrumbLabel(vacancyData?.title);

	const currencyLocale = i18n.language === "en" ? "en" : "pt";

	const hasTranslation = vacancyData?.translation_status === "translated";
	const translationIsPending = vacancyData?.translation_status === "pending";
	const translationIsError = vacancyData?.translation_status === "error";
	const translationInProgress =
		vacancyData?.translation_status === "translating";

	const [displayOriginalContent, setDisplayOriginalContent] =
		useState<boolean>(true);

	const translatedTitle =
		i18n.language === "pt" ? vacancyData?.title_pt : vacancyData?.title_en;
	const translatedDescription =
		i18n.language === "pt"
			? vacancyData?.description_pt
			: vacancyData?.description_en;
	const translatedBenefits =
		i18n.language === "pt"
			? vacancyData?.benefits_pt
			: vacancyData?.benefits_en;

	const title =
		(displayOriginalContent ? vacancyData?.title : translatedTitle) ?? "—";
	const description =
		(displayOriginalContent
			? vacancyData?.description
			: translatedDescription) ?? "—";
	const benefits = ((displayOriginalContent
		? vacancyData?.benefits
		: translatedBenefits) ?? []) as string[];

	// Com inscrições abertas o processo ainda não começou, então a etapa atual não é exibida
	const showProcessStep =
		!!vacancyData?.process_step && vacancyData.status !== "open_inscriptions";

	const specialty = vacancyData?.specialties;
	const requiredLanguages = vacancyData?.languages ?? [];
	const desirableLanguages = vacancyData?.language_desirable ?? [];
	const softSkills = vacancyData?.soft_skills ?? [];
	const processSteps = [...(vacancyData?.process_steps ?? [])].sort(
		(step, nextStep) => step.order - nextStep.order,
	);

	if (isLoading) return <VacancyDetailsSkeleton />;

	return (
		<>
			<Card className="w-full gap-4 px-12 py-8">
				<div className="flex flex-row items-center gap-4">
					<Avatar className="size-32">
						{vacancyData?.profile?.profile_pic && (
							<AvatarImage
								src={vacancyData.profile.profile_pic}
								alt={vacancyData.profile.name}
								className="object-cover"
							/>
						)}
						<AvatarFallback className="bg-primary text-primary-foreground">
							<Briefcase className="size-22" />
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-1 flex-col gap-2">
						<h2 className="text-4xl font-bold font-[Anta]">{title}</h2>
						{vacancyData?.profile?.name && (
							<p className="text-muted-foreground">
								{vacancyData.profile.name}
							</p>
						)}
						<div className="flex flex-row flex-wrap gap-2">
							{vacancyData?.status && (
								<Badge
									variant={
										vacancyData.status === "open_inscriptions"
											? "default"
											: vacancyData.status === "canceled"
												? "destructive"
												: "outline"
									}
									className={
										vacancyData.status === "open_inscriptions"
											? "bg-emerald-500 text-white"
											: undefined
									}
								>
									{t(`enum.job_vacancy_status.${vacancyData.status}`)}
								</Badge>
							)}
							{showProcessStep && (
								<Badge variant={"outline"}>
									{t("my_vacancies.current_step")}:{" "}
									{t(
										`enum.selection_process_stage.${vacancyData?.process_step}`,
									)}
								</Badge>
							)}
							<Badge variant={"destructive"}>
								{t(`enum.contract_type.${vacancyData?.contract_type}`)}
							</Badge>
							<Badge variant={"secondary"}>
								{t(`enum.seniority_level.${vacancyData?.seniority_level}`)}
							</Badge>
							<Badge variant={"default"}>
								{t(`enum.employment_type.${vacancyData?.employment_type}`)}
							</Badge>
							{specialty && (
								<Badge className="bg-accent text-accent-foreground">
									{t(`enum.dev_specialty.${specialty}`)}
								</Badge>
							)}
							<Badge variant={"outline"}>
								{t("my_vacancies.candidates")}:{" "}
								{vacancyData?.dev_profiles_count ?? 0}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground">
							{t("my_vacancies.estimated_salary")}:{" "}
							{formatCurrency(vacancyData?.estimated_salary ?? 0, {
								locale: currencyLocale,
							})}
						</p>
						{hasTranslation && (
							<button
								type="button"
								className="flex cursor-pointer items-center gap-1 self-start text-sm text-primary"
								onClick={() =>
									setDisplayOriginalContent(!displayOriginalContent)
								}
							>
								<Eye className="size-3.5" />
								{displayOriginalContent
									? t("general.display_translated_content")
									: t("general.display_original_content")}
							</button>
						)}
						{translationIsPending && (
							<p className="flex items-center gap-1 text-sm text-muted-foreground">
								<Hourglass className="size-3.5" />
								{t("general.translation_pending")}
							</p>
						)}
						{translationIsError && (
							<p className="flex items-center gap-1 text-sm text-muted-foreground">
								<AlertCircle className="size-3.5" />
								{t("general.translation_error")}
							</p>
						)}
						{translationInProgress && (
							<p className="flex items-center gap-1 text-sm text-muted-foreground">
								<Hourglass className="size-3.5" />
								{t("general.translation_in_progress")}
							</p>
						)}
					</div>
				</div>
				{!ownerView && (
					<ApplyVacancyButton
						vacancyId={vacancyId}
						status={vacancyData?.status}
						size="lg"
						className="w-full"
					/>
				)}
			</Card>
			{ownerView && (
				<Card className="w-full gap-3 p-8">
					<h3 className="text-lg font-bold">
						{t("my_vacancies.actions.title")}
					</h3>
					<VacancyActions
						vacancyId={vacancyId}
						status={vacancyData?.status}
						vacancy={vacancyData}
					/>
				</Card>
			)}
			<Card className="w-full gap-3 p-8">
				<h3 className="text-lg font-bold">{t("input.description")}</h3>
				<p className="whitespace-pre-line text-sm">{description}</p>
			</Card>
			<Card className="w-full gap-3 p-8">
				<h3 className="text-lg font-bold">{t("input.benefits")}</h3>
				{benefits.length > 0 ? (
					<div className="flex flex-row flex-wrap gap-2">
						{benefits.map((benefit) => (
							<Badge key={benefit} variant={"secondary"}>
								{benefit}
							</Badge>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						{t("general.no_results")}
					</p>
				)}
			</Card>
			<div className="flex flex-col gap-4 lg:flex-row">
				<Card className="flex-1 gap-3 p-8">
					<h3 className="text-lg font-bold">{t("input.required_languages")}</h3>
					{requiredLanguages.length > 0 ? (
						<div className="flex flex-col gap-2">
							{requiredLanguages.map((language) => (
								<div
									key={language.id}
									className="flex flex-row items-center justify-between gap-2"
								>
									<span className="truncate text-sm">{language.name}</span>
									{language.language_level && (
										<Badge variant={"secondary"}>
											{t(`enum.hard_skill_levels.${language.language_level}`)}
										</Badge>
									)}
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							{t("general.no_results")}
						</p>
					)}
				</Card>
				<Card className="flex-1 gap-3 p-8">
					<h3 className="text-lg font-bold">
						{t("input.desirable_languages")}
					</h3>
					{desirableLanguages.length > 0 ? (
						<div className="flex flex-row flex-wrap gap-2">
							{desirableLanguages.map((language) => (
								<Badge key={language.id} variant={"secondary"}>
									{language.name}
								</Badge>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							{t("general.no_results")}
						</p>
					)}
				</Card>
				<Card className="flex-1 gap-3 p-8">
					<h3 className="text-lg font-bold">{t("input.soft_skills")}</h3>
					{softSkills.length > 0 ? (
						<div className="flex flex-row flex-wrap gap-2">
							{softSkills.map((softSkill) => (
								<Badge key={softSkill.id} variant={"secondary"}>
									{softSkill.i18n_name_key
										? t(softSkill.i18n_name_key)
										: softSkill.name}
								</Badge>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							{t("general.no_results")}
						</p>
					)}
				</Card>
			</div>
			<Card className="w-full gap-3 p-8">
				<h3 className="text-lg font-bold">{t("input.process_steps")}</h3>
				{processSteps.length > 0 ? (
					<div className="flex flex-col gap-2">
						{processSteps.map((processStep, index) => {
							const isCurrentStep =
								showProcessStep &&
								processStep.step === vacancyData?.process_step;

							return (
								<div
									key={processStep.id}
									className="flex flex-row items-center gap-2"
								>
									<Badge variant={isCurrentStep ? "default" : "secondary"}>
										{index + 1}
									</Badge>
									<span
										className={
											isCurrentStep ? "text-sm font-semibold" : "text-sm"
										}
									>
										{t(`enum.selection_process_stage.${processStep.step}`)}
									</span>
									{isCurrentStep && (
										<Badge variant={"outline"}>
											{t("my_vacancies.current_step")}
										</Badge>
									)}
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						{t("general.no_results")}
					</p>
				)}
			</Card>
			{ownerView && (
				<Card className="w-full gap-3 p-8">
					<h3 className="text-lg font-bold">
						{t("my_vacancies.devs_section_title")}
					</h3>
					<VacancyDevsTabs jobVacancyId={vacancyId} />
				</Card>
			)}
		</>
	);
}
