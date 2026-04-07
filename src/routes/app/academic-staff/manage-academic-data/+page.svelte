<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, RefreshCwIcon } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import SyncDataDialog from "../components/SyncDataDialog.svelte";

    const { data } = $props();
    let students = $derived(data?.students || []);
    let majors = $derived(data?.majors || []);
    let campuses = $derived(data?.campuses || []);
    let classes = $derived(data?.classes || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "staff-student-management";

    let syncOpen = $state(false);

    let filters = $derived([
        { title: "Majors", key: "majorId", data: majors },
        { title: "Campuses", key: "campusId", data: campuses },
        { title: "Classes", key: "classId", data: classes },
    ]);
    let defaultHeaders = $state([
        "studentCode",
        "fullName",
        "email",
        "majorCode",
        "classCode",
        "campusName",
    ]);
    let headerValues = $state({
        studentCode: "Student Code",
        fullName: "Full Name",
        email: "Email",
        majorCode: "Major Code",
        classCode: "Class Code",
        campusName: "Campus Name",
    });
</script>

<div
    class="bg-white w-full px-10 rounded-md pt-30 min-h-screen overflow-x-hidden pb-10 z-10"
>
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app"
    >
        <ArrowLeftIcon />Back to Home
    </a>

    <DataTable
        showAction={true}
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
        matchSearchColumns={["studentName", "studentCode"]}
        {filters}
    >
        {#snippet headerActions()}
            <Button
                class="gap-2 px-3 py-4 rounded-sm cursor-pointer"
                onclick={() => (syncOpen = true)}
            >
                <RefreshCwIcon size={16} />
                Sync Data
            </Button>

            <SyncDataDialog
                open={syncOpen}
                onOpenChange={(v: any) => (syncOpen = v)}
            />
        {/snippet}
    </DataTable>
</div>
