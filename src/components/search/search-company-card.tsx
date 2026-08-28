import type { CompanyProfileResource } from "@/api/generated/models";
import { useNavigate } from "@tanstack/react-router";
import { Building } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface SearchCompanyCardProps {
	company: CompanyProfileResource;
}

export default function SearchCompanyCard({ company }: SearchCompanyCardProps) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	return (
		<Card
			onClick={() =>
				navigate({ to: "/companies/$id", params: { id: company.id } })
			}
			className="w-full flex flex-row items-center gap-4 p-4 cursor-pointer hover:border-primary"
		>
			<Avatar className="size-14">
				{company.profile_pic && (
					<AvatarImage
						src={company.profile_pic}
						alt={company.name}
						className="object-cover"
					/>
				)}
				<AvatarFallback className="bg-primary text-primary-foreground">
					<Building className="size-7" />
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex flex-col gap-1">
				<p className="font-medium">{company.name}</p>
				<div className="flex flex-wrap gap-2">
					<Badge variant={"secondary"}>
						{t(`enum.operational_segment.${company.operational_segment}`)}
					</Badge>
					{company.address && (
						<Badge className="bg-accent text-accent-foreground">
							{company.address.city} - {company.address.state}
						</Badge>
					)}
				</div>
				<p className="text-sm text-muted-foreground line-clamp-2">
					{company.bio}
				</p>
			</div>
		</Card>
	);
}
