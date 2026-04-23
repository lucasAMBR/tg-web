import {
	getIndexAcademicBackgroundQueryKey,
	useStoreAcademicBackground,
} from "@/api/generated/academic-background-doc/academic-background-doc";
import { useEnumDegreeLevel } from "@/api/generated/enums/enums";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { File, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface CreateAcademicBackgroundCardProps {
	profileId: string;
}

export default function CreateAcademicBackgroundCard({
	profileId,
}: CreateAcademicBackgroundCardProps) {
	const queryClient = useQueryClient();

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const { page, perPage, search, setFilterParams } =
		useAcademicBackgroundParams();

	const cleanFilters = () =>
		setFilterParams({ page: 1, perPage: 10, search: "" });

	const form = useForm<ICreateAcademicBackgroundSchema>({
		resolver: zodResolver(CreateAcademicBackgroundSchema),
		defaultValues: {
			degree: "",
			degree_level: "",
			institution: "",
			certificate: undefined,
		},
	});

	const { data: degreeLevel, isLoading } = useEnumDegreeLevel();

	const degreeLevelList = degreeLevel?.data ?? [];

	const { mutate: create, isPending } = useStoreAcademicBackground();

	const submit = (data: ICreateAcademicBackgroundSchema) => {
		create(
			{ data },
			{
				onSuccess: (success) => {
					CustomToaster.successToast(success.message);

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
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<Dialog>
			<DialogTrigger>
				<Button>
					<Plus /> Register
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add new academic background</DialogTitle>
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
										<FieldLabel htmlFor="degree">Degree</FieldLabel>
										<Input
											name="degree"
											placeholder="Software Engineer"
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
										<FieldLabel htmlFor="degree_level">Degree Level</FieldLabel>
										<Select
											name="degree_level"
											value={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger>
												<SelectValue placeholder="Degree Level" />
											</SelectTrigger>
											<SelectContent>
												{isLoading && <Spinner />}
												{!isLoading &&
													degreeLevelList.length > 0 &&
													degreeLevelList.map((item) => (
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
						<Controller
							control={form.control}
							name="institution"
							render={({ field, fieldState }) => (
								<Field className="flex-2">
									<FieldLabel htmlFor="institution">Institution</FieldLabel>
									<Input
										name="institution"
										placeholder="Universidade de São paulo"
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
									<Label>Certificate</Label>

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
											<p className="text-sm">Select a PDF file</p>
										</label>
									)}

									{field.value && (
										<div className="w-full p-3 rounded-lg border flex items-center justify-between">
											<span className="text-sm truncate max-w-[60%]">
												{field.value.name}
											</span>

											<div className="flex gap-2">
												{/* alterar */}
												<label htmlFor="certificate-input">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => fileInputRef.current?.click()}
													>
														Change
													</Button>
												</label>

												{/* remover */}
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
													Remove
												</Button>
											</div>
										</div>
									)}
								</div>
							)}
						/>
						<Button disabled={isPending}>
							{isPending ? <Spinner /> : "Register"}
						</Button>
					</form>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
