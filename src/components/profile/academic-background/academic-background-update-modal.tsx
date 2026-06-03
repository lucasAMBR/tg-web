import {
	getIndexAcademicBackgroundQueryKey,
	useUpdateAcademicBackground,
} from "@/api/generated/academic-background-doc/academic-background-doc";
import { useEnumDegreeLevel } from "@/api/generated/enums/enums";
import type { AcademicBackgroundModel } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAcademicBackgroundParams } from "@/hooks/filters/use-academic-background-params";
import {
	CreateAcademicBackgroundSchema,
	type ICreateAcademicBackgroundSchema,
} from "@/schemas/academic-background/CreateAcademicBackgroundSchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { File } from "lucide-react";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface UpdateAcademicBackgroundModalProps {
	profileId: string;
	open: boolean;
	openChange: (open: boolean) => void;
	closeModal: () => void;
	bg: AcademicBackgroundModel | null;
}

interface UpdateAcademicBackgroundModalContentProps
	extends Omit<UpdateAcademicBackgroundModalProps, "bg"> {
	bg: AcademicBackgroundModel;
}

export default function UpdateAcademicBackgroundModal(
	props: UpdateAcademicBackgroundModalProps,
) {
	if (!props.open || !props.bg) return null;

	return <UpdateAcademicBackgroundModalContent {...props} bg={props.bg} />;
}

function UpdateAcademicBackgroundModalContent({
	profileId,
	bg,
	open,
	openChange,
	closeModal,
}: UpdateAcademicBackgroundModalContentProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const { page, perPage, search, setFilterParams } =
		useAcademicBackgroundParams();

	const cleanFilters = () =>
		setFilterParams({ page: 1, perPage: 10, search: "" });

	const form = useForm<ICreateAcademicBackgroundSchema>({
		resolver: zodResolver(CreateAcademicBackgroundSchema),
		defaultValues: {
			degree: bg.degree ?? "",
			degree_level: bg.degree_level ?? "",
			institution: bg.institution ?? "",
			certificate: undefined,
		},
	});

	useEffect(() => {
		form.reset({
			degree: bg.degree ?? "",
			degree_level: bg.degree_level ?? "",
			institution: bg.institution ?? "",
			certificate: undefined,
		});
	}, [open, bg, form]);

	const { data: degreeLevel, isLoading } = useEnumDegreeLevel();

	const degreeLevelList = degreeLevel?.data ?? [];

	const { mutate: update, isPending } = useUpdateAcademicBackground();

	const submit = (data: ICreateAcademicBackgroundSchema) => {
		update(
			{ id: bg.id, data },
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.academic_background_updated"),
					);

					queryClient.invalidateQueries({
						queryKey: getIndexAcademicBackgroundQueryKey({
							dev_profile_id: profileId,
							page,
							per_page: perPage,
							search,
						}),
					});

					form.reset();

					cleanFilters();
					closeModal();
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={openChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t("dev_profile.academic_background.update_academic_background")}
					</DialogTitle>
				</DialogHeader>
				<Card className="p-4">
					<form
						onSubmit={form.handleSubmit(submit)}
						className="flex flex-col gap-4"
					>
						<div className="flex gap-4">
							<Controller
								control={form.control}
								name="degree"
								render={({ field, fieldState }) => (
									<Field className="flex-2">
										<FieldLabel htmlFor="degree">{t("input.degree")}</FieldLabel>
										<Input
											name="degree"
											placeholder={t("placeholder.degree")}
											value={field.value}
											onChange={field.onChange}
										/>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>
							<Controller
								control={form.control}
								name="degree_level"
								render={({ field, fieldState }) => (
									<Field className="flex-1">
										<FieldLabel htmlFor="degree_level">
											{t("input.degree_level")}
										</FieldLabel>
										<Select
											name="degree_level"
											value={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger>
												<SelectValue
													placeholder={t("placeholder.degree_level")}
												/>
											</SelectTrigger>
											<SelectContent>
												{isLoading && <Spinner />}
												{!isLoading &&
													degreeLevelList.length > 0 &&
													degreeLevelList.map((item) => (
														<SelectItem key={item.value} value={item.value}>
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
						<Controller
							control={form.control}
							name="institution"
							render={({ field, fieldState }) => (
								<Field className="flex-2">
									<FieldLabel htmlFor="institution">
										{t("input.institution")}
									</FieldLabel>
									<Input
										name="institution"
										placeholder={t("placeholder.institution")}
										value={field.value}
										onChange={field.onChange}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="certificate"
							render={({ field }) => (
								<div className="flex flex-col gap-2">
									<Label>{t("input.certificate")}</Label>
									<input
										ref={fileInputRef}
										type="file"
										accept="application/pdf"
										className="hidden"
										id="certificate-input"
										onChange={(e) => {
											const file = e.target.files?.[0];
											field.onChange(file);
											e.target.value = "";
										}}
									/>

									{!field.value && (
										<label
											htmlFor="certificate-input"
											className="w-full h-24 rounded-lg border-2 border-dashed border-primary/60 text-primary flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted"
										>
											<File />
											<p className="text-sm">{t("placeholder.certificate")}</p>
										</label>
									)}

									{field.value && (
										<div className="w-full p-3 rounded-lg border flex items-center justify-between">
											<span className="text-sm truncate max-w-[60%]">
												{field.value.name}
											</span>

											<div className="flex gap-2">
												<label htmlFor="certificate-input">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => fileInputRef.current?.click()}
													>
														{t("general.change")}
													</Button>
												</label>

												<Button
													type="button"
													variant="destructive"
													size="sm"
													onClick={() => {
														field.onChange(undefined);

														if (fileInputRef.current) {
															fileInputRef.current.value = "";
														}
													}}
												>
													{t("general.remove")}
												</Button>
											</div>
										</div>
									)}
									<p className="text-xs text-muted-foreground">
										{t("dev_profile.academic_background.update_warning")}
									</p>
								</div>
							)}
						/>
						<Button disabled={isPending}>
							{isPending ? <Spinner /> : t("general.update")}
						</Button>
					</form>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
