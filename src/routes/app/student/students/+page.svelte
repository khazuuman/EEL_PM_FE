<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";

    const { data } = $props();
    console.log("data client: ", data);
    let students = $derived(data?.students || []);
    let totalCount = $derived(data?.totalCount || 0);
    let majors = $derived(data?.majors || []);
    console.log("majors client: ", majors);
    const cacheKeyName = "lecturer-student-management";
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

<div class="bg-white px-5 pt-20 pb-10 rounded-md min-h-screen">
    <div class="w-full flex items-center">
        <Button
            variant="ghost"
            onclick={() => goto(`/app`)}
            class="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-6 transition-all cursor-pointer"
        >
            <ArrowLeftIcon class="w-5 h-5" />
            <span class="text-base font-semibold">Home</span>
        </Button>
    </div>
    <DataTable
        actions={["view"]}
        showAction={true}
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
