<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, ExternalLinkIcon, GroupIcon } from "lucide-svelte";
    import { GroupStatusTable } from "$lib/enums/group.js";
    import { Button } from "$lib/components/ui/button";
    import AutoAllocateDialog from "./components/auto-allocate-dialog.svelte";
    import { setActions } from "$lib/stores/actions.js";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";

    const { data } = $props();
    let groups = $derived(data?.groups || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "lecturer-group-management";

    let filters = $derived([]);
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
        campusCode: "Campus",
    });

    let autoGroupOpen = $state(false);

    function handlePublishGroups() {
        setActions({
            active: true,
            description:
                "This will publish all groups for this class. Students will be notified. This action cannot be undone.",
            cb: async () => {
                const formData = new FormData();
                formData.append("classId", data?.classId);

                const res = await fetch("?/publicGroup", {
                    method: "POST",
                    body: formData,
                });

                const result = await res.json();

                if (result?.type === "failure") {
                    toast.error(
                        result?.data?.message ?? "Failed to publish groups.",
                    );
                    return;
                }

                toast.success(
                    result?.data?.message ?? "Groups published successfully!",
                );
                await invalidateAll();
            },
        });
    }
</script>

<div
    class="bg-white w-full px-10 rounded-md pt-30 min-h-screen overflow-x-hidden pb-10 z-10 select-none"
>
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href={`/app/lecturer/class/${data?.classId}`}
    >
        <ArrowLeftIcon />Back to Dashboard
    </a>

    <DataTable
        showAction={true}
        showAddButton={true}
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
        {#snippet actions()}
            <Button
                variant="outline"
                class="gap-2 px-3 py-4 rounded-sm border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                onclick={handlePublishGroups}
            >
                <ExternalLinkIcon />Publish Groups
            </Button>
            <Button
                class="gap-2 px-3 py-4 rounded-sm cursor-pointer"
                onclick={() => (autoGroupOpen = true)}
            >
                <GroupIcon />Active group
            </Button>
            <AutoAllocateDialog
                bind:open={autoGroupOpen}
                classId={data?.classId}
                onClose={() => (autoGroupOpen = false)}
            />
        {/snippet}
    </DataTable>
</div>
