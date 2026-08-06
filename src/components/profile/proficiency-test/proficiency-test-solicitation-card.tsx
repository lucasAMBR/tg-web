import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";

import { useEnumQuestionStackBySpecialty } from "@/api/generated/enum/enum";
import { useSolicitateProficiencyTest } from "@/api/generated/proficiency-test/proficiency-test";
import { CustomToaster } from "@/utils/custom-toaster";
import { onError } from "@/utils/on-error";
import type { ApiError } from "@/utils/api-error";

import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";
import { Field, FieldLabel } from "../../ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { Spinner } from "../../ui/spinner";

interface ProficiencyTestSolicitationCardProps {
	profileId: string;
}

export default function ProficiencyTestSolicitationCard({
	profileId,
}: ProficiencyTestSolicitationCardProps) {
	const { t } = useTranslation();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [frontendStack, setFrontendStack] = useState("");
	const [backendStack, setBackendStack] = useState("");

	const { data, isLoading } = useEnumQuestionStackBySpecialty();

	const frontendOptions = data?.data.frontend ?? [];
	const backendOptions = data?.data.backend ?? [];

	const hasFrontend = frontendOptions.length > 0;
	const hasBackend = backendOptions.length > 0;

	const isValid =
		(!hasFrontend || frontendStack !== "") &&
		(!hasBackend || backendStack !== "");

	const { mutate: requestTest, isPending } = useSolicitateProficiencyTest();

	const handleRequest = () => {
		if (!isValid) return;

		requestTest(
			{
				devProfileId: profileId,
				data: {
					...(hasFrontend ? { frontend_category: frontendStack } : {}),
					...(hasBackend ? { backend_category: backendStack } : {}),
				},
			},
			{
				onSuccess: () => {
					CustomToaster.successToast(
						t("toast.success.proficiency_test_requested"),
					);
					setDialogOpen(false);
					setFrontendStack("");
					setBackendStack("");
				},
				onError: (error) => {
					onError(error as AxiosError<ApiError>);
				},
			},
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">
					{t("dev_profile.proficiency_test.solicitation_title")}
				</CardTitle>
				<CardDescription>
					{t("dev_profile.proficiency_test.solicitation_description")}
				</CardDescription>
				<CardAction className="self-center">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default" disabled={isLoading}>
                            {t("general.request")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t("dev_profile.proficiency_test.solicitation_dialog_title")}
                            </DialogTitle>
                            <DialogDescription>
                                {t(
                                    "dev_profile.proficiency_test.solicitation_dialog_description",
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-2">
                            {hasFrontend && (
                                <Field>
                                    <FieldLabel>
                                        {t("dev_profile.proficiency_test.frontend_category")}
                                    </FieldLabel>
                                    <Select
                                        value={frontendStack}
                                        onValueChange={setFrontendStack}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={t(
                                                    "dev_profile.proficiency_test.category_placeholder",
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            {frontendOptions.map((stack) => (
                                                <SelectItem key={stack.value} value={stack.value}>
                                                    {t(stack.i18n_key)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                            {hasBackend && (
                                <Field>
                                    <FieldLabel>
                                        {t("dev_profile.proficiency_test.backend_category")}
                                    </FieldLabel>
                                    <Select value={backendStack} onValueChange={setBackendStack}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={t(
                                                    "dev_profile.proficiency_test.category_placeholder",
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            {backendOptions.map((stack) => (
                                                <SelectItem key={stack.value} value={stack.value}>
                                                    {t(stack.i18n_key)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        </div>
                        <DialogFooter className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                {t("general.cancel")}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleRequest}
                                disabled={isPending || !isValid}
                            >
                                {isPending ? <Spinner /> : t("general.request")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
				</CardAction>
			</CardHeader>
		</Card>
	);
}
