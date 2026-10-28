import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFreelancePermissions } from "@/hooks/use-freelance-permissions";
import type { FreelanceVacancy } from "@/types/freelance";
import DeleteFreelanceVacancyDialog from "./delete-freelance-vacancy-dialog";
import EditFreelanceVacancyDialog from "./edit-freelance-vacancy-dialog";

interface FreelanceVacancyOwnerMenuProps {
	vacancy: FreelanceVacancy;
}

/** Editar e remover direto do card em "Meus Freelances", só com o freela `open`. */
export default function FreelanceVacancyOwnerMenu({
	vacancy,
}: FreelanceVacancyOwnerMenuProps) {
	const { t } = useTranslation();

	const { canEditVacancy, canDeleteVacancy } = useFreelancePermissions();

	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const canEdit = canEditVacancy(vacancy);
	const canDelete = canDeleteVacancy(vacancy);

	if (!canEdit && !canDelete) return null;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" aria-label={t("general.actions")}>
						<EllipsisVertical className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="bottom" align="end">
					<DropdownMenuLabel>{t("general.actions")}</DropdownMenuLabel>
					<DropdownMenuGroup>
						{canEdit && (
							<DropdownMenuItem onSelect={() => setEditOpen(true)}>
								<Pencil className="size-4" />
								{t("freelance.details.edit")}
							</DropdownMenuItem>
						)}
						{canDelete && (
							<DropdownMenuItem
								variant="destructive"
								onSelect={() => setDeleteOpen(true)}
							>
								<Trash2 className="size-4" />
								{t("freelance.details.remove")}
							</DropdownMenuItem>
						)}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			{canEdit && (
				<EditFreelanceVacancyDialog
					vacancy={vacancy}
					open={editOpen}
					onOpenChange={setEditOpen}
				/>
			)}
			{canDelete && (
				<DeleteFreelanceVacancyDialog
					vacancy={vacancy}
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
				/>
			)}
		</>
	);
}
