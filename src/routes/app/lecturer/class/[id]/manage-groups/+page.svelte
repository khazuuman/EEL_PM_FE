<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";
    import { GroupStatusTable } from "$lib/enums/group.js";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Button } from "$lib/components/ui/button";
    import Label from "$lib/components/ui/label/label.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";

    const { data } = $props();
    let groups = $derived(data?.groups || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "lecturer-group-management";

    let filters = $derived([
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
        campusCode: "Campus",
    });

    let groupCount = $state<number | "">("");
    let memberCount = $state<number | "">("");
</script>

<div
    class="bg-white w-full px-10 rounded-md pt-30 min-h-screen overflow-x-hidden pb-10 z-10 select-none"
>
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href={`/app/lecturer/class/${data?.classId}`}
        ><ArrowLeftIcon />Back to Dashboard</a
    >
    <DataTable
        showAction={true}
        showAddButton={true}
        showImport={false}
        showView={true}
        showAutoGroup={true}
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
        {#snippet autoGroupDialog({ open, setOpen })}
            <Dialog.Root
                {open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) {
                        groupCount = "";
                        memberCount = "";
                    }
                }}
            >
                <Dialog.Content class="sm:max-w-[400px]">
                    <Dialog.Header>
                        <Dialog.Title>Activate Grouping</Dialog.Title>
                        <Dialog.Description>
                            Configure group allocation settings for this class.
                        </Dialog.Description>
                    </Dialog.Header>

                    <form
                        method="POST"
                        action="?/autoAllocate"
                        use:enhance={() => {
                            return async ({ result }) => {
                                await invalidateAll();
                                setOpen(false);
                                groupCount = "";
                                memberCount = "";
                                if (result.type === "success") {
                                    toast.success(
                                        String(
                                            (result.data as any)?.message ??
                                                "Grouping activated successfully!",
                                        ),
                                    );
                                } else if (result.type === "failure") {
                                    toast.error(
                                        String(
                                            (result.data as any)?.message ??
                                                "Failed to activate grouping.",
                                        ),
                                    );
                                } else {
                                    toast.error(
                                        "An unexpected error occurred.",
                                    );
                                }
                            };
                        }}
                    >
                        <div class="grid gap-4 py-4">
                            <input
                                type="hidden"
                                value={data?.classId}
                                name="classId"
                            />
                            <div class="grid gap-2">
                                <Label for="groupCount">Number of Groups</Label>
                                <Input
                                    id="groupCount"
                                    name="groupCount"
                                    type="number"
                                    min="2"
                                    placeholder="e.g. 5"
                                    bind:value={groupCount}
                                    class="border-zinc-300"
                                    required
                                />
                            </div>
                            <div class="grid gap-2">
                                <Label for="memberCount"
                                    >Members per Group</Label
                                >
                                <Input
                                    id="memberCount"
                                    name="memberCount"
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 4"
                                    bind:value={memberCount}
                                    class="border-zinc-300"
                                    required
                                />
                            </div>
                        </div>

                        <Dialog.Footer>
                            <Button
                                type="button"
                                variant="outline"
                                onclick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                class="bg-orange-500 hover:bg-orange-600 text-white"
                                disabled={!groupCount || !memberCount}
                            >
                                Confirm
                            </Button>
                        </Dialog.Footer>
                    </form>
                </Dialog.Content>
            </Dialog.Root>
        {/snippet}
    </DataTable>
</div>
