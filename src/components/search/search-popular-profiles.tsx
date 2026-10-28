import { useTopClients, useTopCompanies, useTopDevs } from "@/api/generated/search/search";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { ChevronRight, User } from "lucide-react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "../ui/skeleton";

function PopularProfilesSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            {[0, 1, 2].map((placeholder) => (
                <Card key={placeholder} className="p-4 flex-row justify-between items-center">
                    <div className="flex flex-row gap-4">
                        <Skeleton className="size-14 rounded-full" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-5 w-40" />
                            <div className="flex flex-row gap-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                    </div>
                    <Skeleton className="h-9 w-24" />
                </Card>
            ))}
        </div>
    );
}

export default function PopularProfiles() {

    const { t } = useTranslation();

    const navigate = useNavigate();

    const {
        data: devs,
        isLoading: devsIsLoading
    } = useTopDevs();

    const devList = devs?.data ?? [];

    const {
        data: companies,
        isLoading: companiesIsLoading
    } = useTopCompanies();

    const companiesList = companies?.data ?? [];

    const {
        data: clients,
        isLoading: clientIsLoading
    } = useTopClients();

    const clientList = clients?.data ?? [];

    return (
        <aside className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">{t("search.popular.best_scored_devs")}</h2>
                {devsIsLoading && <PopularProfilesSkeleton />}
                {!devsIsLoading && devList.length == 0 && (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant={"icon"}>
                                <User />
                            </EmptyMedia>
                            <EmptyTitle>{t("general.no_results")}</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                )}
                {!devsIsLoading && devList.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {devList.map((dev) => (
                            <Card key={dev.id} className="p-4 flex-row justify-between items-center">
                                 <div className="flex flex-row gap-4">
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
                                    <div className="flex flex-col gap-2">
                                        <span className="flex flex-row gap-4 text-md font-semibold">{dev.name}<Badge variant={"destructive"}>{t("search.score")}: {dev.score}</Badge></span>
                                        <div className="flex flex-row gap-2">
                                            <Badge variant={"secondary"}>{t(dev.specialty_label)}</Badge>
                                            <Badge variant={"default"}>{t(`enum.seniority_level.${dev.seniority_level}`)}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant={"accent"}
                                    onClick={() => navigate({ to: "/devs/$id", params: { id: dev.id } })}
                                >
                                    {t("general.visit")} <ChevronRight />
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">{t("search.popular.best_scored_companies")}</h2>
                {companiesIsLoading && <PopularProfilesSkeleton />}
                {!companiesIsLoading && companiesList.length == 0 && (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant={"icon"}>
                                <User />
                            </EmptyMedia>
                            <EmptyTitle>{t("general.no_results")}</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                )}
                {!companiesIsLoading && companiesList.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {companiesList.map((company) => (
                            <Card key={company.id} className="p-4 flex-row justify-between items-center">
                                 <div className="flex flex-row gap-4">
                                    <Avatar className="size-14">
                                        {company.profile_pic && (
                                            <AvatarImage
                                                src={company.profile_pic}
                                                alt={company.name}
                                                className="object-cover"
                                            />
                                        )}
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            <User className="size-7" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-2">
                                        <span className="flex flex-row gap-4 text-md font-semibold"><p className="truncate">{company.name}</p><Badge variant={"destructive"}>{t("search.score")}: {company.score}</Badge></span>
                                        <div className="flex flex-row gap-2">
                                            <Badge variant={"default"}>
                                                {t(`enum.operational_segment.${company.operational_segment}`)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant={"accent"}
                                    onClick={() => navigate({ to: "/companies/$id", params: { id: company.id } })}
                                >
                                    {t("general.visit")} <ChevronRight />
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">{t("search.popular.best_scored_clients")}</h2>
                {clientIsLoading && <PopularProfilesSkeleton />}
                {!clientIsLoading && clientList.length == 0 && (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant={"icon"}>
                                <User />
                            </EmptyMedia>
                            <EmptyTitle>{t("general.no_results")}</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                )}
                {!clientIsLoading && clientList.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {clientList.map((client) => (
                            <Card key={client.id} className="p-4 flex-row justify-between items-center">
                                 <div className="flex flex-row gap-4">
                                    <Avatar className="size-14">
                                        {client.profile_pic && (
                                            <AvatarImage
                                                src={client.profile_pic}
                                                alt={client.name}
                                                className="object-cover"
                                            />
                                        )}
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            <User className="size-7" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-2">
                                        <span className="flex flex-row gap-4 text-md font-semibold"><p className="truncate">{client.name}</p> <Badge variant={"destructive"}>{t("search.score")}: {client.score}</Badge></span>
                                        <div className="flex flex-row gap-2">
                                            <Badge variant={"secondary"}>{t("role.client")}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant={"accent"}
                                    onClick={() => navigate({ to: "/clients/$id", params: { id: client.id } })}
                                >
                                    {t("general.visit")} <ChevronRight />
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
