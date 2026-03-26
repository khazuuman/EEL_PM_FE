<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";

    const { data } = $props();
    console.log("data client: ", data);
    let students = $derived(data?.students || []);
    let totalCount = $derived(data?.totalCount || 0);
    let majors = $derived(data?.majors || []);
    console.log("majors client: ", majors);
    const cacheKeyName = "allocate-group-student-management";
    let filters = $derived([
        {
            title: "Majors",
            key: "MajorId",
            data: majors,
        },
    ]);
    let defaultHeaders = $state([
        // "avatarUrl",
        "studentCode",
        "fullName",
        "email",
        "groupName",
        "majorName",
    ]);
    let headerValues = $state({
        // avatarUrl: "Avatar",
        studentCode: "Student Code",
        fullName: "Full Name",
        email: "Email",
        groupName: "Group",
        majorName: "Major",
    });
</script>

<div class="bg-white px-5 pt-30 pb-10 rounded-md min-h-screen">
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app/academic-staff/auto-allocate-groups"
        ><ArrowLeftIcon />Back to Class List</a
    >
    <DataTable
        showView={false}
        showAddButton={false}
        statuses={[]}
        keyId={"studentId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Student"}
        {defaultHeaders}
        items={students}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["fullName", "studentCode"]}
        {filters}
    />
</div>
