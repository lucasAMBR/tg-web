import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

/** Exibido nas etapas que o processo seletivo ainda não alcançou. */
export default function StepUpcomingEmpty() {
	const { t } = useTranslation();

	return (
		<Empty className="border">
			<EmptyHeader>
				<EmptyMedia variant={"icon"}>
					<CalendarClock />
				</EmptyMedia>
				<EmptyTitle>
					{t("my_vacancies.selection_process.upcoming_title")}
				</EmptyTitle>
				<EmptyDescription>
					{t("my_vacancies.selection_process.upcoming_description")}
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
