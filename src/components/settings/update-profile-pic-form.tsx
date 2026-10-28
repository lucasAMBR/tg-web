import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";

import { useUserUserUpdate1 } from "@/api/generated/user/user";
import { ProfilePicInput } from "@/components/global/inputs/profile-pic-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/utils/api-error";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";

export default function UpdateProfilePicForm() {
	const { t } = useTranslation();

	const { user, hydrateUser } = useAuthStore();

	const [profilePic, setProfilePic] = useState<File | null>(null);

	const { mutate, isPending } = useUserUserUpdate1();

	const handleUpdate = () => {
		if (!profilePic) return;

		mutate(
			{ id: user?.id as string, data: { profile_pic: profilePic } },
			{
				onSuccess: async () => {
					CustomToaster.successToast(t("toast.success.profile_pic_updated"));
					setProfilePic(null);
					await hydrateUser();
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<div className="flex flex-col items-start gap-4">
			<ProfilePicInput
				value={profilePic}
				onChange={setProfilePic}
				currentUrl={user?.profile_pic}
				disabled={isPending}
			/>
			<Button type="button" disabled={!profilePic || isPending} onClick={handleUpdate}>
				{isPending ? <Spinner /> : t("general.save")}
			</Button>
		</div>
	);
}
