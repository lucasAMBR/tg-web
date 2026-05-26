import { AlertTriangle } from "lucide-react";
import { Card } from "../ui/card";
import { useTranslation } from "react-i18next";

export default function UnderConstruction() {

	const { t } = useTranslation();
	return (
		<Card className="p-4 py-8 items-center justify-center">
			<div className="bg-muted flex p-3 text-primary rounded-lg">
				<AlertTriangle className="size-10" />
			</div>
			<h2 className="font-bold text-lg">
				{t("under_construction.title")}
			</h2>
			<p>{t("under_construction.description")}</p>
		</Card>
	);
}
