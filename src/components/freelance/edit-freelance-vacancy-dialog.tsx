import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { FreelanceVacancy } from "@/types/freelance";
import FreelanceVacancyForm from "./freelance-vacancy-form";

interface EditFreelanceVacancyDialogProps {
	vacancy: FreelanceVacancy;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function EditFreelanceVacancyDialog({
	vacancy,
	open,
	onOpenChange,
}: EditFreelanceVacancyDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>{t("freelance.edit_title")}</DialogTitle>
				</DialogHeader>
				{/* Remonta a cada abertura para o formulário partir da vaga atual */}
				{open && (
					<FreelanceVacancyForm
						vacancy={vacancy}
						onSuccess={() => onOpenChange(false)}
						onCancel={() => onOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
