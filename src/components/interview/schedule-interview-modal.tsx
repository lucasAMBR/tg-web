import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { DevJobVacancyInterviewResource } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
	INTERVIEW_DURATION_OPTIONS,
	type IScheduleInterviewSchema,
	ScheduleInterviewSchema,
	toScheduledAt,
} from "@/schemas/dev-job-vacancy-interview/ScheduleInterviewSchema";
import { getInterviewDuration } from "@/types/dev-job-vacancy-interview";
import type { ApiError } from "@/utils/api-error";
import { formatDateOnly, parseLocalDateFromIso } from "@/utils/date-only";
import { onError } from "@/utils/on-error";

const DEFAULT_DURATION = 60;

interface ScheduleInterviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	interview: DevJobVacancyInterviewResource;
	/** `true` na primeira definição de horário, `false` nas contrapropostas. */
	isInitialSchedule: boolean;
	isPending: boolean;
	onSubmit: (data: {
		scheduled_at: string;
		duration_in_minutes: number;
	}) => Promise<unknown>;
}

export default function ScheduleInterviewModal({
	open,
	onOpenChange,
	interview,
	isInitialSchedule,
	isPending,
	onSubmit,
}: ScheduleInterviewModalProps) {
	const { t } = useTranslation();

	const form = useForm<IScheduleInterviewSchema>({
		resolver: zodResolver(ScheduleInterviewSchema),
		defaultValues: {
			date: "",
			time: "",
			duration_in_minutes: DEFAULT_DURATION,
		},
	});

	const { reset } = form;

	// A contraproposta parte do horário vigente, para o usuário só ajustar o que muda
	useEffect(() => {
		if (!open) return;

		const scheduledAt = interview.scheduled_at
			? new Date(interview.scheduled_at)
			: undefined;

		reset({
			date: scheduledAt ? format(scheduledAt, "yyyy-MM-dd") : "",
			time: scheduledAt ? format(scheduledAt, "HH:mm") : "",
			duration_in_minutes: getInterviewDuration(interview) ?? DEFAULT_DURATION,
		});
	}, [open, interview, reset]);

	const submit = async (data: IScheduleInterviewSchema) => {
		try {
			await onSubmit({
				scheduled_at: toScheduledAt(data.date, data.time),
				duration_in_minutes: data.duration_in_minutes,
			});

			onOpenChange(false);
		} catch (error) {
			onError(error as AxiosError<ApiError>);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isInitialSchedule
							? t("interview.modal.title_set")
							: t("interview.modal.title_propose")}
					</DialogTitle>
					<DialogDescription>
						{t("interview.modal.description")}
					</DialogDescription>
				</DialogHeader>
				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit(submit)}
				>
					<div className="flex flex-col gap-4 sm:flex-row">
						<Controller
							control={form.control}
							name="date"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel>{t("interview.modal.date")}</FieldLabel>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												type="button"
												variant={"outline"}
												className={cn(
													"w-full justify-between text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value || t("interview.modal.date_placeholder")}
												<ChevronDownIcon className="h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={parseLocalDateFromIso(field.value)}
												onSelect={(date) =>
													field.onChange(date ? formatDateOnly(date) : "")
												}
												// A API exige um horário futuro, então dias passados não entram
												disabled={(date) =>
													date < new Date(new Date().toDateString())
												}
											/>
										</PopoverContent>
									</Popover>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="time"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel>{t("interview.modal.time")}</FieldLabel>
									<Input type="time" {...field} />
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>
					<Controller
						control={form.control}
						name="duration_in_minutes"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>{t("interview.modal.duration")}</FieldLabel>
								<Select
									value={String(field.value)}
									onValueChange={(value) => field.onChange(Number(value))}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{INTERVIEW_DURATION_OPTIONS.map((duration) => (
											<SelectItem key={duration} value={String(duration)}>
												{t("interview.duration_minutes", { count: duration })}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<DialogFooter>
						<Button
							type="button"
							variant={"secondary"}
							onClick={() => onOpenChange(false)}
						>
							{t("general.cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? <Spinner /> : t("general.save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
