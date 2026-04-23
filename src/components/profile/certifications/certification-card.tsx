import type { AdditionalCourseModel } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical, School, Trash } from "lucide-react";

interface CertificationCardProps {
    profileId: string,
    certificate: AdditionalCourseModel,
    openUpdate: (cert: AdditionalCourseModel) => void,
    openDelete: (cert: AdditionalCourseModel) => void
}

export default function CertificationCard({
    profileId, 
    certificate, 
    openDelete, 
    openUpdate
}: CertificationCardProps){

    return(
    <Card className="p-4">
			<CardHeader className="p-0 m-0">
				<div className="flex justify-between">
					<div className="flex flex-col gap-2">
						<CardTitle className="flex items-center gap-2">
							{certificate.name}
						</CardTitle>
						<CardDescription className="flex gap-4">
							<span className="text-md font-normal text-muted-foreground flex items-start center gap-1">
								<School className="size-5" />
								{certificate.provider}
							</span>
						</CardDescription>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size={"icon"} variant={"ghost"}>
								<EllipsisVertical />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => openUpdate(certificate)}>
									<Edit /> Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={() => openDelete(certificate)}
								>
									<Trash /> Delete
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
		</Card>
    )
}