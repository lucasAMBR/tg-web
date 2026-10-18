import { Code2, PencilLine } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DevJobVacancyLiveCodingResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { liveCodingHasExercise } from "@/types/dev-job-vacancy-live-coding";
import { type CallParty, callIsClosed } from "@/types/scheduled-call";
import LiveCodingExerciseModal from "./live-coding-exercise-modal";

/** A partir daqui o enunciado começa recolhido na lista de candidatos. */
const COLLAPSE_MIN_LENGTH = 240;
const COLLAPSE_MIN_LINES = 4;

interface LiveCodingExerciseProps {
	liveCoding: DevJobVacancyLiveCodingResource;
	/**
	 * A empresa escreve e corrige o exercício, com o enunciado recolhido para a
	 * lista de candidatos não crescer demais. O dev só lê, com o texto inteiro.
	 */
	party: CallParty;
}

/** Enunciado do exercício que o dev resolve durante a call do live coding. */
export default function LiveCodingExercise({
	liveCoding,
	party,
}: LiveCodingExerciseProps) {
	const { t } = useTranslation();

	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [expanded, setExpanded] = useState(false);

	const isCompany = party === "company";

	const hasExercise = liveCodingHasExercise(liveCoding);

	// A API recusa a escrita depois de cancelado ou com a call já encerrada
	const canEdit = !callIsClosed(liveCoding) && !liveCoding.ended_at;

	const statement = liveCoding.statement ?? "";

	const collapsible =
		isCompany &&
		(statement.length > COLLAPSE_MIN_LENGTH ||
			statement.split("\n").length > COLLAPSE_MIN_LINES);

	return (
		<div className="flex flex-col gap-2 border-t pt-3">
			<div className="flex flex-row flex-wrap items-center gap-2">
				{isCompany ? (
					<Badge
						variant={hasExercise ? "default" : "secondary"}
						className={hasExercise ? "bg-emerald-500 text-white" : undefined}
					>
						{t(
							hasExercise
								? "live_coding.exercise.published"
								: "live_coding.exercise.missing",
						)}
					</Badge>
				) : (
					<p className="text-sm font-medium">
						{t("my_applies.live_coding.statement")}
					</p>
				)}
				{liveCoding.programming_language && (
					<Badge variant={"outline"}>
						<Code2 />
						{isCompany
							? liveCoding.programming_language
							: `${t("my_applies.live_coding.programming_language")}: ${liveCoding.programming_language}`}
					</Badge>
				)}
			</div>
			{hasExercise ? (
				<>
					{!isCompany && (
						<p className="text-sm text-muted-foreground">
							{t("my_applies.live_coding.description")}
						</p>
					)}
					<p
						className={cn(
							"text-sm whitespace-pre-line",
							isCompany && "text-muted-foreground",
							collapsible && !expanded && "line-clamp-3",
						)}
					>
						{statement}
					</p>
					{collapsible && (
						<Button
							type="button"
							variant={"link"}
							className="h-auto w-fit p-0"
							onClick={() => setExpanded((current) => !current)}
						>
							{t(
								expanded
									? "live_coding.exercise.show_less"
									: "live_coding.exercise.show_more",
							)}
						</Button>
					)}
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					{t(
						isCompany
							? "live_coding.exercise.missing_description"
							: "my_applies.live_coding.awaiting_exercise",
					)}
				</p>
			)}
			{isCompany && canEdit && (
				<>
					<Button
						type="button"
						variant={hasExercise ? "secondary" : "default"}
						className="w-fit"
						onClick={() => setModalIsOpen(true)}
					>
						<PencilLine />
						{t(
							hasExercise
								? "live_coding.exercise.edit"
								: "live_coding.exercise.write",
						)}
					</Button>
					<LiveCodingExerciseModal
						open={modalIsOpen}
						onOpenChange={setModalIsOpen}
						liveCoding={liveCoding}
					/>
				</>
			)}
		</div>
	);
}
