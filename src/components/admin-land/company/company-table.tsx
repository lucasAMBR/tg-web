import { useIndexCompanyProfile } from "@/api/generated/profiles-doc/profiles-doc";
import { DataTable } from "@/components/global/data-table";
import DefaultPagination, { type GenericPagination } from "@/components/global/pagination";
import { Card } from "@/components/ui/card";
import { useIndexCompanyParams } from "@/hooks/filters/use-index-company-params";
import useDebounce from "@/hooks/use-debounce";
import { columns } from "./columns";
import { Filters } from "./filters";

export function CompanyTable() {
    const {
        page,
        perPage,
        search,
        operational_segment,
        setFilterParams,
    } = useIndexCompanyParams();

    const debouncedSearch = useDebounce(search, 500);

    const { data: companies } = useIndexCompanyProfile({
        page: page,
        per_page: perPage,
        search: debouncedSearch,
        operational_segment: operational_segment,
    });

    const companyList = companies?.data.data || [];

    return (
        <>
            <Filters />

            <DataTable
                columns={columns}
                data={companyList}
            />

            <Card className="p-4 bg-accent mt-2">
                <DefaultPagination
                    data={companies?.data.pagination as GenericPagination}
                    setPage={(p) => setFilterParams({ page: p })}
                    setPerPage={(pp) => setFilterParams({ perPage: pp })}
                />
            </Card>
        </>
    );
}
