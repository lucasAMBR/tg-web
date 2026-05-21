import { useState, type PropsWithChildren } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

interface LogoutButtonProps {
	text: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function LogoutButton({
	text,
	children,
	open: openProp,
	onOpenChange,
}: PropsWithChildren<LogoutButtonProps>) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { signOut } = useAuthStore();
	const [openInternal, setOpenInternal] = useState(false);

	const isControlled = openProp !== undefined;
	const open = isControlled ? openProp : openInternal;
	const setOpen = onOpenChange ?? setOpenInternal;

	const logout = () => {
		signOut();
		navigate({ to: "/auth/login" });
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			{children ? (
				<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			) : null}
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("general.are_you_sure")}</AlertDialogTitle>
					<AlertDialogDescription>{text}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{t("general.cancel")}</AlertDialogCancel>
					<AlertDialogAction onClick={logout} variant="destructive">
						{t("general.logout")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
