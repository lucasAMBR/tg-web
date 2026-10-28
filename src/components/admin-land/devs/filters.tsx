import { useEnumDevSpecialty, useEnumSeniority } from "@/api/generated/enum/enum";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIndexDevParams } from "@/hooks/filters/use-index-dev-params";
import { BrushCleaning, Filter, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Filters() {

    const { t } = useTranslation();

    const {
        search,
        setFilterParams
    } = useIndexDevParams();

    const clearFilters = () => {
        setFilterParams({
            search: "",
            seniority_level: "",
            specialty: "",
            open_to_relocation: null,
            open_to_work: null,
        });
    };

    const { data: specialties } = useEnumDevSpecialty();
    const specialtiesList = specialties?.data || [];

    const { data: seniorities } = useEnumSeniority();
    const senioritiesList = seniorities?.data || [];


    return(
        <Card className="p-4 mt-2 flex flex-row gap-2 mb-2">
        <div className="relative flex flex-1"> 
          <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <span className="sr-only">User</span>
          <Input
            value={search}
            onChange={(e) => setFilterParams({ search: e.target.value })}
            type="text"
            placeholder={t("placeholder.dev_search")}
            className="peer pl-9 bg-background"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
          <Button variant={"default"}><Filter className="size-4" /></Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 flex flex-col gap-4">
            <p className="font-medium">{t("general.filters")}</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t("input.seniority_level")}</Label>
                <Select onValueChange={(value) => setFilterParams({ seniority_level: value === "all" ? "" : value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("placeholder.filter_seniority_level")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {senioritiesList.map((seniority) => (
                      <SelectItem key={seniority.value} value={seniority.value}>
                        {t(seniority.i18nKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("input.specialty")}</Label>
                <Select onValueChange={(value) => setFilterParams({ specialty: value === "all" ? "" : value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("placeholder.filter_specialty")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {specialtiesList.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {t(specialty.i18nKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("input.open_to_relocation")}</Label>
              <ToggleGroup className='border border-input w-full' type="single" onValueChange={(value) => setFilterParams({ open_to_relocation: value === "all" ? null : value === "true" ? true : false })}>
                <ToggleGroupItem className='flex-1' value="all">{t("filters.all")}</ToggleGroupItem>
                <ToggleGroupItem className='flex-1' value="true">{t("filters.yes")}</ToggleGroupItem>
                <ToggleGroupItem className='flex-1' value="false">{t("filters.no")}</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("input.open_to_work")}</Label>
              <ToggleGroup className='border border-input w-full' type="single" onValueChange={(value) => setFilterParams({ open_to_work: value === "all" ? null : value === "true" ? true : false })}>
                <ToggleGroupItem className='flex-1' value="all">{t("filters.all")}</ToggleGroupItem>
                <ToggleGroupItem className='flex-1' value="true">{t("filters.yes")}</ToggleGroupItem>
                <ToggleGroupItem className='flex-1' value="false">{t("filters.no")}</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant={"secondary"} onClick={clearFilters}>
          <BrushCleaning className="size-4" /> {t("general.clear")}
        </Button>
      </Card>   
    );
}