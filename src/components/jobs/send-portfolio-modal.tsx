import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUpdatePortfolioSolicitation } from "@/api/generated/portfolio-solicitation/portfolio-solicitation";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import {
	type ISendPortfolioSchema,
	SendPortfolioSchema,
} from "@/schemas/portfolio-solicitation/SendPortfolioSchema";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

interface SendPortfolioModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	solicitationId: string;
}

export default function SendPortfolioModal({
	open,
	onOpenChange,
	solicitationId,
}: SendPortfolioModalProps) {
	const { t } = useTranslation();

	const queryClient = useQueryClient();

	const form = useForm<ISendPortfolioSchema>({
		resolver: zodResolver(SendPortfolioSchema),
		defaultValues: { portfolio_url: "" },
	});

	const { mutate: sendPortfolio, isPending } = useUpdatePortfolioSolicitation();

	const submit = (data: ISendPortfolioSchema) => {
		sendPortfolio(
			{ id: solicitationId, data },
			{
				onSuccess: () => {
					CustomToaster.successToast(t("toast.success.portfolio_sent"));

					// A candidatura carrega a solicitação, então a listagem precisa ser refeita
					queryClient.invalidateQueries({
						queryKey: ["/dev-vacancy/my-applies"],
					});

					form.reset();
					onOpenChange(false);
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("my_applies.portfolio.send")}</DialogTitle>
					<DialogDescription>
						{t("my_applies.portfolio.send_modal_description")}
					</DialogDescription>
				</DialogHeader>
				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit(submit)}
				>
					<Controller
						control={form.control}
						name="portfolio_url"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>{t("input.portfolio_url")}</FieldLabel>
								<Input
									placeholder={t("placeholder.portfolio_url")}
									{...field}
								/>
								{fieldState.error && (
									<FieldError>{fieldState.error.message}</FieldError>
								)}
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
