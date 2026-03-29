import type { PropsWithChildren } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "@tanstack/react-router";

interface LogoutButtonProps {
    text: string
}
export default function LogoutButton({
    text, 
    children
}: PropsWithChildren<LogoutButtonProps>){

    const navigate = useNavigate();

    const { signOut } = useAuthStore();

    const logout = () => {
        signOut();
        navigate({to: "/auth/login"});
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    <p>{text}</p>
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={logout} variant={"destructive"}>Logout</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}