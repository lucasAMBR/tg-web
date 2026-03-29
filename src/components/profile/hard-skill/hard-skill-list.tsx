import { getIndexHardSkillQueryKey, useDeleteHardSkill, useIndexHardSkill } from "@/api/generated/hard-skill-doc/hard-skill-doc";
import { Spinner } from "../../ui/spinner";
import HardSkillCard from "./hard-skill-card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../ui/empty";
import { Brackets, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import CreateHardSkillModal from "./create_hard-skill-dialog";
import { useState } from "react";
import type { HardSkillModel } from "@/api/generated/models";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";
import { CustomToaster } from "@/utils/custom-toaster";
import { useQueryClient } from "@tanstack/react-query";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import type { ApiError } from "@/utils/api-error";
import UpdateHardskillModal from "./update_hard_skill_dialog";

interface HardSkillListPorps{
    profileId: string
}

export default function HardSkillList({ profileId }: HardSkillListPorps){

    const queryClient = useQueryClient();

    const [ selectedHardSkill, setSelectedhardSkill ] = useState<HardSkillModel | null>(null);

    const [ deleteModalIsOpen, setDeleteModalIsOpen ] = useState(false);
    const [ updateModalIsOpen, setUpdateModalIsOpen ] = useState(false);

    const openDeleteModal = (hardSkill: HardSkillModel) => {
        setSelectedhardSkill(hardSkill);
        setDeleteModalIsOpen(true);
    }

    const closeDeleteModal = () => {
        setSelectedhardSkill(null);
        setDeleteModalIsOpen(false);
    }

    const openUpdateModal = (hardSkill: HardSkillModel) => {
        setSelectedhardSkill(hardSkill);
        setUpdateModalIsOpen(true);
    }

    const closeUpdateModal = () => {
        setSelectedhardSkill(null);
        setUpdateModalIsOpen(false);
    }

    const {
        mutate: deleteHardSkill,
        isPending: deleteIsPending
    } = useDeleteHardSkill();

    const handleDelete = () => {
        if(!selectedHardSkill) return;

        deleteHardSkill({ id: selectedHardSkill.id }, {
            onSuccess: (success) => {
                CustomToaster.successToast(success.message);

                queryClient.invalidateQueries({queryKey: getIndexHardSkillQueryKey({ dev_profile_id: profileId })});
                closeDeleteModal();
            },
            onError: (error) => {
                onError(error as AxiosError<ApiError>);
            }
        })
    }

    const {
        data: hardSkill,
        isLoading
    } = useIndexHardSkill({ dev_profile_id: profileId });

    const hardSkillList = hardSkill?.data ?? [];

    return(
        <div className="w-full flex flex-col gap-4">
            <h2 className='text-3xl flex justify-between'>
                <span className="font-[Anta]">
                    Hard skills
                </span>
                <CreateHardSkillModal existingHardSkills={hardSkillList} profileId={profileId}>
                    <Button>
                        <Plus /> Create
                    </Button>
                </CreateHardSkillModal>
            </h2>
            <div className="flex flex-col gap-2">
                    {isLoading && (
                        <div className="flex items-center justify-center">
                            <Spinner /> loading...
                        </div>  
                    )}
                    {!isLoading && hardSkillList.length < 1 && (
                        <Card className="p-0">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant={"icon"}>
                                        <Brackets />
                                    </EmptyMedia>
                                    <EmptyTitle>No hard skill yet</EmptyTitle>
                                    <EmptyContent></EmptyContent>
                                    <EmptyDescription>You haven&apos;t registered any skills yet. Get started by creating your first skill, they are used by our recommendation algorithm</EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button>Register</Button>
                                </EmptyContent>
                            </Empty>
                        </Card>
                    )}
                    {!isLoading && hardSkillList.map((skill) => (
                        <HardSkillCard key={skill.id} openDelete={openDeleteModal} openUpdate={openUpdateModal} hardSkill={skill} />
                    ))}
            </div>
            {deleteModalIsOpen && selectedHardSkill !== null && (
                <AlertDialog open={deleteModalIsOpen} onOpenChange={setDeleteModalIsOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete hard skill</AlertDialogTitle>
                            <AlertDialogDescription>Delete a hard skill from your profile</AlertDialogDescription>
                        </AlertDialogHeader>
                        <p>Are you sure? This action is permanent and this hard skill will not be used anymore by out algorithm</p>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button 
                                onClick={ handleDelete } 
                                variant={"destructive"}
                                disabled={deleteIsPending}
                            >
                                { deleteIsPending ? <Spinner /> : "Delete" }
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {updateModalIsOpen && selectedHardSkill !== null && (
                <UpdateHardskillModal 
                    dialogIsOpen={updateModalIsOpen} 
                    setDialogOpen={setUpdateModalIsOpen} 
                    hardSkill={selectedHardSkill} 
                    existingHardSkills={hardSkillList} 
                    profileId={profileId}
                />
            )}
        </div>
    );
}