<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";

    const { data } = $props();
    let semesters = $derived(data?.semesters || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "semester-management";
    const YearFilter = Array.from({ length: 201 }, (_, i) => ({
        label: String(2000 + i),
        value: String(2000 + i),
        variant: "default",
    }));

    const CurrentFilter = [
        { label: "All", value: "", variant: "default" },
        { label: "Current", value: "true", variant: "default" },
        { label: "Not current", value: "false", variant: "default" },
    ];

    let filters = $derived([
        {
            title: "Years",
            key: "year",
            data: YearFilter,
        },
        {
            title: "Current Semester",
            key: "isCurrent",
            data: CurrentFilter,
        },
    ]);
    let defaultHeaders = $state([
        "semesterCode",
        "semesterName",
        "year",
        "startDate",
        "endDate",
        "isActive",
    ]);
    let headerValues = $state({
        semesterCode: "Semester Code",
        semesterName: "Semester Name",
        year: "Year",
        startDate: "Start Date",
        endDate: "End Date",
        isActive: "Active",
    });
</script>

<div class="bg-white w-full px-5 rounded-md pt-30 h-screen overflow-x-hidden">
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <DataTable
        showView={false}
        statuses={[]}
        keyId={"semesterId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Semester"}
        {defaultHeaders}
        items={semesters}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["semesterName", "semesterCode"]}
        {filters}
    />
</div>
