<script lang="ts">
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import {
        ArrowLeftIcon,
        CrownIcon,
        LogOutIcon,
        SendIcon,
        UsersIcon,
        XIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import Button from "$lib/components/ui/button/button.svelte";
    import { GroupStatusEnum } from "$lib/enums/group";
    import { toast } from "svelte-sonner";
    import { enhance } from "$app/forms";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index";
    import { invalidateAll } from "$app/navigation";

    let { data } = $props<{ data: PageData }>();
    let pendingRemove = $state<{ studentId: string; fullName: string } | null>(
        null,
    );
    let formRef = $state<HTMLFormElement | null>(null);
    let pendingPromote = $state<{ studentId: string; fullName: string } | null>(
        null,
    );
    let pendingLeave = $state(false);
    let pendingSubmit = $state(false);

    const currentUser = $derived(data?.currentUser);
    const groupMembers = $derived(
        (data?.group?.members as any[])?.sort((a, b) => {
            if (a.isLeader === b.isLeader) return 0;
            return a.isLeader ? -1 : 1;
        }) ?? [],
    );
    const memberCount = $derived(groupMembers.length ?? 0);
    const isLeader = $derived(currentUser?.student?.group?.isLeader === true);
    const canEdit = $derived(
        data?.group?.status === GroupStatusEnum.DRAFT ||
            data?.group?.status === GroupStatusEnum.REJECTED,
    );

    const statusClass: Record<string, string> = {
        Draft: "bg-zinc-100 text-zinc-600 border-zinc-200",
        Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
        Approved: "bg-green-50 text-green-700 border-green-200",
        Active: "bg-green-50 text-green-700 border-green-200",
        Rejected: "bg-red-50 text-red-700 border-red-200",
        Completed: "bg-blue-50 text-blue-700 border-blue-200",
    };
</script>

{#snippet promoteLeaderCard(o: (typeof groupMembers)[number])}
    <form
        id="promote-form-{o.studentId}"
        method="POST"
        action="?/transferLeader"
        use:enhance={() => {
            return async ({ result }) => {
                const fullName = pendingPromote?.fullName ?? "member";
                if (result.type === "success") {
                    toast.success(`${fullName} has been promoted to Leader.`);
                    pendingPromote = null;
                    await invalidateAll();
                } else if (result.type === "failure") {
                    toast.error(
                        String(
                            result.data?.message ?? "Failed to promote leader",
                        ),
                    );
                    pendingPromote = null;
                }
            };
        }}
    >
        <input type="hidden" name="groupId" value={data?.group?.groupId} />
        <input type="hidden" name="studentId" value={o.studentId} />
        <Button
            variant="outline"
            class="h-9 px-4 text-sm border-amber-400 text-amber-600 hover:bg-amber-50 cursor-pointer gap-1.5"
            type="button"
            onclick={() => {
                pendingPromote = {
                    studentId: o.studentId,
                    fullName: o.fullName,
                };
            }}
        >
            <CrownIcon class="h-4 w-4" />
            Transfer Leader
        </Button>
    </form>
{/snippet}

{#snippet memberInforCard(o: (typeof groupMembers)[number])}
    <div
        class="flex items-center justify-between px-5 py-4 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm transition-all"
    >
        <div class="flex items-center gap-4 min-w-0">
            <div
                class="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-zinc-200"
            >
                <img
                    class="w-full h-full object-cover scale-110"
                    src={o.avatarUrl ??
                        "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L2pvYjEwMzQtZWxlbWVudC0wNi0zOTcucG5n.png"}
                    alt={o.fullName}
                />
            </div>
            <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <!-- Tên: text-sm → text-base -->
                    <span class="font-semibold text-zinc-900 text-base"
                        >{o.fullName}</span
                    >
                    {#if o.isLeader}
                        <!-- Badge Leader to hơn -->
                        <span
                            class="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5"
                        >
                            <CrownIcon class="h-3.5 w-3.5" /> Leader
                        </span>
                    {/if}
                    {#if o.studentId === currentUser?.student?.studentId}
                        <span
                            class="text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5"
                            >You</span
                        >
                    {/if}
                </div>
                <!-- Sub-info: text-xs → text-sm -->
                <div class="flex items-center gap-2 mt-1 text-sm text-zinc-400">
                    <span class="font-mono">{o.studentCode}</span>
                    <span class="text-zinc-300">·</span>
                    <span>{o.campusName}</span>
                    <span class="text-zinc-300">·</span>
                    <span
                        class="bg-zinc-100 text-zinc-600 rounded px-2 py-0.5 font-medium"
                        >{o.classCode}</span
                    >
                    <span class="text-zinc-300">·</span>
                    <span
                        class="bg-amber-50 text-amber-700 rounded px-2 py-0.5 font-medium text-xs"
                        >{o.majorName}</span
                    >
                </div>
            </div>
        </div>

        {#if isLeader && !o.isLeader}
            <div class="flex items-center gap-2 shrink-0 ml-4">
                {@render promoteLeaderCard(o)}
                {#if canEdit}
                    <form
                        id="remove-form-{o.studentId}"
                        bind:this={formRef}
                        method="POST"
                        action="?/removeMember"
                        use:enhance={() => {
                            return async ({ result }) => {
                                if (result.type === "success") {
                                    toast.success(
                                        `${o.fullName} has been removed from the group.`,
                                    );
                                    pendingRemove = null;
                                    await invalidateAll();
                                } else if (result.type === "failure") {
                                    toast.error(
                                        String(
                                            result.data?.message ??
                                                "Failed to remove member",
                                        ),
                                    );
                                    pendingRemove = null;
                                }
                            };
                        }}
                    >
                        <input
                            type="hidden"
                            name="groupId"
                            value={data?.group?.groupId}
                        />
                        <input
                            type="hidden"
                            name="studentId"
                            value={o.studentId}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            class="h-9 w-9 p-0 border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 cursor-pointer"
                            title="Remove member"
                            onclick={() => {
                                pendingRemove = {
                                    studentId: o.studentId,
                                    fullName: o.fullName,
                                };
                            }}
                        >
                            <XIcon class="h-4 w-4" />
                        </Button>
                    </form>
                {/if}
            </div>
        {/if}
    </div>
{/snippet}

<div class="min-h-screen bg-white pt-5">
    <!-- Top Bar -->
    <div class="sticky top-0 z-10 pl-3 mb-2">
        <Button
            variant="ghost"
            onclick={() => history.back()}
            class="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg px-3 py-2 transition-all cursor-pointer"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            <span class="text-sm font-semibold">Back to Home</span>
        </Button>
    </div>

    <div class="px-6 space-y-5">
        <div class="mb-6">
            <h1 class="text-2xl font-extrabold text-zinc-900">My Group</h1>
            <p class="mt-1 text-sm text-zinc-400">
                Your centralized group management hub.
            </p>
        </div>
        {#if data?.group}
            <!-- ── Header Card ─────────────────────────────── -->
            <div
                class="rounded-xl border border-zinc-200 bg-white shadow-sm px-6 py-5"
            >
                <div class="flex items-center justify-between gap-4 flex-wrap">
                    <!-- Group name + status + actions -->
                    <div class="flex items-center gap-3 flex-wrap min-w-0">
                        <h1
                            class="text-2xl font-extrabold text-zinc-900 leading-tight"
                        >
                            {data.group.groupName}
                        </h1>
                        <Badge
                            class="text-xs font-semibold border px-2.5 py-1 rounded-full {statusClass[
                                data.group.status
                            ] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'}"
                        >
                            {data.group.status}
                        </Badge>

                        {#if canEdit}
                            {#if isLeader}
                                <form
                                    id="submit-form"
                                    method="POST"
                                    action="?/submitGroup"
                                    use:enhance={() => {
                                        return async ({ result, update }) => {
                                            if (result.type === "success") {
                                                toast.success(
                                                    "Approval request sent successfully!",
                                                );
                                                pendingSubmit = false;
                                            } else if (
                                                result.type === "failure"
                                            ) {
                                                toast.error(
                                                    String(
                                                        result.data?.message ??
                                                            "Failed to send approval request",
                                                    ),
                                                );
                                                pendingSubmit = false;
                                            }
                                            await update();
                                        };
                                    }}
                                >
                                    <input
                                        type="hidden"
                                        name="groupId"
                                        value={data.group.groupId}
                                    />
                                    <Button
                                        type="button"
                                        class="h-8 px-3 text-xs cursor-pointer bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-1.5"
                                        onclick={() => (pendingSubmit = true)}
                                    >
                                        <SendIcon class="h-3.5 w-3.5" />
                                        Request Approval
                                    </Button>
                                </form>
                            {/if}

                            {#if !isLeader}
                                <form
                                    id="leave-form"
                                    method="POST"
                                    action="?/leaveGroup"
                                    use:enhance={() => {
                                        return async ({ result }) => {
                                            if (result.type === "success") {
                                                toast.success(
                                                    "You have left the group.",
                                                );
                                                pendingLeave = false;
                                                await invalidateAll();
                                            } else if (
                                                result.type === "failure"
                                            ) {
                                                toast.error(
                                                    String(
                                                        result.data?.message ??
                                                            "Failed to leave group",
                                                    ),
                                                );
                                                pendingLeave = false;
                                            }
                                        };
                                    }}
                                >
                                    <input
                                        type="hidden"
                                        name="groupId"
                                        value={data.group.groupId}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        class="h-8 px-3 text-xs cursor-pointer border-red-300 text-red-500 hover:bg-red-50 gap-1.5"
                                        onclick={() => (pendingLeave = true)}
                                    >
                                        <LogOutIcon class="h-3.5 w-3.5" />
                                        Leave Group
                                    </Button>
                                </form>
                            {/if}
                        {/if}
                    </div>

                    <!-- Stats chips -->
                    <div class="flex items-center gap-3 shrink-0">
                        <div
                            class="flex flex-col items-center justify-center bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-2.5 min-w-[80px]"
                        >
                            <span
                                class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                                >Members</span
                            >
                            <span
                                class="text-xl font-extrabold text-zinc-900 mt-0.5"
                                >{memberCount}</span
                            >
                        </div>
                        <!-- <div
                            class="flex flex-col items-center justify-center bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-2.5"
                        >
                            <span
                                class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                                >Department</span
                            >
                            <span class="text-sm font-bold text-zinc-900 mt-0.5"
                                >SE – Software Engineering</span
                            >
                        </div> -->
                    </div>
                </div>
            </div>

            <!-- ── Two-column layout ───────────────────────── -->
            <div
                class="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start"
            >
                <!-- LEFT: Members list -->
                <div
                    class="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
                >
                    <div
                        class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between"
                    >
                        <h2
                            class="font-bold text-zinc-900 flex items-center gap-2"
                        >
                            <UsersIcon class="h-4 w-4 text-zinc-400" />
                            Group Members
                            <span
                                class="ml-1 text-xs font-bold bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5"
                            >
                                {memberCount}
                            </span>
                        </h2>
                    </div>
                    <div class="p-4 space-y-2.5">
                        {#each groupMembers as cardInfo}
                            {@render memberInforCard(cardInfo)}
                        {/each}
                    </div>
                </div>

                <!-- RIGHT: Description -->
                <div
                    class="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
                >
                    <div class="px-6 py-4 border-b border-zinc-100">
                        <h2 class="font-bold text-zinc-900">Description</h2>
                    </div>
                    <div class="px-6 py-5">
                        {#if data.group.groupDescription}
                            <p class="text-sm text-zinc-600 leading-relaxed">
                                {data.group.groupDescription}
                            </p>
                        {:else}
                            <p class="text-sm italic text-zinc-400">
                                No description provided.
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        {:else}
            <!-- Empty state -->
            <div class="flex flex-col items-center justify-center py-32 gap-5">
                <div
                    class="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center"
                >
                    <UsersIcon class="w-10 h-10 text-zinc-400" />
                </div>
                <div class="flex flex-col items-center gap-1 text-center">
                    <span class="text-xl font-bold text-zinc-700"
                        >You are not in any group yet</span
                    >
                    <span class="text-zinc-400 text-sm"
                        >Join or register a group to get started</span
                    >
                </div>
                <a
                    href="/app/student/groups"
                    class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm"
                >
                    Register Group
                </a>
            </div>
        {/if}
    </div>
</div>

<!-- ── Alert Dialogs ─────────────────────────────────── -->
<AlertDialog.Root
    open={!!pendingRemove}
    onOpenChange={(v) => {
        if (!v) pendingRemove = null;
    }}
>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Remove Member</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to remove
                <span class="font-semibold text-zinc-900"
                    >{pendingRemove?.fullName}</span
                >
                from the group? This action cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={() => (pendingRemove = null)}
                >Cancel</AlertDialog.Cancel
            >
            <AlertDialog.Action
                class="bg-red-500 hover:bg-red-600 text-white"
                onclick={() => {
                    const form = document.getElementById(
                        `remove-form-${pendingRemove?.studentId}`,
                    ) as HTMLFormElement;
                    form?.requestSubmit();
                }}>Remove</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root
    open={!!pendingPromote}
    onOpenChange={(v) => {
        if (!v) pendingPromote = null;
    }}
>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Transfer Leader</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to promote
                <span class="font-semibold text-zinc-900"
                    >{pendingPromote?.fullName}</span
                >
                to group Leader? They will have full admin rights.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={() => (pendingPromote = null)}
                >Cancel</AlertDialog.Cancel
            >
            <AlertDialog.Action
                class="bg-amber-500 hover:bg-amber-600 text-white"
                onclick={() => {
                    const form = document.getElementById(
                        `promote-form-${pendingPromote?.studentId}`,
                    ) as HTMLFormElement;
                    form?.requestSubmit();
                }}>Promote Leader</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root
    open={pendingLeave}
    onOpenChange={(v) => {
        if (!v) pendingLeave = false;
    }}
>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Leave Group</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to leave
                <span class="font-semibold text-zinc-900"
                    >{data?.group?.groupName}</span
                >? You will need to be invited again to rejoin.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={() => (pendingLeave = false)}
                >Cancel</AlertDialog.Cancel
            >
            <AlertDialog.Action
                class="bg-red-500 hover:bg-red-600 text-white"
                onclick={() => {
                    const form = document.getElementById(
                        "leave-form",
                    ) as HTMLFormElement;
                    form?.requestSubmit();
                }}>Leave</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root
    open={pendingSubmit}
    onOpenChange={(v) => {
        if (!v) pendingSubmit = false;
    }}
>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Request Approval</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to submit
                <span class="font-semibold text-zinc-900"
                    >{data?.group?.groupName}</span
                >
                for approval? Make sure all members and information are correct before
                submitting.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={() => (pendingSubmit = false)}
                >Cancel</AlertDialog.Cancel
            >
            <AlertDialog.Action
                class="bg-amber-500 hover:bg-amber-600 text-white"
                onclick={() => {
                    const form = document.getElementById(
                        "submit-form",
                    ) as HTMLFormElement;
                    form?.requestSubmit();
                }}>Submit for Approval</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
