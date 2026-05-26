import { useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldTitle,
} from "../ui/field";
import { Button } from "../ui/button";
import {
	CheckIcon,
	ChevronLeft,
	ChevronRight,
	EyeIcon,
	EyeOffIcon,
	XIcon,
} from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	RegisterSchema,
	type IRegisterSchema,
} from "@/schemas/register/RegisterSchema";
import { useAuthRegister } from "@/api/generated/auth/auth";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { Spinner } from "../ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterSteps() {
	const navigate = useNavigate();

	const { signIn } = useAuthStore();

	const { t } = useTranslation();

	const [step, setStep] = useState<"role" | "data">("role");

	const requirements = useMemo(
		() =>
			[
				{ regex: /.{8,}/, key: "auth.register.password.requirements.min_length" },
				{ regex: /[a-z]/, key: "auth.register.password.requirements.lowercase" },
				{ regex: /[A-Z]/, key: "auth.register.password.requirements.uppercase" },
				{ regex: /[0-9]/, key: "auth.register.password.requirements.number" },
				{
					regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
					key: "auth.register.password.requirements.special",
				},
			] as const,
		[],
	);

	const { mutateAsync, isPending } = useAuthRegister();

	const form = useForm<IRegisterSchema>({
		resolver: zodResolver(RegisterSchema),
		shouldUnregister: false,
		defaultValues: {
			email: "",
			password: "",
			role: "dev",
		},
	});

	const passwordValue = useWatch({
		control: form.control,
		name: "password",
		defaultValue: "",
	});

	const passwordTooShort = passwordValue.length < 8;

	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => setIsVisible((prevState) => !prevState);

	const strength = requirements.map((req) => ({
		met: req.regex.test(passwordValue),
		key: req.key,
	}));

	const strengthScore = useMemo(() => {
		return strength.filter((req) => req.met).length;
	}, [strength]);

	const getColor = (score: number) => {
		if (score === 0) return "bg-border";
		if (score <= 1) return "bg-destructive";
		if (score <= 2) return "bg-orange-500 ";
		if (score <= 3) return "bg-amber-500";
		if (score === 4) return "bg-yellow-400";

		return "bg-green-500";
	};

	const strengthLabelKey = (score: number) => {
		if (score === 0) return "auth.register.password.strength.empty";
		if (score <= 2) return "auth.register.password.strength.weak";
		if (score <= 3) return "auth.register.password.strength.medium";
		if (score === 4) return "auth.register.password.strength.strong";
		return "auth.register.password.strength.very_strong";
	};


	const register = async (data: IRegisterSchema) => {
		await mutateAsync(
			{ data },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.register"));
				},
				onError: (error) => {
					const apiError = error as AxiosError<ApiError>;

					CustomToaster.errorToast(
						apiError.response?.data.message ?? "Something goes wrong!",
					);
				},
			},
		);
		try {
			await signIn({ email: data.email, password: data.password });

			const { user } = useAuthStore.getState();

			if (!user) return;

			const role = user.role[0];

			const hasProfile =
				(role === "dev" && user.dev_profile) ||
				(role === "company" && user.company_profile) ||
				(role === "client" && user.client_profile);

			if (!hasProfile) {
				navigate({ to: `/create/profile/${role}` });
				return;
			}

			const homeRoutes = {
				dev: "/home",
				company: "/home",
				client: "/home",
			};

			navigate({ to: homeRoutes[role] || "/dashboard" });
		} catch (error) {}
	};

	const redirectToLogin = () => {
		navigate({ to: "/auth/login" });
	};

	return (
		<div className="flex flex-col items-center justify-center">
			<form
				id="login-form"
				onSubmit={form.handleSubmit(register)}
				className="flex flex-col items-center justify-center w-[500px]"
			>
				{step === "role" ? (
					<>
						<h1 className="text-3xl font-[Anta] text-primary">
							{t("auth.register.title")}
						</h1>
						<p className="max-w-120 text-center text-sm mt-2">
							{t("auth.register.description")}
						</p>
						<Controller
							control={form.control}
							name="role"
							render={({ field }) => (
								<RadioGroup
									onValueChange={field.onChange}
									value={field.value}
									className="gap-2 my-6 w-full p-0"
								>
									<FieldLabel htmlFor="dev" className="m-0 p-0">
										<Field
											className="cursor-pointer hover:bg-primary/5"
											orientation={"horizontal"}
										>
											<FieldContent>
												<FieldTitle>{t("auth.register.role.dev.title")}</FieldTitle>
												<FieldDescription>
													{t("auth.register.role.dev.description")}
												</FieldDescription>
											</FieldContent>
											<RadioGroupItem value="dev" id="dev" />
										</Field>
									</FieldLabel>
									<FieldLabel htmlFor="company" className="m-0 p-0">
										<Field
											className="cursor-pointer hover:bg-primary/5"
											orientation={"horizontal"}
										>
											<FieldContent>
												<FieldTitle>{t("auth.register.role.company.title")}</FieldTitle>
												<FieldDescription>
													{t("auth.register.role.company.description")}
												</FieldDescription>
											</FieldContent>
											<RadioGroupItem value="company" id="company" />
										</Field>
									</FieldLabel>
									<FieldLabel htmlFor="client" className="m-0 p-0">
										<Field
											className="cursor-pointer hover:bg-primary/5"
											orientation={"horizontal"}
										>
											<FieldContent>
												<FieldTitle>{t("auth.register.role.client.title")}</FieldTitle>
												<FieldDescription>
													{t("auth.register.role.client.description")}
												</FieldDescription>
											</FieldContent>
											<RadioGroupItem value="client" id="client" />
										</Field>
									</FieldLabel>
								</RadioGroup>
							)}
						/>
						<Button
							type="button"
							className="w-full"
							onClick={() => setStep("data")}
						>
							{t("auth.register.button.next")} <ChevronRight />
						</Button>
						<p className="text-sm flex gap-1 mt-1">
							{t("auth.register.already_have_account")}
							<span
								onClick={redirectToLogin}
								className="underline text-primary cursor-pointer"
							>
								{t("auth.register.sing_in_here")}
							</span>
						</p>
					</>
				) : (
					<>
						<h1 className="text-3xl font-[Anta] text-primary">
							{t("auth.register.second_step_title")}
						</h1>
						<p className="max-w-120 text-center text-sm mt-2">
							{t("auth.register.second_step_description")}
						</p>
						<div className="flex flex-col gap-4 mt-6 w-full">
							<Controller
								control={form.control}
								name="email"
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel className="w-full" htmlFor="email">
											{t("input.email")}
										</FieldLabel>
										<Input
											{...field}
											aria-invalid={fieldState.invalid}
											name="email"
											className="w-full"
											placeholder="john_doe@email.com"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								control={form.control}
								name="password"
								render={({ field, fieldState }) => (
									<Field className="w-full">
										<FieldLabel htmlFor={"password"}>{t("input.password")}</FieldLabel>
										<div className="relative">
											<Input
												{...field}
												id={"password"}
												type={isVisible ? "text" : "password"}
												placeholder="••••••••"
												className="pr-9"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={toggleVisibility}
												className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
											>
												{isVisible ? <EyeOffIcon /> : <EyeIcon />}
												<span className="sr-only">
													{isVisible ? "Hide password" : "Show password"}
												</span>
											</Button>
										</div>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
										<div className="mb-4 flex h-1 w-full gap-1">
											{Array.from({ length: 5 }).map((_, index) => (
												<span
													key={index}
													className={cn(
														"h-full flex-1 rounded-full transition-all duration-500 ease-out",
														index < strengthScore
															? getColor(strengthScore)
															: "bg-border",
													)}
												/>
											))}
										</div>

										<p className="text-foreground text-sm font-medium">
											{t(strengthLabelKey(strengthScore))}.{" "}
											{t("auth.register.password.requirements_title")}
										</p>

										<ul className="mb-4 space-y-1.5">
											{strength.map((req, index) => (
												<li key={index} className="flex items-center gap-2">
													{req.met ? (
														<CheckIcon className="size-4 text-green-600 dark:text-green-400" />
													) : (
														<XIcon className="text-muted-foreground size-4" />
													)}
													<span
														className={cn(
															"text-xs",
															req.met
																? "text-green-600 dark:text-green-400"
																: "text-muted-foreground",
														)}
													>
														{t(req.key)}
														<span className="sr-only">
															{req.met
																? t("auth.register.password.a11y.requirement_met")
																: t(
																		"auth.register.password.a11y.requirement_not_met",
																	)}
														</span>
													</span>
												</li>
											))}
										</ul>
									</Field>
								)}
							/>
							<div className="flex gap-3 items-center mb-8">
								<Checkbox />{" "}
								<Label>
									{t("auth.register.terms_text")}
									<span className="underline text-primary cursor-pointer">
										{t("auth.register.usage_terms_text")}
									</span>{" "}
									{t("auth.register.and_text")}
									<span className="underline text-primary cursor-pointer">
										{t("auth.register.privacy_policy_text")}
									</span>
								</Label>
							</div>
							<div className="w-full flex flex-col justify-center items-center gap-2">
								<Button
									type="button"
									className="w-full"
									variant={"outline"}
									onClick={() => setStep("role")}
								>
									{" "}
									<ChevronLeft /> {t("auth.register.button.back_to_roles")}
								</Button>
								<Button
									type="submit"
									className="w-full"
									disabled={isPending || passwordTooShort}
								>
									{isPending ? <Spinner /> : t("auth.register.button.register")}
								</Button>
								<p className="text-sm flex gap-1">
									{t("auth.register.already_have_account")}
									<span
										onClick={redirectToLogin}
										className="underline text-primary cursor-pointer"
									>
										{t("auth.register.sing_in_here")}
									</span>
								</p>
							</div>
						</div>
					</>
				)}
			</form>
		</div>
	);
}
