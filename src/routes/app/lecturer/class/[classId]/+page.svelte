<script lang="ts">
    import {
        ArrowLeftIcon,
        UsersIcon,
        UserRoundSearchIcon,
        FolderClockIcon,
        ExternalLinkIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
        EyeIcon,
        PencilIcon,
        Trash2Icon,
        PlusIcon,
        GitPullRequestIcon,
        RefreshCwIcon,
        CalendarClockIcon,
        CalendarDaysIcon,
    } from "lucide-svelte";
    import type { PageData } from "../$types";
    import type { NavigationGroup } from "../../../+page.svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { getHeaderCtx } from "$lib/contexts/header.context.svelte";
    import { onDestroy } from "svelte";
    import { setActions } from "$lib/stores/actions";
    import { toast } from "svelte-sonner";
    import { page } from "$app/state";
    import DivideIntoGroupDialog from "./components/DivideIntoGroupDialog.svelte";
    import CreateGroupDialog from "./components/CreateGroupDialog.svelte";
    import { deserialize, enhance } from "$app/forms";
    import SetDeadlineDialog from "./components/SetDeadlineDialog.svelte";

    let { data } = $props<{ data: PageData }>();
    const classId = data.classDetails?.classId;

    const headerCtx = getHeaderCtx();
    $effect(() => {
        headerCtx.setSubtitle(data.classDetails?.classCode ?? null);
    });
    onDestroy(() => {
        headerCtx.setSubtitle(null);
    });

    // --- Navigation groups ---
    const lecturerStudentManage: NavigationGroup = {
        groupLabel: "Others",
        items: [
            {
                name: "Assignment Management",
                url: `/app/lecturer/class/${classId}/assignments-management`,
            },
            {
                name: "View Student List",
                url: `/app/lecturer/class/${classId}/student-list`,
            },
            {
                name: "View Unassigned Student List",
                url: `/app/lecturer/class/${classId}/view-unassigned-student`,
            },
        ],
    };
    // const lecturerProjectManage: NavigationGroup = {
    //     groupLabel: "Student Project",
    //     items: [
    //         {
    //             name: "View Topic List",
    //             url: `/app/lecturer/class/${classId}/topic-list`,
    //         },
    //         {
    //             name: "Review Group Topic Registration",
    //             url: `/app/lecturer/class/${classId}/topic-registration`,
    //         },
    //         {
    //             name: "View project documents",
    //             url: `/app/lecturer/class/${classId}/project-documents`,
    //         },
    //     ],
    // };
    // const lecturerAssignmentManage: NavigationGroup = {
    //     groupLabel: "Assignment / Checkpoint Management",
    //     items: [
    //         {
    //             name: "Checkpoints Management",
    //             url: `/app/lecturer/class/${classId}/checkpoints-management`,
    //         },
    //         {
    //             name: "Assignment Management",
    //             url: `/app/lecturer/class/${classId}/assignments-management`,
    //         },
    //     ],
    // };
    const finalNavGroups = [
        // lecturerAssignmentManage,
        lecturerStudentManage,
        // lecturerProjectManage,
    ];

    // --- Group table ---
    let groups = $derived(data?.groups || []);
    let totalCount = $derived(data?.totalCount || 0);
    let deadlines = $derived(data?.deadlines || null);

    let currentPage = $state(Number(page.url.searchParams.get("page") ?? 1));
    let limit = $state(Number(page.url.searchParams.get("limit") ?? 10));
    const totalPages = $derived(Math.ceil(totalCount / limit));

    function buildParams(overrides: Record<string, string | number> = {}) {
        const params = new URLSearchParams(page.url.searchParams);
        params.set("page", String(currentPage));
        params.set("limit", String(limit));
        for (const [k, v] of Object.entries(overrides))
            params.set(k, String(v));
        return params.toString();
    }

    function goToPage(p: number) {
        currentPage = p;
        goto(`?${buildParams({ page: p })}`, {
            replaceState: true,
            noScroll: true,
        });
    }

    function changePageSize(size: number) {
        limit = size;
        currentPage = 1;
        goto(`?${buildParams({ page: 1, limit: size })}`, {
            replaceState: true,
            noScroll: true,
        });
    }

    const pageNumbers = $derived(() => {
        const delta = 2;
        const range: number[] = [];
        for (
            let i = Math.max(1, currentPage - delta);
            i <= Math.min(totalPages, currentPage + delta);
            i++
        )
            range.push(i);
        return range;
    });

    const statusClass: Record<string, string> = {
        Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Draft: "bg-stone-100 text-stone-500 border-stone-200",
        Pending: "bg-amber-50 text-amber-700 border-amber-200",
        Rejected: "bg-red-50 text-red-700 border-red-200",
    };

    // --- Actions ---
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
                console.log("result: ", result);
                if (result?.type === "failure") {
                    let message = "Failed to publish groups.";
                    try {
                        const parsed = JSON.parse(result.data);
                        message = parsed[1] ?? message;
                    } catch {}

                    toast.error(message);
                    return;
                }
                toast.success(
                    result?.data?.message ?? "Groups published successfully!",
                );
                await invalidateAll();
            },
        });
    }

    function handleDeleteGroup(groupName: string, groupId: number) {
        setActions({
            active: true,
            description: `Are you sure want to delete group ${groupName}. This action cannot be undone.`,
            cb: async () => {
                const formData = new FormData();
                formData.append("groupId", String(groupId));
                const res = await fetch("?/deleteGroup", {
                    method: "POST",
                    body: formData,
                });
                const result = deserialize(await res.text());
                console.log(result);
                if (result?.type === "failure") {
                    toast.error(
                        String(result?.data?.message) ??
                            `Failed to delete group ${groupName}.`,
                    );
                    return;
                }
                toast.success(
                    // result?.data?.message ??
                        `Group ${groupName} deleted successfully!`,
                );
                await invalidateAll();
            },
        });
    }

    //create group
    let createDialogOpen = $state(false);
    let isFetchingStudents = $state(false);

    const availableStudents = $derived((page.form as any)?.students ?? []);
    const handleFetchStudents: import("@sveltejs/kit").SubmitFunction = () => {
        isFetchingStudents = true;
        return async ({ update }) => {
            await update();
            isFetchingStudents = false;
            createDialogOpen = true;
        };
    };

    // --- Deadline ---
    let deadlineGroupOpen = $state(false);
    let deadlineTopicOpen = $state(false);

    const groupDeadline = $derived(
        data?.deadlines?.groupFormationEndDate ?? null,
    ); // Date string | null
    const topicDeadline = $derived(
        data?.deadlines?.topicRegistrationEndDate ?? null,
    ); // Date string | null

    function formatDeadline(dateStr: string | null): string {
        if (!dateStr) return "Not set";
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(dateStr));
    }

    function isExpired(dateStr: string | null): boolean {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    }
