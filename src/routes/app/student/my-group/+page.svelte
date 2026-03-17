<script lang="ts">
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { ArrowLeftIcon, UsersIcon, XIcon } from "lucide-svelte";
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
    // Thêm state cho bầu leader
    let pendingPromote = $state<{ studentId: string; fullName: string } | null>(
        null,
    );
    let pendingLeave = $state(false);

    const currentUser = $derived(data?.currentUser);
    const groupMembers = $derived(
        (data?.group?.members as any[])?.sort((a, b) => {
            if (a.isLeader === b.isLeader) return 0;
            return a.isLeader ? -1 : 1;
        }) ?? [],
    );

    const memberCount = $derived(groupMembers.length ?? 0);

    const statusClass: Record<string, string> = {
        Draft: "bg-gray-200 text-gray-600",
        Pending: "bg-gray-200 text-gray-600",
        Approved: "bg-green-200 text-green-600",
        Active: "bg-green-200 text-green-600",
        Rejected: "bg-red-200 text-red-600",
        Completed: "bg-blue-200 text-blue-600",
    };
</script>

{#snippet promoteLeaderCard(o: (typeof groupMembers)[number])}
    <form
        id="promote-form-{o.studentId}"
        method="POST"
        action="?/transferLeader"
        use:enhance={() => {
            return async ({ result }) => {
                // ← bỏ `update` khỏi destructure
                const fullName = pendingPromote?.fullName ?? "member";

                if (result.type === "success") {
                    toast.success(`${fullName} has been promoted to Leader.`);
                    pendingPromote = null;
                    await invalidateAll(); // ← dùng invalidateAll thay update()
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
            class="border-amber-600 cursor-pointer"
            type="button"
            onclick={() => {
                pendingPromote = {
                    studentId: o.studentId,
                    fullName: o.fullName,
                };
            }}
        >
            Transfer Leader
        </Button>
    </form>
{/snippet}

{#snippet memberInforCard(o: (typeof groupMembers)[number])}
    <div
        class="member-card p-3 rounded-md flex items-center justify-between bg-white"
    >
        <div class="flex gap-3 justify-center items-center">
            <div class="w-15 h-15 overflow-hidden rounded-full">
                <img
                    class="scale-110 object-cover"
                    src={o.avatarUrl
                        ? o.avatarUrl
                        : "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L2pvYjEwMzQtZWxlbWVudC0wNi0zOTcucG5n.png"}
                    alt=""
                />
            </div>
            <div>
                <span class="flex items-baseline gap-1 text-[16px] font-bold"
                    >{o.fullName}
                    {#if o.isLeader === true}
                        <span class="text-red-500">(Leader)</span>
                    {/if}
                    {#if o.studentId === currentUser?.student?.studentId}
                        <span class="text-blue-500 font-bold">(You)</span>
                    {/if}
                </span>
                <span class="text-[16px] font-medium text-stone-400"
                    >{o.studentCode}</span
                >
            </div>
        </div>
        <div class="flex gap-4">
            <div class="flex gap-1 flex-col items-end">
                <span class="rounded-sm bg-stone-100 text-black px-4"
                    >{o.classCode}</span
                >
                <span class="text-[14px] text-stone-400">{o.campusName}</span>
            </div>
            {#if currentUser?.student?.group?.isLeader === true && !o.isLeader}
                {@render promoteLeaderCard(o)}
            {/if}
            {#if data?.group?.status === GroupStatusEnum.DRAFT || data?.group?.status === GroupStatusEnum.REJECTED}
                {#if currentUser?.student?.group?.isLeader === true && !o.isLeader}
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
                            class="cursor-pointer hover:bg-red-600"
                            title="Remove member"
                            onclick={() => {
                                pendingRemove = {
                                    studentId: o.studentId,
                                    fullName: o.fullName,
                                };
                            }}
                        >
                            <XIcon />
                        </Button>
                    </form>
                {/if}
            {/if}
        </div>
    </div>
{/snippet}

<a
    class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
    href="/app"><ArrowLeftIcon />Back to Dashboard</a
>
<div class="px-20 pt-10 bg-stone-100">
    <div class="px-25">
        {#if data?.group}
            <div
                class="bg-white rounded-xl px-5 py-3 flex justify-between mb-5"
            >
                <span
                    class="text-2xl flex flex-1 items-center font-bold gap-3 text-wrap mr-10"
                >
                    {data?.group.groupName}
                    <Badge
                        class="{statusClass[data?.group?.status] ??
                            'bg-stone-200 text-stone-600'} text-[14px] leading-none py-1 px-2.5 self-center"
                    >
                        {data?.group?.status}
                    </Badge>
                    {#if data?.group?.status === GroupStatusEnum.DRAFT || data?.group?.status === GroupStatusEnum.REJECTED}
                        {#if currentUser?.student?.group?.isLeader === true}
                            <form
                                method="POST"
                                action="?/submitGroup"
                                use:enhance={() => {
                                    return async ({ result, update }) => {
                                        if (result.type === "success") {
                                            toast.success(
                                                "Approval request sent successfully!",
                                            );
                                        } else if (result.type === "failure") {
                                            toast.error(
                                                String(
                                                    result.data?.message ??
                                                        "Failed to send approval request",
                                                ),
                                            );
                                        }
                                        await update();
                                    };
                                }}
                            >
                                <input
                                    type="hidden"
                                    name="groupId"
                                    value={data?.group?.groupId}
                                />
                                <Button
                                    type="submit"
                                    class="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2"
                                >
                                    Request Approval
                                </Button>
                            </form>
                        {/if}
                        {#if currentUser?.student?.group?.isLeader === false}
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
                                        } else if (result.type === "failure") {
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
                                    value={data?.group?.groupId}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    class="cursor-pointer border-red-500 text-red-500 hover:bg-red-50"
                                    onclick={() => (pendingLeave = true)}
                                >
                                    Leave Group
                                </Button>
                            </form>
                        {/if}
                    {/if}
                </span>
                <div class="flex gap-3">
                    <div
                        class="flex flex-col justify-center gap-1 items-start bg-stone-100 rounded-2xl px-4 py-2"
                    >
                        <span class="text-stone-500">MEMBERS</span>
                        <span class="text-stone-900 text-xl font-bold"
                            >{memberCount}</span
                        >
                    </div>
                    <div
                        class="flex flex-col gap-1 justify-center items-start bg-stone-100 rounded-2xl px-4 py-2"
                    >
                        <span class="text-stone-500">DEPARTMENT</span>
                        <span class="text-stone-900 text-xl font-bold"
                            >SE - Software Engineering</span
                        >
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl px-5 py-3 mb-5 flex flex-col">
                <span class="text-2xl font-bold gap-5">Description</span>
                <p>{data?.group?.groupDescription}</p>
            </div>
            <h2 class="text-xl font-bold text-black mb-3">Group Members</h2>
            <div class="rounded-xl py-3 mb-5 flex flex-col gap-3">
                {#each groupMembers as cardInfo}
                    {@render memberInforCard(cardInfo)}
                {/each}
            </div>
        {:else}
            <div
                class="flex flex-col items-center justify-center bg-white rounded-xl py-20 gap-5"
            >
                <div
                    class="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center"
                >
                    <UsersIcon class="w-10 h-10 text-stone-400" />
                </div>
                <div class="flex flex-col items-center gap-1 text-center">
                    <span class="text-xl font-bold text-stone-700"
                        >You are not in any group yet</span
                    >
                    <span class="text-stone-400 text-sm"
                        >Join or register a group to get started</span
                    >
                </div>
                <a
                    href="/app/student/groups"
                    class="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
                >
                    Register Group
                </a>
            </div>
        {/if}
    </div>
</div>

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
                <span class="font-semibold text-black"
                    >{pendingRemove?.fullName}</span
                >
                from the group? This action cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={() => (pendingRemove = null)}>
                Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
                class="bg-red-500 hover:bg-red-600 text-white"
                onclick={() => {
                    const form = document.getElementById(
                        `remove-form-${pendingRemove?.studentId}`,
                    ) as HTMLFormElement;
                    form?.requestSubmit();
                }}
            >
                Remove
            </AlertDialog.Action>
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
            <AlertDialog.Title>Promote to Leader</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to promote
                <span class="font-semibold text-black"
                    >{pendingPromote?.fullName}</span
                >
                to group Leader? They will have full admin rights.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={() => (pendingPromote = null)}>
                Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
                class="bg-amber-500 hover:bg-amber-600 text-white"
                onclick={() => {
                    const form = document.getElementById(
                        `promote-form-${pendingPromote?.studentId}`,
                    ) as HTMLFormElement;
                    form?.requestSubmit();
                }}
            >
                Promote Leader
            </AlertDialog.Action>
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
                <span class="font-semibold text-black"
                    >{data?.group?.groupName}</span
                >? You will need to be invited again to rejoin.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={() => (pendingLeave = false)}>
                Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
                class="bg-red-500 hover:bg-red-600 text-white"
                onclick={() => {
                    const form = document.getElementById(
                        "leave-form",
                    ) as HTMLFormElement;
                    form?.requestSubmit();
                }}
            >
                Leave
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
