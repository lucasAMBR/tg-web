import { useNavigate } from "@tanstack/react-router";
import { Code2, ExternalLink, FileCode2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShowJobVacancy } from "@/api/generated/job-vacancy/job-vacancy";
import {
	type DevJobVacancyResource,
	SelectionProcessStageEnum,
} from "@/api/generated/models";
import { useShowTechnicalChallenge } from "@/api/generated/technical-challenge/technical-challenge";
import ChallengeFileLink from "@/components/technical-challenge/challenge-file-link";
import ChallengeStatusBadge from "@/components/technical-challenge/challenge-status-badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
	challengeWasDelivered,
	getDevTechnicalChallenge,
	getSubmissionFile,
} from "@/types/technical-challenge";
import { formatDateTime } from "@/utils/formatter";
import StepAppliesList from "./step-applies-list";
import type { SelectionProcessStepProps } from "./step-props";
import StepResultsList from "./step-results-list";
import { getStepStatus } from "./step-status";

const STAGE = SelectionProcessStageEnum.technical_challenge;

/** Entrega do candidato, exibida dentro do card da candidatura. */
function ApplyTechnicalChallenge({ apply }: { apply: DevJobVacancyResource }) {
	const { t, i18n } = useTranslation();

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const devChallenge = getDevTechnicalChallenge(apply);

	if (!devChallenge) {
		return (
			<p className="border-t pt-3 text-sm text-muted-foreground">
				{t("my_vacancies.selection_process.technical_challenge.not_sent")}
			</p>
		);
	}

	const wasDelivered = challengeWasDelivered(devChallenge);

	const submissionFile = getSubmissionFile(devChallenge);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: impede que os controles da entrega naveguem para o perfil do candidato
		<div
			className="flex flex-col gap-2 border-t pt-3"
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
		>
			<div className="flex flex-row flex-wrap items-center gap-2">
				<ChallengeStatusBadge devChallenge={devChallenge} />
				<span className="text-sm text-muted-foreground">
					{wasDelivered
						? `${t("my_vacancies.selection_process.technical_challenge.submitted_at")}: ${formatDateTime(
								devChallenge.submitted_at,
								{ locale: dateLocale, fallback: "—" },
							)}`
						: `${t("my_applies.technical_challenge.due_date")}: ${formatDateTime(
								devChallenge.due_date,
								{
									locale: dateLocale,
									pattern: "dd/MM/yyyy",
									fallback: "—",
								},
							)}`}
				</span>
			</div>
			{wasDelivered ? (
				<div className="flex flex-col gap-2">
					{devChallenge.repository_url && (
						<a
							href={devChallenge.repository_url}
							target="_blank"
							rel="noreferrer"
							className="flex w-fit items-center gap-1 text-sm text-primary break-all"
						>
							<ExternalLink className="size-3.5 shrink-0" />
							{devChallenge.repository_url}
						</a>
					)}
					{submissionFile && (
						<ChallengeFileLink
							file={submissionFile}
							label={t(
								"my_vacancies.selection_process.technical_challenge.view_submission",
							)}
							stopPropagation
						/>
					)}
				</div>
			) : (
				<p className="text-sm text-muted-foreground">
					{t(
						"my_vacancies.selection_process.technical_challenge.awaiting_delivery",
					)}
				</p>
			)}
		</div>
	);
}

export default function TechnicalChallengeStep({
	vacancyId,
}: SelectionProcessStepProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const { data: vacancy } = useShowJobVacancy(vacancyId);

	// Vaga sem desafio responde 404, que aqui significa "ainda não cadastrado"
	const { data: challengeResponse, isLoading } = useShowTechnicalChallenge(
		vacancyId,
		{ query: { retry: false } },
	);

	const challenge = challengeResponse?.data;

	const status = getStepStatus(STAGE, vacancy?.data);

	const goToChallenge = () =>
		navigate({
			to: "/my-vacancies/$id/technical-challenge",
			params: { id: vacancyId },
		});

	if (status === "done") {
		return <StepResultsList vacancyId={vacancyId} processStep={STAGE} />;
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	// A etapa fica travada até a empresa cadastrar o enunciado do desafio
	if (!challenge) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<FileCode2 />
					</EmptyMedia>
					<EmptyTitle>
						{t(
							"my_vacancies.selection_process.technical_challenge.missing_title",
						)}
					</EmptyTitle>
					<EmptyDescription>
						{t(
							status === "awaiting"
								? "my_vacancies.selection_process.technical_challenge.missing_blocking_description"
								: "my_vacancies.selection_process.technical_challenge.missing_description",
						)}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={goToChallenge}>
						<Code2 />
						{t(
							"my_vacancies.selection_process.technical_challenge.create_challenge",
						)}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	if (status === "upcoming" || status === "awaiting") {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<Code2 />
					</EmptyMedia>
					<EmptyTitle>
						{t("my_vacancies.selection_process.upcoming_title")}
					</EmptyTitle>
					<EmptyDescription>
						{t("my_vacancies.selection_process.upcoming_description")}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant={"secondary"} onClick={goToChallenge}>
						<Code2 />
						{t(
							"my_vacancies.selection_process.technical_challenge.manage_challenge",
						)}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-row flex-wrap justify-end">
				<Button variant={"secondary"} onClick={goToChallenge}>
					<Code2 />
					{t(
						"my_vacancies.selection_process.technical_challenge.manage_challenge",
					)}
				</Button>
			</div>
			<StepAppliesList
				vacancyId={vacancyId}
				processStep={STAGE}
				renderApplyExtra={(apply) => <ApplyTechnicalChallenge apply={apply} />}
			/>
		</div>
	);
}
