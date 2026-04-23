import {
	getListDevSoftSkillQueryKey,
	useIndexSoftSkill,
	useStoreDevSoftSkill,
} from "@/api/generated/soft-skill-doc/soft-skill-doc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
	FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import { getSenioritySoftSkillLimit } from "@/utils/seniority-helper";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus, Save } from "lucide-react";
import { useEffect, useState, type PropsWithChildren } from "react";
import { Controller, useForm } from "react-hook-form";

type FormValues = {
	soft_skills: Record<string, string>;
};

interface RegisterSoftSkillModalProps {
	profileId: string;
}

export default function RegisterSoftSkillModal({
	profileId,
	children,
}: PropsWithChildren<RegisterSoftSkillModalProps>) {
	const queryClient = useQueryClient();

	const [modalIsOpen, setModalIsOpen] = useState(false);

	const { user } = useAuthStore();

	const form = useForm<FormValues>({
		defaultValues: {
			soft_skills: {},
		},
	});

	const { data: baseSoftSkills, isLoading } = useIndexSoftSkill();

	const { mutate, isPending } = useStoreDevSoftSkill();

	const softSkillList = baseSoftSkills?.data ?? [];

	const userPointLimits = getSenioritySoftSkillLimit(user) ?? 0;

	const watchedValues = form.watch("soft_skills");

	const calculateScore = (values: FormValues["soft_skills"]) => {
		let total = 0;

		for (const skill of softSkillList) {
			const selectedResponseId = values?.[skill.id];

			if (!selectedResponseId) continue;

			const response = skill.responses?.find(
				(r) => r.id === selectedResponseId,
			);

			if (response) {
				total += response.evaluation_weight;
			}
		}

		return total;
	};

	const allAnswered =
		Object.keys(watchedValues || {}).length === softSkillList.length;

	const currentScore = calculateScore(watchedValues);

	const isScoreValid = currentScore <= userPointLimits;

	const canSubmit = allAnswered && isScoreValid;

	const formatSoftSkillsPayload = (data: FormValues) => {
		return {
			soft_skills: Object.entries(data.soft_skills).map(
				([soft_skill_id, soft_skill_level_response_id]) => ({
					soft_skill_id,
					soft_skill_level_response_id,
				}),
			),
		};
	};

	const register = (data: FormValues) => {
		const formatted = formatSoftSkillsPayload(data);

		mutate(
			{ data: formatted },
			{
				onSuccess: (success) => {
					CustomToaster.successToast(success.message);
					queryClient.invalidateQueries({
						queryKey: getListDevSoftSkillQueryKey(profileId),
					});

					setModalIsOpen(false);
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	useEffect(() => {
		if (currentScore > userPointLimits) {
			CustomToaster.warningToast(
				"Your actual score passed the limit of seniority, please redistribute your pontuation between others soft skill",
			);
		}
	}, [currentScore]);

	return (
		<Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus /> Create
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-5/6 min-w-2/5 overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Register Soft Skills</DialogTitle>
					<DialogDescription>
						Here you can do a self evaluation about your Soft Skills
					</DialogDescription>
				</DialogHeader>
				<div className="flex w-full gap-2">
					<Card className="p-2 flex justify-center items-center flex-1 gap-2 text-sm">
						Pontuation limit based on your seniority:{" "}
						<span className="text-2xl font-black text-primary">
							{userPointLimits}
						</span>
					</Card>
					<Card className="p-2 flex justify-center items-center flex-1 gap-2 text-sm">
						Actual pontuation:{" "}
						<span className="text-2xl font-black text-primary">
							{currentScore}
						</span>
					</Card>
				</div>
				<form
					className="flex flex-col gap-2"
					onSubmit={form.handleSubmit(register)}
				>
					{softSkillList.map((softSkill) => (
						<>
							<Card className="p-3">
								<div key={softSkill.id}>
									<h3 className="font-bold text-primary">{softSkill.name}</h3>
									<p>{softSkill.description}</p>
								</div>

								<Controller
									control={form.control}
									name={`soft_skills.${softSkill.id}`}
									render={({ field }) => (
										<RadioGroup
											onValueChange={field.onChange}
											value={field.value}
											className="gap-2 my-2 w-full p-0"
										>
											{softSkill.responses != null &&
												softSkill.responses.map((response) => (
													<FieldLabel
														key={response.id}
														htmlFor={response.id}
														className="m-0 p-0"
													>
														<Field
															className="cursor-pointer hover:bg-primary/5"
															orientation="horizontal"
														>
															<FieldContent>
																<FieldTitle className="">
																	<Badge>{response.evaluation_weight}</Badge>{" "}
																	{response.title}
																</FieldTitle>
																<FieldDescription>
																	{response.description}
																</FieldDescription>
															</FieldContent>

															<RadioGroupItem
																value={response.id}
																id={response.id}
															/>
														</Field>
													</FieldLabel>
												))}
										</RadioGroup>
									)}
								/>
							</Card>
							<Separator className="my-2" />
						</>
					))}
					<DialogFooter className="mt-4">
						<Button variant={"outline"}>Cancel</Button>
						<Button disabled={!canSubmit}>
							<Save /> Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
