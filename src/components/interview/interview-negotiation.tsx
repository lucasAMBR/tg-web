import type { AxiosError } from "axios";
import { CalendarClock, Check, CircleSlash, Timer, Video } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	useCancelDevJobVacancyInterview,
	useCompanyAcceptScheduleDevJobVacancyInterview,
	useCompanyProposeScheduleDevJobVacancyInterview,
	useDevAcceptScheduleDevJobVacancyInterview,
	useDevProposeScheduleDevJobVacancyInterview,
	useSetInitialScheduleDevJobVacancyInterview,
} from "@/api/generated/dev-job-vacancy-interview/dev-job-vacancy-interview";
import type { DevJobVacancyInterviewResource } from "@/api/generated/models";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useInterviewCallWindow } from "@/hooks/use-interview-call-window";
import {
	getInterviewDuration,
	getInterviewSchedule,
	getInterviewStatus,
	INTERVIEW_JOIN_WINDOW_BEFORE_MINUTES,
	type InterviewParty,
} from "@/types/dev-job-vacancy-interview";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { formatDateTime } from "@/utils/formatter";
import { onError } from "@/utils/on-error";
import InterviewCallDialog from "./interview-call-dialog";
import InterviewStatusBadge from "./interview-status-badge";
import ScheduleInterviewModal from "./schedule-interview-modal";

interface InterviewNegotiationProps {
	interview: DevJobVacancyInterviewResource;
	/** Lado que está olhando a entrevista, que define as ações disponíveis. */
	party: InterviewParty;
	/** Nome de quem está do outro lado, exibido na call. */
	counterpartName?: string | null;
	/** Recarrega a entrevista depois de qualquer ação que mude o status. */
	onUpdated: () => void;
}

