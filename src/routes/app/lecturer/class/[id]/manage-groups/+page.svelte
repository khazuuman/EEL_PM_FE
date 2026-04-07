<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import {
        ArrowLeftIcon,
        ExternalLinkIcon,
        FolderClockIcon,
        GroupIcon,
        UserRoundSearchIcon,
        UsersIcon,
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
    console.log("totalCount group: ", totalCount);
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
    class="bg-white w-full px-10 rounded-md pt-5 min-h-screen overflow-x-hidden pb-10 z-10 select-none"
>
    <!-- Top Header: Back Button -->
        <div class="sticky top-0 z-10 py-3 flex items-center">
            <Button
                variant="ghost"
                onclick={() => goto(`/app/lecturer/class/${data.classId}`)}
                class="flex items-center gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-3 py-4 transition-all cursor-pointer"
            >
                <ArrowLeftIcon class="w-4 h-4" />
                <span class="text-sm font-semibold">Back to Home</span>
            </Button>
        </div>
    <!-- Page Title -->
    <div class="flex items-center justify-between mb-6 mt-2 px-1">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"
            >
                <UsersIcon class="w-5 h-5 text-amber-500" />
            </div>
            <div>
                <p
                    class="text-[11px] font-semibold text-amber-500 uppercase tracking-widest leading-none mb-0.5"
                >
                    Management
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    Group List
                </h1>
            </div>
        </div>
        <div
            class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-100"
        >
            <span class="text-sm text-stone-400 font-medium">Total</span>
            <span class="text-sm font-extrabold text-stone-800"
                >{totalCount}</span
            >
            <span class="text-sm text-stone-400">groups</span>
        </div>
    </div>
    <DataTable
        actions={["view", "update", "delete"]}
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
