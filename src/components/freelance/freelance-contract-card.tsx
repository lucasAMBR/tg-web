import { Link } from "@tanstack/react-router";
import { Handshake, Newspaper } from "lucide-react";
import { useTranslation } from "react-i18next";
import StartChatButton from "@/components/chat/start-chat-button";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	type FreelanceVacancy,
	getFreelanceLocale,
	proposalPriceLabel,
} from "@/types/freelance";
import { formatDateTime } from "@/utils/formatter";
import FreelanceDevSummaryRow from "./freelance-dev-summary";

interface FreelanceContractCardProps {
	vacancy: FreelanceVacancy;
	/** Quem está vendo: o cliente vê o dev contratado; o dev vê o cliente. */
	viewer: "owner" | "dev";
	/** Esconde o atalho quando o card já está na tela do feed. */
	showFeedLink?: boolean;
}

/** O orçamento aceito, que só chega para as duas pontas do contrato. */
export default function FreelanceContractCard({
	vacancy,
	viewer,
	showFeedLink = true,
}: FreelanceContractCardProps) {
	const { t, i18n } = useTranslation();

	const locale = getFreelanceLocale(i18n.language);

	const contract = vacancy.contract;

	if (!contract) return null;

	const counterpartUserId =
		viewer === "owner"
			? contract.dev_profile?.user_id
			: vacancy.profile?.user_id;

	return (
		<Card className="w-full gap-4 p-8">
			<h3 className="flex items-center gap-2 text-lg font-bold">
				<Handshake className="size-5" />
				{t("freelance.contract.title")}
			</h3>
			{viewer === "owner" ? (
				<FreelanceDevSummaryRow dev={contract.dev_profile} />
			) : (
				<p className="text-sm">
					<span className="text-muted-foreground">
						{t("freelance.contract.client")}:{" "}
					</span>
					<span className="font-medium">
						{vacancy.profile?.name ?? t("freelance.details.client_unavailable")}
					</span>
				</p>
			)}
			<div className="flex flex-col gap-1">
				<p className="text-sm text-muted-foreground">
					{t("freelance.contract.value")}
				</p>
				<p className="text-lg font-semibold">
					{proposalPriceLabel(contract, t, locale)}
				</p>
			</div>
			<div className="flex flex-col gap-1 text-sm text-muted-foreground">
				{vacancy.contracted_at && (
					<p>
						{t("freelance.contract.contracted_at", {
							date: formatDateTime(vacancy.contracted_at, { locale }),
						})}
					</p>
				)}
				{vacancy.completed_at && (
					<p>
						{t("freelance.contract.completed_at", {
							date: formatDateTime(vacancy.completed_at, { locale }),
						})}
					</p>
				)}
			</div>
			<div className="flex flex-row flex-wrap gap-2">
				{showFeedLink && (
					<Link
						to="/freelances/$id/feed"
						params={{ id: vacancy.id }}
						className={buttonVariants({ variant: "default" })}
					>
						<Newspaper className="size-4" />
						{t("freelance.details.open_feed")}
					</Link>
				)}
				<StartChatButton userId={counterpartUserId} />
			</div>
		</Card>
	);
}
