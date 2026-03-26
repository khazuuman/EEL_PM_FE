<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";
    import { GroupStatusTable } from "$lib/enums/group.js";

    const { data } = $props();
    let groups = $derived(data?.groups || []);
    let classes = $derived(data?.classes || []);
    let semesters = $derived(data?.semesters || []);
    let campuses = $derived(data?.campuses || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "staff-group-management";

    let filters = $derived([
        {
            title: "Class",
            key: "classId",
            data: classes,
        },
        {
            title: "Semester",
            key: "semesterId",
            data: semesters,
        },
        {
            title: "Campus",
            key: "campusId",
            data: campuses,
        },
    ]);
    let defaultHeaders = $state([
        "name",
        "memberCount",
        "maxMember",
        "status",
        "leaderName",
        "classCode",
        "semesterCode",
        "campusCode",
    ]);
    let headerValues = $state({
        name: "Group Name",
        memberCount: "Member Count",
        maxMember: "Max Member",
        status: "Status",
        leaderName: "Leader",
        classCode: "Class",
        semesterCode: "Semester",
        campusCode: "Campus"
    });
</script>

<div
    class="bg-white w-full px-10 rounded-md pt-30 min-h-screen overflow-x-hidden pb-10 z-10 select-none"
>
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <DataTable
        showAddButton={true}
        showImport={false}
        showView={true}
        statuses={GroupStatusTable}
        keyId={"id"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Group"}
        {defaultHeaders}
        items={groups}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["name"]}
        {filters}
    >
        <!-- {#snippet importDialog({ open, setOpen })}
            <ImportMentorDialog
                {open}
                onOpenChange={setOpen}
                onImport={async ({ file }) => {
                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch("?/importMentorData", {
                        method: "POST",
                        body: formData,
                    });

                    const result = await res.json();

                    if (result?.type === "failure") {
                        toast.error(result?.data?.message ?? "Import failed!");
                        throw new Error(result?.data?.message);
                    }

                    toast.success("Import successfully!");
                    await invalidateAll();
                    setOpen(false);
                }}
            />
        {/snippet} -->
    </DataTable>
</div>
