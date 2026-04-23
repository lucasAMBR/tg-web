import { getIndexAdditionalCoursesQueryKey, useDeleteAdditionalCourse } from "@/api/generated/additional-courses-doc/additional-courses-doc";
import type { AdditionalCourseModel } from "@/api/generated/models";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCertificationParams } from "@/hooks/filters/use-certification-params";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteCertificationModalProps{
    certificate: AdditionalCourseModel | null
    profileId: string,
    closeModal: () => void,
    open: boolean,
    openChange: (open: boolean) => void
}

export default function DeleteCertificationModal({ certificate, profileId, open, openChange, closeModal }: DeleteCertificationModalProps) {

    if (!certificate) return null;

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
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);
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
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action is permanent!
					</AlertDialogDescription>
                </AlertDialogHeader>
                <p className="text-sm">
					If you remove an academic background, this register will not be used
					by out recommendation algorithm
				</p>
                <AlertDialogFooter>
					<Button variant={"outline"} onClick={closeModal}>
						Cancel
					</Button>
					<Button
						variant={"destructive"}
						onClick={handleDelete}
						disabled={isPending}
					>
						{isPending ? <Spinner /> : "Delete"}
					</Button>
				</AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}