import type { AddressModel, CompanyProfileModel } from "@/api/generated/models";
import { getIndexCompanyProfileQueryKey } from "@/api/generated/profiles-doc/profiles-doc";
import CompanyUpdateProfileForm from "@/components/settings/company-update-profile-form";
import UpdateAddressForm from "@/components/settings/update-address-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

type AdminCompanyProfile = CompanyProfileModel & {
	is_blocked?: boolean;
	address?: AddressModel | null;
};

interface AdminUpdateCompanyProfileDialogProps {
	company: AdminCompanyProfile | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AdminUpdateCompanyProfileDialog({
	company,
	open,
	onOpenChange,
}: AdminUpdateCompanyProfileDialogProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	if (!company) return null;

	const invalidateCompanies = () => {
		queryClient.invalidateQueries({ queryKey: getIndexCompanyProfileQueryKey() });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("general.edit_profile")}</DialogTitle>
					<DialogDescription>{company.name}</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					{open && (
						<>
							<div>
								<h3 className="text-lg font-medium mb-5">
									{t("general.profile")}
								</h3>
								<CompanyUpdateProfileForm
									key={company.id}
									profile={company}
									onSuccess={invalidateCompanies}
								/>
							</div>

							{company.address && (
								<>
									<Separator />
									<div>
										<h3 className="text-lg font-medium mb-5">
											{t("general.address")}
										</h3>
										<UpdateAddressForm
											key={company.address.id}
											initialAddress={company.address}
											onSuccess={invalidateCompanies}
										/>
									</div>
								</>
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
