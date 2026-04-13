<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, UsersIcon } from "lucide-svelte";

    const { data } = $props();
    let students = $derived(data?.students || []);
    let totalCount = $derived(data?.totalCount || 0);
    let majors = $derived(data?.majors || []);
    const cacheKeyName = "lecturer-student-management";
    let filters = $derived([
        {
            title: "Majors",
            key: "MajorId",
            data: majors,
        },
    ]);
    let defaultHeaders = $state([
        "studentCode",
        "fullName",
        "email",
        "groupName",
        "majorName",
    ]);
    let headerValues = $state({
        studentCode: "Student Code",
        fullName: "Full Name",
        email: "Email",
        groupName: "Group",
        majorName: "Major",
    });
</script>

<div class="bg-white px-5 pt-5 pb-10 rounded-md min-h-screen">
    <!-- Back button -->
    <div class="w-full flex items-center">
        <Button
            variant="ghost"
            onclick={() => goto(`/app/student`)}
            class="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-6 transition-all cursor-pointer"
        >
            <ArrowLeftIcon class="w-5 h-5" />
            <span class="text-base font-semibold">Back</span>
        </Button>
    </div>

    <!-- Page Title -->
    <div class="flex items-center justify-between mb-6 mt-2 px-1">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <UsersIcon class="w-5 h-5 text-amber-500" />
            </div>
            <div>
                <p class="text-[11px] font-semibold text-amber-500 uppercase tracking-widest leading-none mb-0.5">
                    Management
                </p>
                <h1 class="text-2xl font-extrabold text-stone-900 leading-tight">
                    Student List
                </h1>
            </div>
        </div>
        <div class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-100">
            <span class="text-sm text-stone-400 font-medium">Total</span>
            <span class="text-sm font-extrabold text-stone-800">{totalCount}</span>
            <span class="text-sm text-stone-400">students</span>
        </div>
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