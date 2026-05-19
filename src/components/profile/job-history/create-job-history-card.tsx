import {
	getIndexEmploymentHistoryQueryKey,
	useStoreEmploymentHistory,
} from "@/api/generated/employment-history-doc/employment-history-doc";
import {
	useEnumContractType,
	useEnumEmploymentType,
	useEnumSeniority,
} from "@/api/generated/enums/enums";
import Required from "@/components/global/required-field";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
	CreateJobHistorySchema,
	type ICreateJobHistorySchema,
} from "@/schemas/job-history/CreateJobHistorySchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import { ChevronDownIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function CreateJobHistoryCard() {
	const { t } = useTranslation(); 

	const queryClient = useQueryClient();

	const { data: seniorityLevels, isLoading: seniorityIsloading } =
		useEnumSeniority();

	const seniorityList = seniorityLevels?.data ?? [];

	const { data: employmentTypes, isLoading: employmentTypesIsLoading } =
		useEnumEmploymentType();

	const employmentTypeList = employmentTypes?.data ?? [];

	const { data: contractTypes, isLoading: contractTypesIsLoading } =
		useEnumContractType();

	const contractTypeList = contractTypes?.data ?? [];

	const [creationIsOpen, setCreationIsOpen] = useState<boolean>(false);

	const form = useForm<ICreateJobHistorySchema>({
		resolver: zodResolver(CreateJobHistorySchema),
		defaultValues: {
			company_name: "",
			company_location: "",
			position_name: "",
			employment_type: "",
			contract_type: "",
			seniority_level: "",
			actuation_details: "",
			is_current: true,
			start_date: format(new Date(), "yyyy-MM-dd"),
		},
	});

	const isCurrentJob = form.watch("is_current");

	const actuationLength = form.watch("actuation_details").length;

	useEffect(() => {
		if (isCurrentJob) {
			form.setValue("end_date", undefined);
		}
	}, [isCurrentJob, form]);

	const { mutate, isPending } = useStoreEmploymentHistory();

	const submit = (data: ICreateJobHistorySchema) => {
		mutate(
			{ data },
			{
				onSuccess: (success) => {
					CustomToaster.successToast(success.message);
					queryClient.invalidateQueries({
						queryKey: getIndexEmploymentHistoryQueryKey(),
					});

					form.reset();
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<Card className="p-4">
			<div className="flex flex-row justify-between items-center">
				<h2 className="font-bold text-lg">{t("dev_profile.job_history.create_job_history")}</h2>
				<Button
					size={"icon"}
					onClick={() => setCreationIsOpen(!creationIsOpen)}
				>
					<Plus
						className={
							creationIsOpen
								? "rotate-45 transition-all duration-75"
								: "transition-all duration-75"
						}
					/>
				</Button>
			</div>
			{creationIsOpen && (
				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit(submit)}
				>
					<div className="flex flex-row gap-4">
						<Controller
							control={form.control}
							name="position_name"
							render={({ field, fieldState }) => (
								<Field className="flex-3">
									<FieldLabel>{t("input.position_name")}</FieldLabel>
									<Input
										placeholder={t("placeholder.position_name")}
										value={field.value}
										onChange={field.onChange}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="seniority_level"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel htmlFor="seniority_level">
										{t("input.seniority_level")} <Required />
									</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue placeholder={t("placeholder.seniority_level")} />
										</SelectTrigger>
										<SelectContent>
											{seniorityIsloading && <Spinner />}
											{!seniorityIsloading &&
												seniorityList.length > 0 &&
												seniorityList.map((item) => (
													<SelectItem value={item.value}>
														{item.label}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>
					<div className="flex flex-row gap-4">
						<Controller
							control={form.control}
							name="company_name"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>{t("input.company_name")}</FieldLabel>
									<Input
										placeholder={t("placeholder.company_name")}
										value={field.value}
										onChange={field.onChange}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="company_location"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>{t("input.company_location")}</FieldLabel>
									<Input
										placeholder={t("placeholder.company_location")}
										value={field.value}
										onChange={field.onChange}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>
					<div className="flex flex-row gap-4">
						<Controller
							control={form.control}
							name="employment_type"
							render={({ field, fieldState }) => (
								<Field className="flex-3">
									<FieldLabel htmlFor="seniority_level">
										{t("input.employment_type")}
										<Required />
									</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue placeholder={t("placeholder.employment_type")} />
										</SelectTrigger>
										<SelectContent>
											{employmentTypesIsLoading && <Spinner />}
											{!employmentTypesIsLoading &&
												employmentTypeList.length > 0 &&
												employmentTypeList.map((item) => (
													<SelectItem value={item.value}>
														{t(item.i18nKey)}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="contract_type"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel htmlFor="seniority_level">
										{t("input.contract_modality")} <Required />
									</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue placeholder={t("placeholder.contract_modality")} />
										</SelectTrigger>
										<SelectContent>
											{contractTypesIsLoading && <Spinner />}
											{!contractTypesIsLoading &&
												contractTypeList.length > 0 &&
												contractTypeList.map((item) => (
													<SelectItem value={item.value}>
														{t(item.i18nKey)}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>
					<div className="flex flex-row gap-4">
						<Controller
							control={form.control}
							name="start_date"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel htmlFor="birthdate">
										{t("input.start_date")} <Required />
									</FieldLabel>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"w-[212px] justify-between text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value ? (
													field.value
												) : (
													<span>{t("placeholder.start_date")}</span>
												)}
												<ChevronDownIcon className="h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={
													field.value
														? (() => {
																const [y, m, d] = field.value
																	.split("-")
																	.map(Number);
																return new Date(y, m - 1, d);
															})()
														: undefined
												}
												onSelect={(date) =>
													field.onChange(date ? format(date, "yyyy-MM-dd") : "")
												}
												captionLayout="dropdown"
												disabled={(date) => date < new Date("1900-01-01")}
											/>
										</PopoverContent>
									</Popover>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="end_date"
							render={({ field, fieldState }) => (
								<Field className="flex-1">
									<FieldLabel htmlFor="birthdate">
										{t("input.end_date")} <Required />
									</FieldLabel>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												disabled={isCurrentJob}
												className={cn(
													"w-[212px] justify-between text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value ? (
													field.value
												) : (
													<span>{t("placeholder.end_date")}</span>
												)}
												<ChevronDownIcon className="h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={
													field.value
														? (() => {
																const [y, m, d] = field.value
																	.split("-")
																	.map(Number);
																return new Date(y, m - 1, d);
															})()
														: undefined
												}
												captionLayout="dropdown"
												onSelect={(date) => {
													field.onChange(
														date ? format(date, "yyyy-MM-dd") : undefined,
													);
												}}
												disabled={(date) => date < new Date("1900-01-01")}
											/>
										</PopoverContent>
									</Popover>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>
					<Controller
						control={form.control}
						name="actuation_details"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>{t("input.actuation_details")}</FieldLabel>
								<div className="flex flex-col items-end gap-1">
									<Textarea
										placeholder={t("placeholder.actuation_details")}
										value={field.value}
										onChange={field.onChange}
									/>
									<p
										className={`text-sm text-muted-foreground ${actuationLength > 600 ? "text-red-600" : ""}`}
									>{`${actuationLength} / 600`}</p>
								</div>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<div className="flex gap-4">
						<Controller
							name="is_current"
							control={form.control}
							render={({ field }) => (
								<div className="flex items-center gap-2">
									<Switch
										checked={field.value}
										onCheckedChange={(checked) => field.onChange(!!checked)}
									/>
									<span>{t("input.is_current")}</span>
								</div>
							)}
						/>
					</div>
					<Button type="submit">{t("general.register")}</Button>
				</form>
			)}
		</Card>
	);
}
