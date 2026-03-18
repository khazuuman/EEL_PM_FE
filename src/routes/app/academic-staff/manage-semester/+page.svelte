<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";

    const { data } = $props();
    let semesters = $derived(data?.semesters || []);
    let totalCount = $derived(data?.totalCount || 0);

    const cacheKeyName = "semester-management";
    let filters = $derived([
        // {
        // 	title: "Majors",
        // 	key: "MajorId",
        // 	data: majors,
        // },
    ]);
    let defaultHeaders = $state([
        "semesterCode",
        "semesterName",
        "year",
        "startDate",
        "endDate",
    ]);
    let headerValues = $state({
        semesterCode: "Semester Code",
        semesterName: "Semester Name",
        year: "Year",
        startDate: "Start Date",
        endDate: "End Date",
    });
</script>
<div class="bg-white w-full px-5 rounded-md pt-30 h-screen overflow-x-hidden">
<a
    class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
    href="/app"><ArrowLeftIcon />Back to Dashboard</a
>
    <DataTable
        showView={false}
        showDelete={true}
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
