import { useGlobalSearchParams } from "@/hooks/filters/use-global-search-params";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Building, Briefcase, User, Users, Eye } from "lucide-react";
import { useSearch } from "@/api/generated/search/search";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { SearchGroup } from "./search-tab";
import SearchClientCard from "./search-client-card";
import SearchCompanyCard from "./search-company-card";
import SearchDevCard from "./search-dev-card";
import SearchResultSkeleton from "./search-result-skeleton";
import SearchVacancyCard from "./search-vacancy-card";

interface SearchAllResultsProps {
  setTab: (tab: SearchGroup) => void;
}

export default function SearchAllResults({ setTab }: SearchAllResultsProps) {
  const { t } = useTranslation();

  const { page, search } = useGlobalSearchParams();

  const { data: globalData, isLoading } = useSearch(
    {
      page: page,
      per_page: 3,
      search: search,
    },
  );

  const devList = globalData?.data.dev_profiles.data ?? [];
  const devCount = globalData?.data.dev_profiles.pagination.total ?? 0;

  const companyList = globalData?.data.company_profiles.data ?? [];
  const companyCount = globalData?.data.company_profiles.pagination.total ?? 0;

  const clientList = globalData?.data.client_profiles.data ?? [];
  const clientCount = globalData?.data.client_profiles.pagination.total ?? 0;

  const vacancyList = globalData?.data.job_vacancies.data ?? [];
  const vacancyCount = globalData?.data.job_vacancies.pagination.total ?? 0;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex flex-col gap-2">
        <h3 className="text-lg font-medium flex flex-row gap-2">
          {t("search.group.developers")}
          {devCount > 3 ? (
            <Badge variant={"secondary"}>
              {devCount}
            </Badge>)
            : null
          }</h3>
        {isLoading && <SearchResultSkeleton />}
        {!isLoading && devList.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            {devList.map((dev) => (
              <SearchDevCard key={dev.id} dev={dev} />
            ))}
            {devCount > 3 && (
              <Button
                className="w-full"
                variant={"outline"}
                onClick={() => setTab("developers")}
              >
                <Eye /> {t("search.see_more")}
              </Button>
            )}
          </div>
        )}
        {!isLoading && devList.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant={"icon"}>
                <User />
              </EmptyMedia>
              <EmptyTitle>{t("search.empty.developers_title")}</EmptyTitle>
              <EmptyDescription>
                {t("search.empty.developers_description")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        <h3 className="text-lg font-medium flex flex-row gap-2">
          {t("search.group.companies")}
          {companyCount > 3 ? (
            <Badge variant={"secondary"}>
              {companyCount}
            </Badge>)
            : null
          }
        </h3>
        {isLoading && <SearchResultSkeleton />}
        {!isLoading && companyList.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            {companyList.map((company) => (
              <SearchCompanyCard key={company.id} company={company} />
            ))}
            {companyCount > 3 && (
              <Button
                className="w-full"
                variant={"outline"}
                onClick={() => setTab("companies")}
              >
                <Eye /> {t("search.see_more")}
              </Button>
            )}
          </div>
        )}
        {!isLoading && companyList.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant={"icon"}>
                <Building />
              </EmptyMedia>
              <EmptyTitle>{t("search.empty.companies_title")}</EmptyTitle>
              <EmptyDescription>
                {t("search.empty.companies_description")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        <h3 className="text-lg font-medium flex flex-row gap-2">
          {t("search.group.clients")}
          {clientCount > 3 ? (
            <Badge variant={"secondary"}>
              {clientCount}
            </Badge>)
            : null
          }
        </h3>
        {isLoading && <SearchResultSkeleton />}
        {!isLoading && clientList.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            {clientList.map((client) => (
              <SearchClientCard key={client.id} client={client} />
            ))}
            {clientCount > 3 && (
              <Button
                className="w-full"
                variant={"outline"}
                onClick={() => setTab("client")}
              >
                <Eye /> {t("search.see_more")}
              </Button>
            )}
          </div>
        )}
        {!isLoading && clientList.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant={"icon"}>
                <Users />
              </EmptyMedia>
              <EmptyTitle>{t("search.empty.clients_title")}</EmptyTitle>
              <EmptyDescription>
                {t("search.empty.clients_description")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        <h3 className="text-lg font-medium flex flex-row gap-2">
          {t("search.group.vacancies")}
          {vacancyCount > 3 ? (
            <Badge variant={"secondary"}>
              {vacancyCount}
            </Badge>)
            : null
          }
        </h3>
        {isLoading && <SearchResultSkeleton />}
        {!isLoading && vacancyList.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            {vacancyList.map((vacancy) => (
              <SearchVacancyCard key={vacancy.id} vacancy={vacancy} />
            ))}
            {vacancyCount > 3 && (
              <Button
                className="w-full"
                variant={"outline"}
                onClick={() => setTab("vacancies")}
              >
                <Eye /> {t("search.see_more")}
              </Button>
            )}
          </div>
        )}
        {!isLoading && vacancyList.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant={"icon"}>
                <Briefcase />
              </EmptyMedia>
              <EmptyTitle>{t("search.empty.vacancies_title")}</EmptyTitle>
              <EmptyDescription>
                {t("search.empty.vacancies_description")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
