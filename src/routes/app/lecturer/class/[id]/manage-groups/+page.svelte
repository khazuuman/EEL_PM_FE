<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import {
        ArrowLeftIcon,
        ExternalLinkIcon,
        FolderClockIcon,
        GroupIcon,
        UserRoundSearchIcon,
    } from "lucide-svelte";
    import { GroupStatusTable } from "$lib/enums/group.js";
    import { Button } from "$lib/components/ui/button";
    import AutoAllocateDialog from "./components/auto-allocate-dialog.svelte";
    import { setActions } from "$lib/stores/actions.js";
    import { toast } from "svelte-sonner";
    import { goto, invalidateAll } from "$app/navigation";
    import DropdownMenuItem from "$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte";

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
    class="bg-white w-full px-10 rounded-md pt-20 min-h-screen overflow-x-hidden pb-10 z-10 select-none"
>
<!-- Top Header: Back Button -->
    <div class="w-full flex items-center mb-8">
        <Button
            variant="ghost"
            onclick={() => goto(`/app/lecturer/class/${data?.classId}`)}
            class="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-6 transition-all cursor-pointer"
        >
            <ArrowLeftIcon class="w-5 h-5" />
            <span class="text-base font-semibold">Back to Class</span>
        </Button>
    </div>
    <DataTable
        actions={['view', 'update', 'delete']}
        showAction={true}
        showAddButton={true}
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
        {#snippet extraActions({ id })}
            <DropdownMenuItem>
                <a
                    href={`/app/lecturer/class/${data.classId}/manage-groups/${id}/assign-mentor`}
                    class="flex items-center gap-2"
                >
                    <UserRoundSearchIcon class="h-4 w-4" />
                    Assign Mentor
                </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a
                    href={`/app/lecturer/class/${data.classId}/manage-groups/${id}/topic-history`}
                    class="flex items-center gap-2"
                >
                    <FolderClockIcon class="h-4 w-4" />
                    View Topic History
                </a>
            </DropdownMenuItem>
            <!-- <DropdownMenuItem>
                <button
                    class="flex items-center gap-2"
                    onclick={() => handleSomeCustomAction(id)}
                >
                    <UserRoundSearchIcon class="h-4 w-4" />
                    Assign Mentor
                </button>
            </DropdownMenuItem> -->
        {/snippet}
        {#snippet headerActions()}
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
                <GroupIcon />Divide into Groups
            </Button>
            <AutoAllocateDialog
                bind:open={autoGroupOpen}
                classId={data?.classId}
                onClose={() => (autoGroupOpen = false)}
            />
        {/snippet}
    </DataTable>
</div>
