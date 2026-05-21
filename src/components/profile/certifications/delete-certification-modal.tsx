import { getIndexAdditionalCoursesQueryKey, useDeleteAdditionalCourse } from "@/api/generated/additional-courses-doc/additional-courses-doc";
import type { AdditionalCourseModel } from "@/api/generated/models";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCertificationParams } from "@/hooks/filters/use-certification-params";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface DeleteCertificationModalProps{
    certificate: AdditionalCourseModel | null
    profileId: string,
    closeModal: () => void,
    open: boolean,
    openChange: (open: boolean) => void
}

export default function DeleteCertificationModal({ certificate, profileId, open, openChange, closeModal }: DeleteCertificationModalProps) {

    if (!certificate) return null;

    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const {
        page,
        perPage,
        search,
        setFilterParams
    } = useCertificationParams();

    const {
        mutate: deleteCertificate,
        isPending
    } = useDeleteAdditionalCourse();

    const handleDelete = () => {
        deleteCertificate({id: certificate.id }, {
            onSuccess: () => {
                CustomToaster.successToast(t("toast.success.certification_deleted"));
                queryClient.invalidateQueries({
                    queryKey: getIndexAdditionalCoursesQueryKey({
                        dev_profile_id: profileId, 
                        page, 
                        per_page: perPage, 
                        search
                    })
                });

                setFilterParams({page: 1, perPage: 10, search: ""})

                closeModal();
            }
        });
    }

    return(
        <AlertDialog open={open} onOpenChange={openChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
					<AlertDialogTitle>{t("dev_profile.certifications.delete_certification")}</AlertDialogTitle>
					<AlertDialogDescription>
						{t("dev_profile.certifications.delete_certification_subtitle")}
					</AlertDialogDescription>
                </AlertDialogHeader>
                <p className="text-sm">
                	{t("dev_profile.certifications.delete_certification_description")}
				</p>
                <AlertDialogFooter>
					<Button variant={"outline"} onClick={closeModal}>
						{t("general.cancel")}
					</Button>
					<Button
						variant={"destructive"}
						onClick={handleDelete}
						disabled={isPending}
					>
						{isPending ? <Spinner /> : t("general.delete")}
					</Button>
				</AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}