import type { DevProfileResource } from "@/api/generated/models";
import { useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface SearchDevCardProps {
	dev: DevProfileResource;
}

export default function SearchDevCard({ dev }: SearchDevCardProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	return (
		<Card
			onClick={() => navigate({ to: "/devs/$id", params: { id: dev.id } })}
			className="w-full flex flex-row items-center gap-4 p-4 cursor-pointer hover:border-primary"
		>
			<Avatar className="size-14">
				{dev.profile_pic && (
					<AvatarImage
						src={dev.profile_pic}
						alt={dev.name}
						className="object-cover"
					/>
				)}
				<AvatarFallback className="bg-primary text-primary-foreground">
					<User className="size-7" />
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex flex-col gap-1">
				<p className="font-medium">{dev.name}</p>
				<div className="flex flex-wrap gap-2">
					<Badge variant={"secondary"}>{t(dev.specialty_label)}</Badge>
					<Badge className="bg-accent text-accent-foreground">
						{t(`enum.seniority_level.${dev.seniority_level}`)}
					</Badge>
					{dev.open_to_work && <Badge>{t("input.open_to_work")}</Badge>}
				</div>
				<p className="text-sm text-muted-foreground line-clamp-2">{dev.bio}</p>
			</div>
		</Card>
	);
}
