import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchAllResults from "./search-all-results";
import SearchClientResults from "./search-client-results";
import SearchCompanyResults from "./search-company-results";
import SearchDevResults from "./search-dev-results";
import SearchVacancyResults from "./search-vacancy-results";
import { useGlobalSearchParams } from "@/hooks/filters/use-global-search-params";
import { useQueryClient } from "@tanstack/react-query";
import { getSearchQueryKey } from "@/api/generated/search/search";
import { Search } from "lucide-react";

export type SearchGroup =
  "all" | "developers" | "companies" | "client" | "vacancies";

export default function SearchTab() {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { setFilterParams } = useGlobalSearchParams();

  const [term, setTerm] = useState<string>("");
  const [group, setGroup] = useState<SearchGroup>("all");

  const handleGroupChange = (value: SearchGroup) => {
    setGroup(value);

    if (value !== "all") return;

    setTerm("");
    setFilterParams({ search: null, page: null });
  };

  const handleSearchTerm = (searchTerm: string) => {
    setTerm(searchTerm);
    setFilterParams({ search: searchTerm, page: null });
    queryClient.invalidateQueries({ queryKey: getSearchQueryKey() });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex gap-2">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("search.placeholder")}
        />
        <Button variant={"secondary"} onClick={() => handleSearchTerm(term)}>
          <Search />
          {t("general.search")}
        </Button>
      </div>
      <ToggleGroup
        variant={"outline"}
        spacing={2}
        type="single"
        value={group}
        onValueChange={(value) => {
          if (!value) return;
          handleGroupChange(value as SearchGroup);
        }}
      >
        <ToggleGroupItem value="all">{t("search.group.all")}</ToggleGroupItem>
        <ToggleGroupItem value="developers">
          {t("search.group.developers")}
        </ToggleGroupItem>
        <ToggleGroupItem value="companies">
          {t("search.group.companies")}
        </ToggleGroupItem>
        <ToggleGroupItem value="client">
          {t("search.group.clients")}
        </ToggleGroupItem>
        <ToggleGroupItem value="vacancies">
          {t("search.group.vacancies")}
        </ToggleGroupItem>
      </ToggleGroup>
      <div>
        {group === "all" && <SearchAllResults setTab={setGroup} />}
        {group === "developers" && <SearchDevResults />}
        {group === "companies" && <SearchCompanyResults />}
        {group === "client" && <SearchClientResults />}
        {group === "vacancies" && <SearchVacancyResults />}
      </div>
    </div>
  );
}
