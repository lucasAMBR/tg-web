import { DataTable } from "@/components/global/data-table";
import { Filters } from "./filters";
import { Card } from "@/components/ui/card";
import { columns } from "./columns";
import DefaultPagination, { type GenericPagination } from "@/components/global/pagination";
import { useIndexDevParams } from "@/hooks/filters/use-index-dev-params";
import useDebounce from "@/hooks/use-debounce";
import { useIndexDevProfile } from "@/api/generated/profile/profile";
import type { DevSpecialtyEnum, SeniorityLevelEnum } from "@/api/generated/models";

export function DevTable() {

    const {
        page,
        perPage,
        search,
        seniority_level,
        specialty,
        open_to_relocation,
        open_to_work,
        setFilterParams
    } = useIndexDevParams();

    const debouncedSearch = useDebounce(search, 500);

    const { 
        data: devs
    } = useIndexDevProfile({
        page: page,
        per_page: perPage,
        search: debouncedSearch,
        seniority_level: (seniority_level || null) as SeniorityLevelEnum | null,
        specialty: (specialty || null) as DevSpecialtyEnum | null,
        open_to_relocation: open_to_relocation === null ? undefined : open_to_relocation, 
        open_to_work: open_to_work === null ? undefined : open_to_work,
    });

    const devList = devs?.data.data || [];

    return (
        <>
            <Filters />

            <DataTable 
                columns={columns} 
                data={devList} 
            />

            <Card className="p-4 bg-accent mt-2">
            <DefaultPagination 
                data={devs?.data.pagination as GenericPagination} 
                setPage={(p) => setFilterParams({ page: p })} 
                setPerPage={(pp) => setFilterParams({ perPage: pp })} 
            />
            </Card>
        </>
    );
}