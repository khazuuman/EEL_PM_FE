<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";

    const { data } = $props();
    let courses = $derived(data?.courses || []);
    let totalCount = $derived(data?.totalCount || 0);

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

    const cacheKeyName = "course-management";
    let filters = $derived([
        {
            title: "Status",
            key: "isActive",
            data: ActiveStatus,
        },
    ]);
    let defaultHeaders = $state([
        "courseCode",
        "courseName",
        "courseDescription",
        "credits",
        "isActive",
    ]);
    let headerValues = $state({
        courseCode: "Course Code",
        courseName: "Course Name",
        courseDescription: "Description",
        credits: "Credits",
        isActive: "Active",
    });
</script>

<div class="bg-white w-full px-5 rounded-md pt-30 h-screen overflow-x-hidden">
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <DataTable
        statuses={[]}
        keyId={"courseId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Course"}
        {defaultHeaders}
        items={courses}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["courseName", "courseCode"]}
        {filters}
    />
</div>
