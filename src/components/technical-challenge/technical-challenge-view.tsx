import { CalendarClock, FileArchive } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TechnicalChallengeResource } from "@/api/generated/models";
import { Badge } from "@/components/ui/badge";
import {
	acceptsZipSubmission,
	getChallengeDescription,
	getChallengeRules,
	getChallengeTitle,
} from "@/types/technical-challenge";
import { formatIsoDateOnlyBr } from "@/utils/date-only";

interface TechnicalChallengeViewProps {
	challenge: TechnicalChallengeResource;
}

/** Leitura do enunciado montado pela empresa, sem nenhum campo editável. */
export default function TechnicalChallengeView({
	challenge,
}: TechnicalChallengeViewProps) {
	const { t, i18n } = useTranslation();

	const description = getChallengeDescription(challenge, i18n.language);

	const rules = getChallengeRules(challenge, i18n.language);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<h3 className="text-lg font-bold">
					{getChallengeTitle(challenge, i18n.language)}
				</h3>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Badge variant={"outline"}>
						<CalendarClock className="size-3.5" />
						{t("technical_challenge.due_date")}:{" "}
						{formatIsoDateOnlyBr(challenge.due_date ?? "")}
					</Badge>
					{acceptsZipSubmission(challenge) && (
						<Badge variant={"outline"}>
							<FileArchive className="size-3.5" />
							{t("technical_challenge.accepts_zip")}
						</Badge>
					)}
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<p className="text-sm font-medium">
					{t("technical_challenge.form.description")}
				</p>
				<p className="text-sm text-muted-foreground whitespace-pre-line">
					{description}
				</p>
			</div>
			{rules && (
				<div className="flex flex-col gap-1">
					<p className="text-sm font-medium">
						{t("technical_challenge.form.rules")}
					</p>
					<p className="text-sm text-muted-foreground whitespace-pre-line">
						{rules}
					</p>
				</div>
			)}
		</div>
	);
}