export default function InterviewNegotiation({
	interview,
	party,
	counterpartName,
	onUpdated,
}: InterviewNegotiationProps) {
	const { t, i18n } = useTranslation();

	const [scheduleModalIsOpen, setScheduleModalIsOpen] = useState(false);
	const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
	const [callIsOpen, setCallIsOpen] = useState(false);

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const status = getInterviewStatus(interview);
	const schedule = getInterviewSchedule(interview);
	const duration = getInterviewDuration(interview);
	const callWindow = useInterviewCallWindow(interview);

	const isCompany = party === "company";

	const { mutateAsync: setInitialSchedule, isPending: isSettingSchedule } =
		useSetInitialScheduleDevJobVacancyInterview();
	const { mutateAsync: companyPropose, isPending: companyIsProposing } =
		useCompanyProposeScheduleDevJobVacancyInterview();
	const { mutateAsync: devPropose, isPending: devIsProposing } =
		useDevProposeScheduleDevJobVacancyInterview();
	const { mutateAsync: companyAccept, isPending: companyIsAccepting } =
		useCompanyAcceptScheduleDevJobVacancyInterview();
	const { mutateAsync: devAccept, isPending: devIsAccepting } =
		useDevAcceptScheduleDevJobVacancyInterview();
	const { mutateAsync: cancelInterview, isPending: isCancelling } =
		useCancelDevJobVacancyInterview();

	const isProposing = isSettingSchedule || companyIsProposing || devIsProposing;
	const isAccepting = companyIsAccepting || devIsAccepting;

	// A empresa faz a primeira proposta; depois disso os dois lados contrapropõem
	const isInitialSchedule = status === "awaiting_schedule";

	const handleSchedule = async (data: {
		scheduled_at: string;
		duration_in_minutes: number;
	}) => {
		if (isInitialSchedule) {
			await setInitialSchedule({ id: interview.id, data });
		} else if (isCompany) {
			await companyPropose({ id: interview.id, data });
		} else {
			await devPropose({ id: interview.id, data });
		}

		CustomToaster.successToast(
			t(
				isInitialSchedule
					? "toast.success.interview_schedule_set"
					: "toast.success.interview_schedule_proposed",
			),
		);

		onUpdated();
	};

	const handleAccept = async () => {
		try {
			if (isCompany) {
				await companyAccept({ id: interview.id });
			} else {
				await devAccept({ id: interview.id });
			}

			CustomToaster.successToast(
				t("toast.success.interview_schedule_accepted"),
			);

			onUpdated();
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	const handleCancel = async () => {
		try {
			await cancelInterview({ id: interview.id });

			CustomToaster.successToast(t("toast.success.interview_cancelled"));

			setCancelModalIsOpen(false);
			onUpdated();
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	/** Quem precisa responder à proposta vigente. */
	const mustAnswer =
		(isCompany && status === "awaiting_company_confirmation") ||
		(!isCompany && status === "awaiting_dev_confirmation");

	const description = () => {
		if (status === "awaiting_schedule") {
			return t(
				isCompany
					? "interview.no_schedule_company"
					: "interview.no_schedule_dev",
			);
		}

		if (status === "cancelled") return t("interview.cancelled_description");
		if (status === "rejected") return t("interview.rejected_description");

		if (status === "approved") {
			if (interview.ended_at) {
				return t("interview.call_finished", {
					date: formatDateTime(interview.ended_at, { locale: dateLocale }),
				});
			}

			if (callWindow === "too_early") {
				return t("interview.call_too_early", {
					minutes: INTERVIEW_JOIN_WINDOW_BEFORE_MINUTES,
				});
			}

			if (callWindow === "closed") return t("interview.call_closed");

			return t("interview.call_open");
		}

		if (mustAnswer) {
			return t(
				isCompany
					? "interview.proposed_by_dev"
					: "interview.proposed_by_company",
			);
		}

		return t(
			status === "awaiting_dev_confirmation"
				? "interview.awaiting_dev"
				: "interview.awaiting_company",
		);
	};

	return (
		<div className="flex flex-col gap-3 border-t pt-3">
			<div className="flex flex-row flex-wrap items-center gap-2">
				<InterviewStatusBadge interview={interview} />
				{schedule && (
					<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<CalendarClock className="size-3.5 shrink-0" />
						{formatDateTime(interview.scheduled_at, { locale: dateLocale })}
					</span>
				)}
				{duration && (
					<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<Timer className="size-3.5 shrink-0" />
						{t("interview.duration_minutes", { count: duration })}
					</span>
				)}
			</div>

			<p className="text-sm text-muted-foreground">{description()}</p>

			<div className="flex flex-row flex-wrap gap-2">
				{status === "approved" && callWindow === "open" && (
					<Button
						type="button"
						variant={"accent"}
						onClick={() => setCallIsOpen(true)}
					>
						<Video />
						{t("interview.join_call")}
					</Button>
				)}

				{mustAnswer && (
					<Button type="button" onClick={handleAccept} disabled={isAccepting}>
						{isAccepting ? <Spinner /> : <Check />}
						{t("interview.accept_schedule")}
					</Button>
				)}

				{(isInitialSchedule ? isCompany : mustAnswer) && (
					<Button
						type="button"
						variant={"secondary"}
						onClick={() => setScheduleModalIsOpen(true)}
					>
						<CalendarClock />
						{t(
							isInitialSchedule
								? "interview.set_schedule"
								: "interview.propose_schedule",
						)}
					</Button>
				)}

				{status !== "cancelled" && status !== "rejected" && (
					<Button
						type="button"
						variant={"outline"}
						onClick={() => setCancelModalIsOpen(true)}
					>
						<CircleSlash />
						{t("interview.cancel_interview")}
					</Button>
				)}
			</div>

			<ScheduleInterviewModal
				open={scheduleModalIsOpen}
				onOpenChange={setScheduleModalIsOpen}
				interview={interview}
				isInitialSchedule={isInitialSchedule}
				isPending={isProposing}
				onSubmit={handleSchedule}
			/>

			{callIsOpen && (
				<InterviewCallDialog
					open={callIsOpen}
					onOpenChange={setCallIsOpen}
					interview={interview}
					counterpartName={counterpartName}
					onEnded={onUpdated}
				/>
			)}

			<AlertDialog open={cancelModalIsOpen} onOpenChange={setCancelModalIsOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("interview.cancel_confirm_title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("interview.cancel_confirm_description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setCancelModalIsOpen(false)}>
							{t("general.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								// Evita que o dialog feche antes da resposta da API
								event.preventDefault();
								handleCancel();
							}}
							disabled={isCancelling}
						>
							{isCancelling ? <Spinner /> : t("general.confirm")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
