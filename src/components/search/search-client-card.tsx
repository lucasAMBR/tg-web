import type { ClientProfileResource } from "@/api/generated/models";
import { useNavigate } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface SearchClientCardProps {
	client: ClientProfileResource;
}

export default function SearchClientCard({ client }: SearchClientCardProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	return (
		<Card
			onClick={() => navigate({ to: "/clients/$id", params: { id: client.id } })}
			className="w-full flex flex-row items-center gap-4 p-4 cursor-pointer hover:border-primary"
		>
			<Avatar className="size-14">
				{client.profile_pic && (
					<AvatarImage
						src={client.profile_pic}
						alt={client.name}
						className="object-cover"
					/>
				)}
				<AvatarFallback className="bg-primary text-primary-foreground">
					<Users className="size-7" />
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex flex-col gap-1">
				<p className="font-medium">{client.name}</p>
				<div className="flex flex-wrap gap-2">
					<Badge variant={"secondary"}>{t("role.client")}</Badge>
				</div>
				<p className="text-sm text-muted-foreground line-clamp-2">
					{client.bio}
				</p>
			</div>
		</Card>
	);
}
