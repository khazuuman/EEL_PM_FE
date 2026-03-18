<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";

    const { data } = $props();
    let campuses = $derived(data?.campuses || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "campus-management";

    const ActiveStatus = [
        {
            label: "Active",
            value: "true",
            variant: "active",
        },
        {
            label: "Inactive",
            value: "false",
            variant: "destructive",
        },
    ];

    let filters = $derived([
        {
            title: "Status",
            key: "isActive",
            data: ActiveStatus,
        },
    ]);
    let defaultHeaders = $state([
        "campusCode",
        "campusName",
        "city",
        "address",
        "isActive",
    ]);
    let headerValues = $state({
        campusCode: "Campus Code",
        campusName: "Campus Name",
        city: "City",
        address: "Address",
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
        keyId={"campusId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Campus"}
        {defaultHeaders}
        items={campuses}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["campusName", "campusCode"]}
        {filters}
    />
</div>
