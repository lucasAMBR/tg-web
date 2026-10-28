import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface CreateVacancyCardProps {
	creationIsOpen: boolean;
	onToggle: () => void;
}

export default function CreateVacancyCard({
	creationIsOpen,
	onToggle,
}: CreateVacancyCardProps) {
	const { t } = useTranslation();

	return (
		<Card className="p-4 flex-row items-center justify-between">
			<h2 className="font-bold text-lg">{t("my_vacancies.create_title")}</h2>
			<Button size={"icon"} onClick={onToggle}>
				<Plus
					className={
						creationIsOpen
							? "rotate-45 transition-all duration-75"
							: "transition-all duration-75"
					}
				/>
			</Button>
		</Card>
	);
}