</script>

<div class="h-[calc(100vh-4rem)] flex flex-col bg-white overflow-hidden">
    <!-- Header -->
    <div class="flex-none px-8 pt-6 pb-5 border-b border-stone-100">
        <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <Button
                    variant="ghost"
                    onclick={() => goto(`/app/lecturer/class`)}
                    class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 px-2 py-1.5 h-auto rounded-lg"
                >
                    <ArrowLeftIcon class="w-4 h-4" />
                    <span class="text-sm font-medium">Back</span>
                </Button>
                <span class="text-stone-200">/</span>
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
                            Management
                        </p>
                        <h1
                            class="text-lg font-extrabold text-stone-900 leading-tight"
                        >
                            Group List
                        </h1>
                    </div>
                </div>
                <Badge
                    class="bg-stone-100 text-stone-600 border-stone-200 border font-semibold"
                >
                    {totalCount} groups
                </Badge>
            </div>

            <!-- Toolbar -->
            <div class="flex items-center gap-2">
                <Button
                    variant="outline"
                    class="gap-2 h-9 border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 cursor-pointer"
                    onclick={() => invalidateAll()}
                >
                    <RefreshCwIcon class="w-4 h-4" />
                    Refresh
                </Button>
                <Button
                    variant="outline"
                    class="gap-2 h-9 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
                    onclick={handlePublishGroups}
                >
                    <ExternalLinkIcon class="w-4 h-4" />
                    Publish Groups
                </Button>
                <Button
                    class="gap-2 h-9 bg-stone-900 hover:bg-stone-800 text-white cursor-pointer"
                    onclick={() => (autoGroupOpen = true)}
                >
                    <UsersIcon class="w-4 h-4" />
                    Divide into Groups
                </Button>
                <Button
                    class="gap-2 h-9 bg-stone-900 hover:bg-stone-800 text-white cursor-pointer"
                    disabled={isFetchingStudents}
                    onclick={() => {
                        document
                            .querySelector<HTMLFormElement>(
                                "#fetch-students-form",
                            )
                            ?.requestSubmit();
                    }}
                >
                    {#if isFetchingStudents}
                        <span
                            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        ></span>
                    {:else}
                        <PlusIcon class="w-4 h-4" />
                    {/if}
                    Add Group
                </Button>
            </div>
        </div>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-10">
        <!-- ─── Deadline Cards ──────────────────────────────────────────── -->
        <div class="flex flex-col sm:flex-row gap-3">
            <!-- Group Formation Deadline -->
            <div
                class="flex-1 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4 flex items-center justify-between gap-4"
            >
                <div class="flex items-center gap-3 min-w-0">
                    <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 border border-amber-200"
                    >
                        <CalendarClockIcon class="w-4 h-4 text-amber-600" />
                    </div>
                    <div class="min-w-0">
                        <p
                            class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5"
                        >
                            Group Formation Deadline
                        </p>
                        <p
                            class="text-sm font-semibold truncate
                    {groupDeadline === null
                                ? 'text-stone-400 italic'
                                : isExpired(groupDeadline)
                                  ? 'text-red-500'
                                  : 'text-stone-800'}"
                        >
                            {#if groupDeadline === null}
                                Not set
                            {:else if isExpired(groupDeadline)}
                                ⚠ Expired · {formatDeadline(groupDeadline)}
                            {:else}
                                {formatDeadline(groupDeadline)}
                            {/if}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    class="h-8 px-3 text-xs border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 shrink-0 cursor-pointer"
                    onclick={() => (deadlineGroupOpen = true)}
                >
                    <CalendarClockIcon class="w-3.5 h-3.5 mr-1" />
                    {groupDeadline ? "Update" : "Set Deadline"}
                </Button>
            </div>

            <!-- Topic Registration Deadline -->
            <div
                class="flex-1 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4 flex items-center justify-between gap-4"
            >
                <div class="flex items-center gap-3 min-w-0">
                    <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 border border-blue-200"
                    >
                        <CalendarDaysIcon class="w-4 h-4 text-blue-600" />
                    </div>
                    <div class="min-w-0">
                        <p
                            class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5"
                        >
                            Topic Registration Deadline
                        </p>
                        <p
                            class="text-sm font-semibold truncate
                    {topicDeadline === null
                                ? 'text-stone-400 italic'
                                : isExpired(topicDeadline)
                                  ? 'text-red-500'
                                  : 'text-stone-800'}"
                        >
                            {#if topicDeadline === null}
                                Not set
                            {:else if isExpired(topicDeadline)}
                                ⚠ Expired · {formatDeadline(topicDeadline)}
                            {:else}
                                {formatDeadline(topicDeadline)}
                            {/if}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    class="h-8 px-3 text-xs border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 shrink-0 cursor-pointer"
                    onclick={() => (deadlineTopicOpen = true)}
                >
                    <CalendarDaysIcon class="w-3.5 h-3.5 mr-1" />
                    {topicDeadline ? "Update" : "Set Deadline"}
                </Button>
            </div>
        </div>
        <!-- Group Table -->
        <div>
            <div class="rounded-xl border border-stone-200 overflow-hidden">
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-stone-50 hover:bg-stone-50">
                            <Table.Head
                                class="w-10 text-center text-stone-400 font-semibold"
                                >#</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Group Name</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Leader</Table.Head
                            >
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Members</Table.Head
                            >
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Max</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Topic Title</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Topic Status</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Group Status</Table.Head
                            >
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Actions</Table.Head
                            >
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if groups.length === 0}
                            <Table.Row>
                                <Table.Cell
                                    colspan={9}
                                    class="py-16 text-center"
                                >
                                    <!-- giữ nguyên empty state, chỉ đổi colspan 7 → 9 -->
                                    <div
                                        class="flex flex-col items-center gap-2 text-stone-300"
                                    >
                                        <UsersIcon class="w-10 h-10" />
                                        <p
                                            class="text-sm font-semibold text-stone-400"
                                        >
                                            No groups found
                                        </p>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each groups as group, i}
                                {@const rowNum =
                                    (currentPage - 1) * limit + i + 1}
                                <Table.Row
                                    class="hover:bg-amber-50/40 transition-colors group"
                                >
                                    <Table.Cell
                                        class="text-center text-stone-400 text-sm"
                                        >{rowNum}</Table.Cell
                                    >

                                    <Table.Cell
                                        class="font-semibold text-stone-900 hover:text-amber-600 transition-colors text-left cursor-pointer"
                                        onclick={() =>
                                            goto(
                                                `/app/lecturer/class/${classId}/group/${group.id}`,
                                            )}
                                    >
                                        {group.name}
                                    </Table.Cell>

                                    <Table.Cell class="text-stone-600 text-sm"
                                        >{group.leaderName ?? "—"}</Table.Cell
                                    >

                                    <Table.Cell class="text-center">
                                        <span
                                            class="text-sm font-semibold text-stone-700"
                                            >{group.memberCount}</span
                                        >
                                    </Table.Cell>

                                    <Table.Cell class="text-center">
                                        <span class="text-sm text-stone-400"
                                            >{group.maxMember}</span
                                        >
                                    </Table.Cell>

                                    <!-- Topic Title -->
                                    <Table.Cell class="max-w-[200px]">
                                        {#if group.topic?.title}
                                            <button
                                                type="button"
                                                class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline truncate block max-w-full text-left cursor-pointer"
                                                onclick={() =>
                                                    goto(
                                                        `/app/lecturer/class/${classId}/group/${group.id}/topic/${group.topic.id}`,
                                                    )}
                                            >
                                                {group.topic.title}
                                            </button>
                                        {:else}
                                            <span
                                                class="text-sm text-stone-300 italic"
                                                >—</span
                                            >
                                        {/if}
                                    </Table.Cell>

                                    <!-- Topic Status -->
                                    <Table.Cell>
                                        {#if group.topic?.status}
                                            <Badge
                                                class="text-xs font-semibold border {statusClass[
                                                    group.topic.status
                                                ] ??
                                                    'bg-gray-50 text-gray-500 border-gray-200'}"
                                            >
                                                {group.topic.status}
                                            </Badge>
                                        {:else}
                                            <span
                                                class="text-sm text-stone-300 italic"
                                                >—</span
                                            >
                                        {/if}
                                    </Table.Cell>

                                    <!-- Group Status -->
                                    <Table.Cell>
                                        <Badge
                                            class="text-xs font-semibold border {statusClass[
                                                group.status
                                            ] ?? statusClass['Inactive']}"
                                        >
                                            {group.status}
                                        </Badge>
                                    </Table.Cell>

                                    <Table.Cell>
                                        <div
                                            class="flex items-center justify-center gap-1"
                                        >
                                            {#if group.isChangeTopic}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    class="relative w-8 h-8 text-white bg-orange-500 hover:bg-orange-600 cursor-pointer rounded-md shadow-md
                                                            animate-pulse"
                                                    onclick={() =>
                                                        goto(
                                                            `/app/lecturer/class/${classId}/group/${group.id}/topic/review-change-request`,
                                                        )}
                                                    title="Review Topic Change Request"
                                                >
                                                    <GitPullRequestIcon
                                                        class="w-4 h-4"
                                                    />
                                                    <!-- Badge chấm đỏ nhấp nháy -->
                                                    <span
                                                        class="absolute -top-1 -right-1 flex h-2.5 w-2.5"
                                                    >
                                                        <span
                                                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                                                        ></span>
                                                        <span
                                                            class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"
                                                        ></span>
                                                    </span>
                                                </Button>
                                            {/if}
                                            <!-- <Button
                                                variant="ghost"
                                                size="icon"
                                                class="w-8 h-8 text-stone-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                                onclick={() =>
                                                    goto(
                                                        `/app/lecturer/class/${classId}/manage-groups/${group.id}/assign-mentor`,
                                                    )}
                                                title="Assign mentor"
                                            >
                                                <UserRoundSearchIcon
                                                    class="w-4 h-4"
                                                />
                                            </Button> -->
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="w-8 h-8 text-stone-400 hover:text-violet-600 hover:bg-violet-50 cursor-pointer"
                                                onclick={() =>
                                                    goto(
                                                        `/app/lecturer/class/${classId}/group/${group.id}/topic/history`,
                                                    )}
                                                title="Topic history"
                                            >
                                                <FolderClockIcon
                                                    class="w-4 h-4"
                                                />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="w-8 h-8 text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                onclick={() =>
                                                    handleDeleteGroup(
                                                        group.name,
                                                        group.id,
                                                    )}
                                                title="Delete group"
                                            >
                                                <Trash2Icon class="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        {/if}
                    </Table.Body>
                </Table.Root>
            </div>

            <!-- Pagination -->
            {#if groups.length > 0}
                <div
                    class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4"
                >
                    <p class="text-sm text-stone-400">
                        Showing
                        <span class="font-semibold text-stone-600">
                            {(currentPage - 1) * limit + 1}–{Math.min(
                                currentPage * limit,
                                totalCount,
                            )}
                        </span>
                        of
                        <span class="font-semibold text-stone-600"
                            >{totalCount}</span
                        > groups
                    </p>

                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-stone-400"
                                >Rows per page</span
                            >
                            <Select.Root
                                type="single"
                                value={String(limit)}
                                onValueChange={(v) =>
                                    v && changePageSize(Number(v))}
                            >
                                <Select.Trigger
                                    class="w-16 h-8 text-sm border-stone-200"
                                >
                                    {limit}
                                </Select.Trigger>
                                <Select.Content>
                                    {#each [5, 10, 20, 50] as size}
                                        <Select.Item value={String(size)}
                                            >{size}</Select.Item
                                        >
                                    {/each}
                                </Select.Content>
                            </Select.Root>
                        </div>

                        <div class="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                class="w-8 h-8 border-stone-200"
                                disabled={currentPage <= 1}
                                onclick={() => goToPage(currentPage - 1)}
                            >
                                <ChevronLeftIcon class="w-4 h-4" />
                            </Button>

                            {#if pageNumbers()[0] > 1}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    class="w-8 h-8 text-sm border-stone-200"
                                    onclick={() => goToPage(1)}>1</Button
                                >
                                {#if pageNumbers()[0] > 2}<span
                                        class="text-stone-300 px-1">…</span
                                    >{/if}
                            {/if}

                            {#each pageNumbers() as p}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    class="w-8 h-8 text-sm {p === currentPage
                                        ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                                        : 'border-stone-200 text-stone-600'}"
                                    onclick={() => goToPage(p)}>{p}</Button
                                >
                            {/each}

                            {#if pageNumbers()[pageNumbers().length - 1] < totalPages}
                                {#if pageNumbers()[pageNumbers().length - 1] < totalPages - 1}<span
                                        class="text-stone-300 px-1">…</span
                                    >{/if}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    class="w-8 h-8 text-sm border-stone-200"
                                    onclick={() => goToPage(totalPages)}
                                    >{totalPages}</Button
                                >
                            {/if}

                            <Button
                                variant="outline"
                                size="icon"
                                class="w-8 h-8 border-stone-200"
                                disabled={currentPage >= totalPages}
                                onclick={() => goToPage(currentPage + 1)}
                            >
                                <ChevronRightIcon class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            {/if}
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

<form
    method="POST"
    action="?/getStudentAvailable"
    use:enhance={handleFetchStudents}
    id="fetch-students-form"
>
    <input type="hidden" name="classId" value={data.classId} />
</form>

<DivideIntoGroupDialog
    bind:open={autoGroupOpen}
    classId={data?.classId}
    totalStudent={data?.totalStudent}
    onClose={() => (autoGroupOpen = false)}
/>

<CreateGroupDialog
    bind:open={createDialogOpen}
    students={availableStudents}
    {classId}
/>

<SetDeadlineDialog
    bind:open={deadlineGroupOpen}
    type="group"
    {classId}
    currentDeadline={groupDeadline}
    onSuccess={async () => await invalidateAll()}
/>

<SetDeadlineDialog
    bind:open={deadlineTopicOpen}
    type="topic"
    {classId}
    currentDeadline={topicDeadline}
    onSuccess={async () => await invalidateAll()}
/>
