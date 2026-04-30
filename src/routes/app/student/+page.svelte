<script lang="ts">
    import {
        ArrowLeftIcon,
        UsersIcon,
        CrownIcon,
        LogOutIcon,
        SendIcon,
        XIcon,
        RefreshCwIcon,
        UserCircleIcon,
        InboxIcon,
        BellIcon,
        BookOpenIcon,
        PlusIcon,
        HistoryIcon,
        EyeIcon,
        PencilIcon,
        ReplyIcon,
        RotateCcwIcon,
        LinkIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import { goto, invalidateAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index";
    import { getHeaderCtx } from "$lib/contexts/header.context.svelte";
    import { onDestroy } from "svelte";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import { GroupStatusEnum } from "$lib/enums/group";
    import { setActions } from "$lib/stores/actions";
    import type { NavigationGroup } from "../+page.svelte";
    import StudentDetailDialog from "./components/StudentDetailDialog.svelte";
    import InviteMemberDialog from "./components/InviteMemberDialog.svelte";
    import JoinRequestDialog from "./components/JoinRequestDialog.svelte";
    import { slide } from "svelte/transition";
    import InvitationsDialog from "./components/InvitationsDialog.svelte";

    let { data } = $props<{ data: PageData }>();

    let announcementsCollapsed = $state(false);

    // student detail dialog
    let studentDetailOpen = $state(false);
    let selectedStudentId = $state<number | null>(null);

    function openStudentDetail(id: number) {
        selectedStudentId = id;
        studentDetailOpen = true;
    }

    // invite member dialog
    let inviteMemberOpen = $state(false);

    // join request dialog
    let joinRequestOpen = $state(false);
    const joinRequests = $derived(data?.joinRequests ?? []);

    // Invitations dialog
    let invitationsOpen = $state(false);
    const invitations = $derived(data?.invitations ?? []);

    const headerCtx = getHeaderCtx();
    $effect(() => {
        headerCtx.setSubtitle(data.currentUser?.student?.classCode ?? null);
    });
    onDestroy(() => {
        headerCtx.setSubtitle(null);
    });
    const currentUser = $derived(data?.currentUser);
    const commonItems = [
        { name: "View Student List", url: `/app/student/view-student-list` },
        {
            name: "View Groups In Class",
            url: `/app/student/view-group-in-class`,
        },
        ...(data.group?.status === "Approved"
            ? [
                  {
                      name: "Checkpoints/Assignment",
                      url: `/app/student/assignment-checkpoint`,
                  },
              ]
            : []),
    ];

    const roleItem =
        currentUser.student?.group?.isLeader === true
            ? {
                  name: "My Sent Invitations",
                  url: `/app/student/my-sent-invitations`,
              }
            : { name: "My Join Request", url: `/app/student/my-join-requests` };

    const finalNavGroups: NavigationGroup[] = [
        {
            groupLabel: "Others",
            items: [...commonItems, roleItem],
        },
    ];
    const groupMembers = $derived(
        (data?.group?.members as any[])?.sort((a, b) => {
            if (a.isLeader === b.isLeader) return 0;
            return a.isLeader ? -1 : 1;
        }) ?? [],
    );
    const memberCount = $derived(groupMembers.length ?? 0);
    const maxMember = $derived(data?.group?.maxMembers ?? "—");
    const isLeader = $derived(currentUser?.student?.group?.isLeader === true);
    const canEdit = $derived(
        data?.group?.status === GroupStatusEnum.DRAFT ||
            data?.group?.status === GroupStatusEnum.REJECTED,
    );

    const statusClass: Record<string, string> = {
        Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Draft: "bg-stone-100 text-stone-500 border-stone-200",
        Pending: "bg-amber-50 text-amber-700 border-amber-200",
        Rejected: "bg-red-50 text-red-700 border-red-200",
        Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Completed: "bg-blue-50 text-blue-700 border-blue-200",
    };

    function formatDeadline(val: string | undefined): string {
        if (!val) return "—";
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        return `${dd}/${mm}/${yyyy} ${HH}:${min}:${ss}`;
    }
</script>

<div class="h-[calc(100vh-4rem)] flex flex-col bg-white overflow-y-auto">
    <!-- Header -->
    <div class="flex flex-col px-8 pt-6 pb-5 border-b border-stone-100">
        <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                    <div
                        class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center"
                    >
                        <UsersIcon class="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                        <p
                            class="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none"
                        >
                            My Group
                        </p>
                        <h1
                            class="text-lg font-extrabold text-stone-900 leading-tight"
                        >
                            {data.group?.groupName ?? "Group Management"}
                        </h1>
                    </div>
                </div>
                {#if data.group}
                    <Badge
                        class="text-xs font-semibold border {statusClass[
                            data.group.status
                        ] ?? 'bg-stone-100 text-stone-500 border-stone-200'}"
                    >
                        {data.group.status}
                    </Badge>
                {/if}
            </div>

            <div class="flex items-center gap-2">
                <!-- Toolbar -->
                <Button
                    variant="outline"
                    class="gap-2 h-9 border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 cursor-pointer"
                    onclick={() => invalidateAll()}
                >
                    <RefreshCwIcon class="w-4 h-4" />
                    Refresh
                </Button>
                {#if !isLeader}
                    <Button
                        variant="outline"
                        class="relative gap-2 h-9 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 cursor-pointer"
                        onclick={() => (invitationsOpen = true)}
                    >
                        <InboxIcon class="w-4 h-4" />
                        Invitations
                        {#if invitations.length > 0}
                            <!-- Dấu chấm nhấp nháy -->
                            <span class="absolute -top-1 -right-1 flex h-3 w-3">
                                <span
                                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                                ></span>
                                <span
                                    class="relative inline-flex rounded-full h-3 w-3 bg-red-500"
                                ></span>
                            </span>
                        {/if}
                    </Button>
                {/if}
                {#if data.group}
                    {#if canEdit && isLeader}
                        <Button
                            variant="outline"
                            class="relative gap-2 h-9 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 cursor-pointer"
                            onclick={() => (joinRequestOpen = true)}
                        >
                            <InboxIcon class="w-4 h-4" />
                            Join Requests
                            {#if joinRequests.length > 0}
                                <!-- Dấu chấm nhấp nháy -->
                                <span
                                    class="absolute -top-1 -right-1 flex h-3 w-3"
                                >
                                    <span
                                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                                    ></span>
                                    <span
                                        class="relative inline-flex rounded-full h-3 w-3 bg-red-500"
                                    ></span>
                                </span>
                            {/if}
                        </Button>
                        <!-- Invite Member -->
                        <Button
                            variant="outline"
                            class="gap-2 h-9 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 cursor-pointer"
                            onclick={() => (inviteMemberOpen = true)}
                        >
                            <UserCircleIcon class="w-4 h-4" />
                            Invite Member
                        </Button>
                    {/if}

                    {#if canEdit && !isLeader}
                        <!-- Leave Group -->
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
                                        await invalidateAll();
                                    } else if (result.type === "failure") {
                                        toast.error(
                                            String(
                                                (result.data as any)?.message ??
                                                    "Failed to leave group",
                                            ),
                                        );
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
                                class="gap-2 h-9 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                onclick={() =>
                                    setActions({
                                        active: true,
                                        description: `Are you sure you want to leave ${data?.group?.groupName}? You will need to be invited again to rejoin.`,
                                        cb: async () => {
                                            (
                                                document.getElementById(
                                                    "leave-form",
                                                ) as HTMLFormElement
                                            )?.requestSubmit();
                                        },
                                    })}
                            >
                                <LogOutIcon class="w-4 h-4" />
                                Leave Group
                            </Button>
                        </form>
                    {/if}

                    {#if canEdit && isLeader}
                        <!-- Request Approval -->
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
                                    } else if (result.type === "failure") {
                                        toast.error(
                                            String(
                                                (result.data as any)?.message ??
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
                                value={data.group.groupId}
                            />
                            <Button
                                type="button"
                                class="gap-2 h-9 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                                onclick={() =>
                                    setActions({
                                        active: true,
                                        description: `Are you sure you want to submit ${data?.group?.groupName} for approval? Make sure all members and information are correct before submitting.`,
                                        cb: async () => {
                                            (
                                                document.getElementById(
                                                    "submit-form",
                                                ) as HTMLFormElement
                                            )?.requestSubmit();
                                        },
                                    })}
                            >
                                <SendIcon class="w-4 h-4" />
                                Request Approval
                            </Button>
                        </form>
                    {/if}
                {/if}
            </div>
        </div>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 px-8 py-6 flex flex-col gap-6">
        <!-- Deadlines -->
        {#if data.deadlines}
            <div class="flex flex-wrap gap-3">
                {#if data.deadlines.groupFormationEndDate}
                    <div
                        class="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-3"
                    >
                        <div
                            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 border border-blue-200"
                        >
                            <UsersIcon class="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p
                                class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5"
                            >
                                Group Formation Deadline
                            </p>
                            <p class="text-sm font-semibold text-stone-800">
                                {formatDeadline(
                                    data.deadlines.groupFormationEndDate,
                                )}
                            </p>
                        </div>
                    </div>
                {/if}

                {#if data.deadlines.topicRegistrationEndDate}
                    <div
                        class="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-3"
                    >
                        <div
                            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 border border-amber-200"
                        >
                            <BookOpenIcon class="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p
                                class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5"
                            >
                                Topic Registration Deadline
                            </p>
                            <p class="text-sm font-semibold text-stone-800">
                                {formatDeadline(
                                    data.deadlines.topicRegistrationEndDate,
                                )}
                            </p>
                        </div>
                    </div>
                {/if}
                {#if data.classDetail?.googleMeetLink}
                    <div
                        class="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-3"
                    >
                        <div
                            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 border border-green-200"
                        >
                            <LinkIcon class="w-4 h-4 text-green-600" />
                        </div>
                        <div class="min-w-0">
                            <p
                                class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5"
                            >
                                Google Meet Link
                            </p>
                            <a
                                href={data.classDetail.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline truncate block"
                            >
                                {data.classDetail.googleMeetLink}
                            </a>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
        <!-- Stats Row -->
        {#if data.announcements?.length > 0}
            <div class="rounded-lg border border-red-200 bg-red-50">
                <!-- Header -->
                <button
                    type="button"
                    class="w-full flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-red-100/50 transition-colors rounded-lg"
                    onclick={() =>
                        (announcementsCollapsed = !announcementsCollapsed)}
                >
                    <BellIcon class="w-4 h-4 text-red-500 shrink-0" />
                    <p class="text-sm font-semibold text-red-600">
                        Announcements
                    </p>
                    <span
                        class="text-xs font-medium text-red-400 bg-red-100 border border-red-200 rounded-full px-2 py-0.5"
                    >
                        {data.announcements.length}
                    </span>
                    <span
                        class="ml-auto text-xs text-red-400 transition-transform duration-200 {announcementsCollapsed
                            ? 'rotate-0'
                            : 'rotate-180'}"
                    >
                        ▼
                    </span>
                </button>

                <!-- List -->
                {#if !announcementsCollapsed}
                    <div
                        transition:slide={{ duration: 200 }}
                        class="border-t border-red-200 overflow-y-auto max-h-48 px-4 py-3"
                    >
                        <ul
                            class="flex flex-col gap-1.5 pl-6 list-disc marker:text-red-300"
                        >
                            {#each data.announcements as announcement}
                                <li>
                                    <span
                                        class="text-sm font-medium text-red-600"
                                        >{announcement.title}</span
                                    >
                                    <span class="text-sm text-red-400 ml-1.5"
                                        >— {announcement.content}</span
                                    >
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </div>
        {/if}
        {#if data.group}
            <div class="flex flex-col sm:flex-row gap-3">
                <!-- Members stat -->
                <div
                    class="w-50 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4 flex items-center gap-4"
                >
                    <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 border border-amber-200"
                    >
                        <UsersIcon class="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <p
                            class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5"
                        >
                            Members
                        </p>
                        <p class="text-sm font-semibold text-stone-800">
                            {memberCount} / {maxMember}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Members Table -->
            <div class="rounded-xl border border-stone-200">
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-stone-50 hover:bg-stone-50">
                            <Table.Head
                                class="w-10 text-center text-stone-400 font-semibold"
                                >#</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Full Name</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Student Code</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Class</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Major</Table.Head
                            >
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Role</Table.Head
                            >
                            {#if isLeader && canEdit}
                                <Table.Head
                                    class="text-stone-600 font-semibold text-center"
                                    >Actions</Table.Head
                                >
                            {/if}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if groupMembers.length === 0}
                            <Table.Row>
                                <Table.Cell
                                    colspan={isLeader && canEdit ? 8 : 7}
                                    class="py-16 text-center"
                                >
                                    <div
                                        class="flex flex-col items-center gap-2 text-stone-300"
                                    >
                                        <UsersIcon class="w-10 h-10" />
                                        <p
                                            class="text-sm font-semibold text-stone-400"
                                        >
                                            No members found
                                        </p>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each groupMembers as member, i}
                                <Table.Row
                                    class="hover:bg-amber-50/40 transition-colors"
                                >
                                    <Table.Cell
                                        class="text-center text-stone-400 text-sm"
                                        >{i + 1}</Table.Cell
                                    >

                                    <Table.Cell>
                                        <div class="flex items-center gap-2.5">
                                            <div
                                                class="h-8 w-8 shrink-0 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm"
                                            >
                                                {member.fullName?.charAt(0) ??
                                                    "?"}
                                            </div>
                                            <div>
                                                <!-- ✅ Thêm onclick vào tên -->
                                                <button
                                                    type="button"
                                                    class="font-semibold text-stone-900 text-sm hover:text-amber-600 hover:underline cursor-pointer transition-colors"
                                                    onclick={() =>
                                                        openStudentDetail(
                                                            member.studentId,
                                                        )}
                                                >
                                                    {member.fullName}
                                                </button>
                                                {#if member.studentId === currentUser?.student?.studentId}
                                                    <span
                                                        class="ml-1.5 text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5"
                                                    >
                                                        You
                                                    </span>
                                                {/if}
                                            </div>
                                        </div>
                                    </Table.Cell>

                                    <Table.Cell
                                        class="font-mono text-stone-500 text-sm"
                                        >{member.studentCode}</Table.Cell
                                    >
                                    <Table.Cell class="text-stone-600 text-sm"
                                        >{member.classCode}</Table.Cell
                                    >
                                    <Table.Cell>
                                        <span
                                            class="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5"
                                        >
                                            {member.majorName}
                                        </span>
                                    </Table.Cell>

                                    <Table.Cell class="text-center">
                                        {#if member.isLeader}
                                            <span
                                                class="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5"
                                            >
                                                <CrownIcon class="h-3 w-3" /> Leader
                                            </span>
                                        {:else}
                                            <span
                                                class="text-xs text-stone-400 font-medium"
                                                >Member</span
                                            >
                                        {/if}
                                    </Table.Cell>

                                    {#if isLeader && canEdit}
                                        <Table.Cell>
                                            <div
                                                class="flex items-center justify-center gap-1"
                                            >
                                                {#if !member.isLeader}
                                                    <!-- Transfer Leader form -->
                                                    <form
                                                        id="promote-form-{member.studentId}"
                                                        method="POST"
                                                        action="?/transferLeader"
                                                        use:enhance={() => {
                                                            return async ({
                                                                result,
                                                            }) => {
                                                                const fullName =
                                                                    member?.fullName ??
                                                                    "member";
                                                                if (
                                                                    result.type ===
                                                                    "success"
                                                                ) {
                                                                    toast.success(
                                                                        `${fullName} has been promoted to Leader.`,
                                                                    );
                                                                    await invalidateAll();
                                                                } else if (
                                                                    result.type ===
                                                                    "failure"
                                                                ) {
                                                                    toast.error(
                                                                        String(
                                                                            (
                                                                                result.data as any
                                                                            )
                                                                                ?.message ??
                                                                                "Failed to promote leader",
                                                                        ),
                                                                    );
                                                                }
                                                            };
                                                        }}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="groupId"
                                                            value={data.group!
                                                                .groupId}
                                                        />
                                                        <input
                                                            type="hidden"
                                                            name="studentId"
                                                            value={member.studentId}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            type="button"
                                                            class="w-8 h-8 text-stone-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                                            title="Transfer Leader"
                                                            onclick={() =>
                                                                setActions({
                                                                    active: true,
                                                                    description: `Are you sure you want to promote ${member.fullName} to group Leader? They will have full admin rights.`,
                                                                    cb: async () => {
                                                                        (
                                                                            document.getElementById(
                                                                                `promote-form-${member.studentId}`,
                                                                            ) as HTMLFormElement
                                                                        )?.requestSubmit();
                                                                    },
                                                                })}
                                                        >
                                                            <CrownIcon
                                                                class="w-4 h-4"
                                                            />
                                                        </Button>
                                                    </form>

                                                    <!-- Remove Member form -->
                                                    <form
                                                        id="remove-form-{member.studentId}"
                                                        method="POST"
                                                        action="?/removeMember"
                                                        use:enhance={() => {
                                                            return async ({
                                                                result,
                                                            }) => {
                                                                if (
                                                                    result.type ===
                                                                    "success"
                                                                ) {
                                                                    toast.success(
                                                                        `${member.fullName} has been removed from the group.`,
                                                                    );
                                                                    await invalidateAll();
                                                                } else if (
                                                                    result.type ===
                                                                    "failure"
                                                                ) {
                                                                    toast.error(
                                                                        String(
                                                                            (
                                                                                result.data as any
                                                                            )
                                                                                ?.message ??
                                                                                "Failed to remove member",
                                                                        ),
                                                                    );
                                                                }
                                                            };
                                                        }}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="groupId"
                                                            value={data.group!
                                                                .groupId}
                                                        />
                                                        <input
                                                            type="hidden"
                                                            name="studentId"
                                                            value={member.studentId}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            type="button"
                                                            class="w-8 h-8 text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                            title="Remove member"
                                                            onclick={() =>
                                                                setActions({
                                                                    active: true,
                                                                    description: `Are you sure you want to remove ${member.fullName} from the group? This action cannot be undone.`,
                                                                    cb: async () => {
                                                                        (
                                                                            document.getElementById(
                                                                                `remove-form-${member.studentId}`,
                                                                            ) as HTMLFormElement
                                                                        )?.requestSubmit();
                                                                    },
                                                                })}
                                                        >
                                                            <XIcon
                                                                class="w-4 h-4"
                                                            />
                                                        </Button>
                                                    </form>
                                                {/if}
                                            </div>
                                        </Table.Cell>
                                    {/if}
                                </Table.Row>
                            {/each}
                        {/if}
                    </Table.Body>
                </Table.Root>
            </div>
        {:else}
            <!-- Empty state -->
            <div
                class="flex flex-col items-center justify-center flex-1 gap-5 py-32"
            >
                <div
                    class="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center"
                >
                    <UsersIcon class="w-10 h-10 text-amber-300" />
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
                    href="/app/student/view-group-in-class"
                    class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm"
                >
                    Register Group
                </a>
            </div>
        {/if}
        <!-- Current Topic -->
        <div class="rounded-xl border border-stone-200 bg-white">
            <!-- Header -->
            <div
                class="flex items-center gap-3 px-6 py-4 border-b border-stone-100"
            >
                <div
                    class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"
                >
                    <BookOpenIcon class="w-4 h-4 text-amber-500" />
                </div>
                <div>
                    <p
                        class="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none"
                    >
                        Topic
                    </p>
                    <h2
                        class="text-base font-extrabold text-stone-900 leading-tight"
                    >
                        {data.currentTopic
                            ? data.currentTopic.title
                            : "No Topic Registered"}
                    </h2>
                </div>

                {#if data.currentTopic}
                    <Badge
                        class="text-xs font-semibold border {statusClass[
                            data.currentTopic.status
                        ] ?? 'bg-stone-100 text-stone-500 border-stone-200'}"
                    >
                        {data.currentTopic.status}
                    </Badge>
                {/if}

                <!-- Actions -->
                <div class="ml-auto flex items-center gap-2">
                    {#if data.currentTopic}
                        <!-- View Detail — tất cả đều thấy -->
                        <Button
                            variant="outline"
                            class="gap-2 h-9 border-stone-200 text-stone-500 hover:bg-stone-50 cursor-pointer"
                            onclick={() =>
                                goto(
                                    `/app/student/topic/${data.currentTopic.topicId}`,
                                )}
                        >
                            <EyeIcon class="w-4 h-4" />
                            View Detail
                        </Button>

                        <!-- History — tất cả đều thấy -->
                        <Button
                            variant="outline"
                            class="gap-2 h-9 border-stone-200 text-stone-500 hover:bg-stone-50 cursor-pointer"
                            onclick={() => goto(`/app/student/topic/history`)}
                        >
                            <HistoryIcon class="w-4 h-4" />
                            Topic History
                        </Button>

                        <!-- Change Topic — chỉ leader -->
                        {#if isLeader && data.currentTopic?.status === "Approved"}
                            <Button
                                variant="outline"
                                class="gap-2 h-9 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                                onclick={() =>
                                    goto(`/app/student/topic/change`)}
                            >
                                <RefreshCwIcon class="w-4 h-4" />
                                Change Topic
                            </Button>
                        {/if}
                        {#if isLeader && data.currentTopic?.status === "Pending"}
                            <Button
                                variant="outline"
                                class="gap-2 h-9 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                                onclick={() =>
                                    goto(
                                        `/app/student/topic/${data.currentTopic.topicId}/update`,
                                    )}
                            >
                                <PencilIcon class="w-4 h-4" />
                                Update
                            </Button>
                        {/if}
                        {#if isLeader && data.currentTopic?.status === "Rejected"}
                            <Button
                                variant="outline"
                                class="gap-2 h-9 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                                onclick={() =>
                                    goto(`/app/student/topic/resubmit`)}
                            >
                                <RotateCcwIcon class="w-4 h-4" />
                                Resubmit
                            </Button>
                        {/if}
                    {:else}
                        <!-- History — tất cả đều thấy dù chưa có topic -->
                        <Button
                            variant="outline"
                            class="gap-2 h-9 border-stone-200 text-stone-500 hover:bg-stone-50 cursor-pointer"
                            onclick={() =>
                                goto(`/app/student/view-topic-history`)}
                        >
                            <HistoryIcon class="w-4 h-4" />
                            History
                        </Button>

                        <!-- Register — chỉ leader khi chưa có topic -->
                        {#if isLeader && data.group.status === "Approved"}
                            <Button
                                class="gap-2 h-9 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                                onclick={() =>
                                    goto(`/app/student/topic/register`)}
                            >
                                <PlusIcon class="w-4 h-4" />
                                Register Topic
                            </Button>
                        {/if}
                    {/if}
                </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5">
                {#if data.currentTopic}
                    <p class="text-sm text-stone-500 leading-relaxed mb-4">
                        {data.currentTopic.description}
                    </p>

                    {#if data.currentTopic.objectives}
                        <div>
                            <p
                                class="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2"
                            >
                                Objectives
                            </p>
                            <ul
                                class="flex flex-col gap-1 pl-5 list-disc marker:text-amber-300"
                            >
                                {#each data.currentTopic.objectives
                                    .split("\n")
                                    .filter((o: string) => o.trim()) as obj}
                                    <li class="text-sm text-stone-600">
                                        {obj.replace(/^-\s*/, "")}
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                {:else}
                    <!-- Empty state -->
                    <div
                        class="flex flex-col items-center justify-center py-10 gap-3 text-center"
                    >
                        <div
                            class="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center"
                        >
                            <BookOpenIcon class="w-7 h-7 text-amber-300" />
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-stone-600">
                                No topic registered yet
                            </p>
                            <p class="text-xs text-stone-400 mt-0.5">
                                {#if isLeader && canEdit}
                                    Register a topic to get started with your
                                    project.
                                {:else}
                                    Waiting for the leader to register a topic.
                                {/if}
                            </p>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        <!-- Mentor Section -->
        <div class="rounded-xl border border-stone-200 bg-white">
            <!-- Header -->
            <div
                class="flex items-center gap-3 px-6 py-4 border-b border-stone-100"
            >
                <div
                    class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"
                >
                    <UserCircleIcon class="w-4 h-4 text-amber-500" />
                </div>
                <div>
                    <p
                        class="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none"
                    >
                        Mentor
                    </p>
                    <h2
                        class="text-base font-extrabold text-stone-900 leading-tight"
                    >
                        {data?.group?.mentor
                            ? data.group.mentor.fullName
                            : "No Mentor Assigned"}
                    </h2>
                </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5">
                {#if data.group?.mentor}
                    <div class="flex items-center gap-4">
                        <!-- Avatar -->
                        <div
                            class="h-12 w-12 shrink-0 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-base"
                        >
                            {data.group.mentor.fullName?.charAt(0) ?? "?"}
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                                <p class="text-sm font-semibold text-stone-900">
                                    {data.group.mentor.fullName}
                                </p>
                                <span
                                    class="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
                                >
                                    {data.group.mentor.mentorCode}
                                </span>
                            </div>
                            <p class="text-sm text-stone-500">
                                {data.group.mentor.email}
                            </p>
                        </div>

                        <!-- Stats -->
                        <div class="flex gap-3 shrink-0">
                            <div
                                class="rounded-lg bg-stone-50 border border-stone-100 px-4 py-2.5 text-center min-w-[90px]"
                            >
                                <p
                                    class="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5"
                                >
                                    Phone
                                </p>
                                <p class="text-sm font-semibold text-stone-600">
                                    {data.group.mentor.phoneNumber ?? "—"}
                                </p>
                            </div>
                            <div
                                class="rounded-lg bg-stone-50 border border-stone-100 px-4 py-2.5 text-center min-w-[90px]"
                            >
                                <p
                                    class="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5"
                                >
                                    Field
                                </p>
                                <p class="text-sm font-semibold text-stone-600">
                                    {data.group.mentor.fieldOfWork ?? "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                {:else}
                    <!-- Empty state -->
                    <div
                        class="flex flex-col items-center justify-center py-10 gap-3 text-center"
                    >
                        <div
                            class="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center"
                        >
                            <UserCircleIcon class="w-7 h-7 text-amber-300" />
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-stone-600">
                                No mentor has been assigned yet
                            </p>
                            <p class="text-xs text-stone-400 mt-0.5">
                                Waiting for the instructor to assign a mentor to
                                your group.
                            </p>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        <!-- Navigation Groups -->
        <div class="flex flex-col gap-8 pb-6">
            <div class="flex items-center gap-3">
                <h2
                    class="text-sm font-bold text-stone-400 uppercase tracking-widest"
                >
                    Quick Navigation
                </h2>
                <div class="flex-1 h-px bg-stone-100"></div>
            </div>

            {#each finalNavGroups as group}
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2">
                        <span
                            class="text-xs font-bold text-amber-600 uppercase tracking-widest"
                            >{group.groupLabel}</span
                        >
                        <div class="flex-1 h-px bg-amber-100"></div>
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {#each group.items as item}
                            <a
                                href={item.url}
                                class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-50 border border-stone-200
                                       text-sm font-medium text-stone-600 hover:bg-amber-50 hover:border-amber-200
                                       hover:text-amber-700 transition-colors duration-150"
                            >
                                {item.name}
                            </a>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<StudentDetailDialog
    bind:open={studentDetailOpen}
    studentId={selectedStudentId}
    currentUserId={currentUser?.student?.studentId}
/>

<InviteMemberDialog
    bind:open={inviteMemberOpen}
    groupId={Number(data.group?.groupId)}
    classId={data.currentUser?.student?.classId}
    onSuccess={async () => await invalidateAll()}
/>

<JoinRequestDialog
    bind:open={joinRequestOpen}
    joinRequests={data.joinRequests ?? []}
    onSuccess={async () => await invalidateAll()}
/>

<InvitationsDialog
    bind:open={invitationsOpen}
    invitations={data.invitations ?? []}
/>
