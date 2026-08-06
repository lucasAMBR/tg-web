import type { DevProfileResource } from "@/api/generated/models";
import { getIndexDevProfileQueryKey } from "@/api/generated/profile/profile";
import DevUpdateProfileForm from "@/components/settings/dev-update-profile-form";
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

interface AdminUpdateDevProfileDialogProps {
	dev: DevProfileResource | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AdminUpdateDevProfileDialog({
	dev,
	open,
	onOpenChange,
}: AdminUpdateDevProfileDialogProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	if (!dev) return null;

	const invalidateDevs = () => {
		queryClient.invalidateQueries({ queryKey: getIndexDevProfileQueryKey() });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("general.edit_profile")}</DialogTitle>
					<DialogDescription>{dev.name}</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					{open && (
						<>
							<div>
								<h3 className="text-lg font-medium mb-5">
									{t("general.profile")}
								</h3>
								<DevUpdateProfileForm
									key={dev.id}
									profile={dev}
									onSuccess={invalidateDevs}
								/>
							</div>

							{dev.address && (
								<>
									<Separator />
									<div>
										<h3 className="text-lg font-medium mb-5">
											{t("general.address")}
										</h3>
										<UpdateAddressForm
											key={dev.address.id}
											initialAddress={dev.address}
											onSuccess={invalidateDevs}
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
