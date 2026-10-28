import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CalendarClock, Check, CircleSlash, Timer, Video } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useCallWindow } from "@/hooks/use-call-window";
import {
	type CallParty,
	type CallScheduleData,
	getCallDuration,
	getCallSchedule,
	getCallStatus,
	JOIN_WINDOW_BEFORE_MINUTES,
	type ScheduledCall,
	type ScheduledCallKind,
} from "@/types/scheduled-call";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { formatDateTime } from "@/utils/formatter";
import { onError } from "@/utils/on-error";
import CallDialog from "./call-dialog";
import CallStatusBadge from "./call-status-badge";
import ScheduleCallModal from "./schedule-call-modal";

interface CallNegotiationProps {
	call: ScheduledCall;
	/** Entrevista ou live coding: define os endpoints e os textos. */
	kind: ScheduledCallKind;
	/** Lado que está olhando a call, que define as ações disponíveis. */
	party: CallParty;
	/** Nome de quem está do outro lado, exibido na call. */
	counterpartName?: string | null;
	/** Recarrega o registro depois de qualquer ação que mude o status. */
	onUpdated: () => void;
}

/** Negociação do horário entre dev e empresa e a entrada na call. */
export default function CallNegotiation({
	call,
	kind,
	party,
	counterpartName,
	onUpdated,
}: CallNegotiationProps) {
	const { t, i18n } = useTranslation();

	const [scheduleModalIsOpen, setScheduleModalIsOpen] = useState(false);
	const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
	const [callIsOpen, setCallIsOpen] = useState(false);

	const dateLocale = i18n.language === "en" ? "en" : "pt";

	const prefix = kind.i18nPrefix;
	const { api } = kind;

	const status = getCallStatus(call);
	const schedule = getCallSchedule(call);
	const duration = getCallDuration(call);
	const callWindow = useCallWindow(call);

	const isCompany = party === "company";

	// A empresa faz a primeira proposta; depois disso os dois lados contrapropõem
	const isInitialSchedule = status === "awaiting_schedule";

	const { mutateAsync: proposeSchedule, isPending: isProposing } = useMutation({
		mutationFn: (data: CallScheduleData) => {
			if (isInitialSchedule) return api.setSchedule(call.id, data);

			return isCompany
				? api.companyPropose(call.id, data)
				: api.devPropose(call.id, data);
		},
	});

	const { mutateAsync: acceptSchedule, isPending: isAccepting } = useMutation({
		mutationFn: () =>
			isCompany ? api.companyAccept(call.id) : api.devAccept(call.id),
	});

	const { mutateAsync: cancelCall, isPending: isCancelling } = useMutation({
		mutationFn: () => api.cancel(call.id),
	});

	const handleSchedule = async (data: CallScheduleData) => {
		await proposeSchedule(data);

		CustomToaster.successToast(
			t(
				isInitialSchedule
					? `toast.success.${prefix}_schedule_set`
					: `toast.success.${prefix}_schedule_proposed`,
			),
		);

		onUpdated();
	};

	const handleAccept = async () => {
		try {
			await acceptSchedule();

			CustomToaster.successToast(
				t(`toast.success.${prefix}_schedule_accepted`),
			);

			onUpdated();
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	const handleCancel = async () => {
		try {
			await cancelCall();

			CustomToaster.successToast(t(`toast.success.${prefix}_cancelled`));

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
					? `${prefix}.no_schedule_company`
					: `${prefix}.no_schedule_dev`,
			);
		}

		if (status === "cancelled") return t(`${prefix}.cancelled_description`);
		if (status === "rejected") return t(`${prefix}.rejected_description`);

		if (status === "approved") {
			if (call.ended_at) {
				return t(`${prefix}.call_finished`, {
					date: formatDateTime(call.ended_at, { locale: dateLocale }),
				});
			}

			if (callWindow === "too_early") {
				return t(`${prefix}.call_too_early`, {
					minutes: JOIN_WINDOW_BEFORE_MINUTES,
				});
			}

			if (callWindow === "closed") return t(`${prefix}.call_closed`);

			return t(`${prefix}.call_open`);
		}

		if (mustAnswer) {
			return t(
				isCompany
					? `${prefix}.proposed_by_dev`
					: `${prefix}.proposed_by_company`,
			);
		}

		return t(
			status === "awaiting_dev_confirmation"
				? `${prefix}.awaiting_dev`
				: `${prefix}.awaiting_company`,
		);
	};

	return (
		<div className="flex flex-col gap-3 border-t pt-3">
			<div className="flex flex-row flex-wrap items-center gap-2">
				<CallStatusBadge call={call} kind={kind} />
				{schedule && (
					<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<CalendarClock className="size-3.5 shrink-0" />
						{formatDateTime(call.scheduled_at, { locale: dateLocale })}
					</span>
				)}
				{duration && (
					<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<Timer className="size-3.5 shrink-0" />
						{t(`${prefix}.duration_minutes`, { count: duration })}
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
						{t(`${prefix}.join_call`)}
					</Button>
				)}

				{mustAnswer && (
					<Button type="button" onClick={handleAccept} disabled={isAccepting}>
						{isAccepting ? <Spinner /> : <Check />}
						{t(`${prefix}.accept_schedule`)}
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
								? `${prefix}.set_schedule`
								: `${prefix}.propose_schedule`,
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
						{t(`${prefix}.cancel`)}
					</Button>
				)}
			</div>

			<ScheduleCallModal
				open={scheduleModalIsOpen}
				onOpenChange={setScheduleModalIsOpen}
				call={call}
				kind={kind}
				isInitialSchedule={isInitialSchedule}
				isPending={isProposing}
				onSubmit={handleSchedule}
			/>

			{callIsOpen && (
				<CallDialog
					open={callIsOpen}
					onOpenChange={setCallIsOpen}
					call={call}
					kind={kind}
					counterpartName={counterpartName}
					onEnded={onUpdated}
				/>
			)}

			<AlertDialog open={cancelModalIsOpen} onOpenChange={setCancelModalIsOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t(`${prefix}.cancel_confirm_title`)}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t(`${prefix}.cancel_confirm_description`)}
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
