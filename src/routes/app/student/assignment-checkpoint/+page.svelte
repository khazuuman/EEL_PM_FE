<!-- src/routes/app/student/assignments/+page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import {
        ArrowLeftIcon,
        CheckSquareIcon,
        ClipboardListIcon,
        CalendarIcon,
        TrophyIcon,
        LayersIcon,
        ChevronRightIcon,
        ChevronLeftIcon,
        ClockIcon,
        CheckCircle2Icon,
        XCircleIcon,
        AlertCircleIcon,
        TagIcon,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

    let checkpoints = $derived(
        [...(data.checkpoints ?? [])].sort(
            (a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0),
        ),
    );
    let otherAssignments = $derived(data.otherAssignments ?? []);
    let otherAssignmentsPagination = $derived(data.otherAssignmentsPagination);

    let checkpointType = $derived(
        checkpoints.length > 0 ? checkpoints[0].type : "Checkpoint",
    );

    function goToPage(page: number) {
        const url = new URL(window.location.href);
        url.searchParams.set("page", String(page));
        goto(url.toString());
    }

    function formatDate(val: string | undefined): string {
        if (!val) return "—";
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${dd}/${mm}/${yyyy} ${HH}:${min}`;
    }

    // Student-specific status classes
    const submissionStatusClass: Record<string, string> = {
        "Not Submitted": "bg-stone-100 text-stone-500 border-stone-200",
        Submitted: "bg-blue-100 text-blue-700 border-blue-200",
        Graded: "bg-green-100 text-green-700 border-green-200",
        Late: "bg-orange-100 text-orange-600 border-orange-200",
        Overdue: "bg-red-100 text-red-600 border-red-200",
    };

    const assignmentStatusClass: Record<string, string> = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Inactive: "bg-stone-100 text-stone-500 border-stone-200",
        Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
        Closed: "bg-red-100 text-red-600 border-red-200",
    };

    function getSubmissionIcon(status: string) {
        if (status === "Submitted" || status === "Graded")
            return CheckCircle2Icon;
        if (status === "Overdue") return XCircleIcon;
        if (status === "Late") return AlertCircleIcon;
        return ClockIcon;
    }
</script>

<div class="bg-white w-full px-10 pt-6 pb-12 min-h-screen">
    <!-- Back -->
    <div class="flex items-center h-10 mb-2">
        <Button
            variant="ghost"
            onclick={() => goto(`/app/student`)}
            class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 cursor-pointer -ml-3"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            Back
        </Button>
    </div>

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0"
            >
                <CheckSquareIcon class="w-5 h-5 text-indigo-500" />
            </div>
            <div>
                <p
                    class="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest leading-none mb-0.5"
                >
                    Student
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    My Assignments
                </h1>
            </div>
        </div>

        <!-- Group info badge -->
        {#if checkpoints[0]?.groupName}
            <div
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200"
            >
                <span class="text-xs text-stone-400 font-medium">Group</span>
                <span class="text-sm font-bold text-stone-700">
                    {checkpoints[0].groupName}
                </span>
            </div>
        {/if}
    </div>

    <div class="flex flex-col gap-8">
        <!-- ── SECTION 1: Checkpoints / Outcomes ─────────────────── -->
        <section class="flex flex-col gap-4">
            <!-- Section Header -->
            <div class="flex items-center gap-3">
                <div
                    class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"
                >
                    {#if checkpointType === "Outcome"}
                        <TrophyIcon class="w-4 h-4 text-purple-500" />
                    {:else}
                        <LayersIcon class="w-4 h-4 text-amber-500" />
                    {/if}
                </div>
                <div>
                    <p
                        class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5"
                    >
                        Milestones
                    </p>
                    <h2
                        class="text-base font-extrabold text-stone-900 leading-tight"
                    >
                        {checkpointType === "Outcome"
                            ? "Outcomes"
                            : "Checkpoints"}
                    </h2>
                </div>
                <span
                    class="text-xs font-bold text-stone-400 bg-stone-100 border border-stone-200 rounded-full px-2.5 py-0.5"
                >
                    {checkpoints.length}
                </span>
            </div>

            <!-- Checkpoints Table -->
            <div class="rounded-xl border border-stone-200 overflow-hidden">
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-stone-50 hover:bg-stone-50">
                            <Table.Head
                                class="w-12 text-center text-stone-400 font-semibold"
                                >#</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Title</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <TagIcon class="w-3.5 h-3.5" /> Grade Item
                                </div>
                            </Table.Head>
                            <Table.Head class="text-stone-600 font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <CalendarIcon class="w-3.5 h-3.5" /> Due Date
                                </div>
                            </Table.Head>
                            <Table.Head class="text-stone-600 font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <TrophyIcon class="w-3.5 h-3.5" /> Score
                                </div>
                            </Table.Head>
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Assignment</Table.Head
                            >
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Submission</Table.Head
                            >
                            <!-- <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Action</Table.Head
                            > -->
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if checkpoints.length === 0}
                            <Table.Row>
                                <Table.Cell
                                    colspan={8}
                                    class="py-16 text-center"
                                >
                                    <div
                                        class="flex flex-col items-center gap-2 text-stone-300"
                                    >
                                        <LayersIcon class="w-10 h-10" />
                                        <p
                                            class="text-sm font-semibold text-stone-400"
                                        >
                                            No {checkpointType === "Outcome"
                                                ? "outcomes"
                                                : "checkpoints"} yet
                                        </p>
                                        <p class="text-xs text-stone-300">
                                            Your lecturer hasn't created any yet
                                        </p>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each checkpoints as cp, i (cp.id)}
                                {@const StatusIcon = getSubmissionIcon(
                                    cp.status,
                                )}
                                <Table.Row
                                    class="hover:bg-amber-50/40 transition-colors"
                                >
                                    <!-- Index tự sinh (1-based) -->
                                    <Table.Cell
                                        class="text-center text-stone-400 text-sm font-mono"
                                    >
                                        {i + 1}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <button
                                            type="button"
                                            onclick={() =>
                                                goto(
                                                    `/app/student/assignment-checkpoint/${cp.id}`,
                                                )}
                                            class="text-sm font-semibold text-stone-900 hover:text-amber-600 hover:underline transition-colors cursor-pointer text-left"
                                        >
                                            {cp.title}
                                        </button>
                                    </Table.Cell>
                                    <!-- Grade Item column (checkpoint/outcome only) -->
                                    <Table.Cell>
                                        {#if cp.gradeItem}
                                            <div class="flex flex-col gap-0.5">
                                                <span class="text-sm font-semibold text-stone-700">
                                                    {cp.gradeItem.name}
                                                </span>
                                                <span class="text-[11px] text-stone-400">
                                                    Weight: {cp.gradeItem.weight}%
                                                </span>
                                            </div>
                                        {:else}
                                            <span class="text-sm text-stone-300">—</span>
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-col gap-0.5">
                                            <span
                                                class="text-sm text-stone-500"
                                            >
                                                {formatDate(cp.dueDate)}
                                            </span>
                                            {#if cp.isLate}
                                                <span
                                                    class="text-[10px] font-bold text-orange-500 uppercase tracking-wide"
                                                    >Late</span
                                                >
                                            {/if}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if cp.score !== null && cp.score !== undefined}
                                            <span
                                                class="text-sm font-bold text-stone-800"
                                            >
                                                {cp.score}
                                                <span
                                                    class="text-xs font-normal text-stone-400"
                                                    >/ {cp.maxScore}</span
                                                >
                                            </span>
                                        {:else}
                                            <span class="text-sm text-stone-300"
                                                >— / {cp.maxScore}</span
                                            >
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <Badge
                                            class="text-xs font-semibold border pointer-events-none {assignmentStatusClass[
                                                cp.assignmentStatus
                                            ] ??
                                                'bg-stone-100 text-stone-500 border-stone-200'}"
                                        >
                                            {cp.assignmentStatus}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <div
                                            class="flex items-center justify-center gap-1.5"
                                        >
                                            <StatusIcon
                                                class="w-3.5 h-3.5 {cp.status ===
                                                    'Submitted' ||
                                                cp.status === 'Graded'
                                                    ? 'text-green-500'
                                                    : cp.status === 'Overdue'
                                                      ? 'text-red-400'
                                                      : cp.status === 'Late'
                                                        ? 'text-orange-400'
                                                        : 'text-stone-300'}"
                                            />
                                            <Badge
                                                class="text-xs font-semibold border pointer-events-none {submissionStatusClass[
                                                    cp.status
                                                ] ??
                                                    'bg-stone-100 text-stone-500 border-stone-200'}"
                                            >
                                                {cp.status}
                                            </Badge>
                                        </div>
                                    </Table.Cell>
                                    <!-- <Table.Cell class="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onclick={() =>
                                                goto(
                                                    `/app/student/assignment-checkpoint/${cp.id}`,
                                                )}
                                            class="gap-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer h-7 text-xs"
                                        >
                                            View
                                        </Button>
                                    </Table.Cell> -->
                                </Table.Row>
                            {/each}
                        {/if}
                    </Table.Body>
                </Table.Root>
            </div>
        </section>

        <!-- ── SECTION 2: Other Assignments ──────────────────────── -->
        <section class="flex flex-col gap-4">
            <!-- Section Header -->
            <div class="flex items-center gap-3">
                <div
                    class="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0"
                >
                    <ClipboardListIcon class="w-4 h-4 text-sky-500" />
                </div>
                <div>
                    <p
                        class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5"
                    >
                        Small Tasks
                    </p>
                    <h2
                        class="text-base font-extrabold text-stone-900 leading-tight"
                    >
                        Other Assignments
                    </h2>
                </div>
                <span
                    class="text-xs font-bold text-stone-400 bg-stone-100 border border-stone-200 rounded-full px-2.5 py-0.5"
                >
                    {otherAssignmentsPagination?.totalItems ??
                        otherAssignments.length}
                </span>
            </div>

            <!-- Other Assignments Table (no Grade Item column, no Type column) -->
            <div class="rounded-xl border border-stone-200 overflow-hidden">
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-stone-50 hover:bg-stone-50">
                            <Table.Head
                                class="w-12 text-center text-stone-400 font-semibold"
                                >#</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Title</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <CalendarIcon class="w-3.5 h-3.5" /> Due Date
                                </div>
                            </Table.Head>
                            <Table.Head class="text-stone-600 font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <TrophyIcon class="w-3.5 h-3.5" /> Score
                                </div>
                            </Table.Head>
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Assignment</Table.Head
                            >
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Submission</Table.Head
                            >
                            <!-- <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Action</Table.Head
                            > -->
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if otherAssignments.length === 0}
                            <Table.Row>
                                <Table.Cell
                                    colspan={7}
                                    class="py-16 text-center"
                                >
                                    <div
                                        class="flex flex-col items-center gap-2 text-stone-300"
                                    >
                                        <ClipboardListIcon class="w-10 h-10" />
                                        <p
                                            class="text-sm font-semibold text-stone-400"
                                        >
                                            No assignments yet
                                        </p>
                                        <p class="text-xs text-stone-300">
                                            Your lecturer hasn't created any yet
                                        </p>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each otherAssignments as asgn, i (asgn.id)}
                                {@const StatusIcon = getSubmissionIcon(
                                    asgn.status,
                                )}
                                <Table.Row
                                    class="hover:bg-sky-50/40 transition-colors"
                                >
                                    <!-- Global index across pages -->
                                    <Table.Cell
                                        class="text-center text-stone-400 text-sm font-mono"
                                    >
                                        {((otherAssignmentsPagination?.page ??
                                            1) -
                                            1) *
                                            (otherAssignmentsPagination?.limit ??
                                                10) +
                                            i +
                                            1}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <button
                                            type="button"
                                            onclick={() =>
                                                goto(
                                                    `/app/student/assignment-checkpoint/${asgn.id}`,
                                                )}
                                            class="text-sm font-semibold text-stone-900 hover:text-sky-600 hover:underline transition-colors cursor-pointer text-left"
                                        >
                                            {asgn.title}
                                        </button>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-col gap-0.5">
                                            <span
                                                class="text-sm text-stone-500"
                                            >
                                                {formatDate(asgn.dueDate)}
                                            </span>
                                            {#if asgn.isLate}
                                                <span
                                                    class="text-[10px] font-bold text-orange-500 uppercase tracking-wide"
                                                    >Late</span
                                                >
                                            {/if}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if asgn.score !== null && asgn.score !== undefined}
                                            <span
                                                class="text-sm font-bold text-stone-800"
                                            >
                                                {asgn.score}
                                                <span
                                                    class="text-xs font-normal text-stone-400"
                                                    >/ {asgn.maxScore}</span
                                                >
                                            </span>
                                        {:else}
                                            <span class="text-sm text-stone-300"
                                                >— / {asgn.maxScore}</span
                                            >
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <Badge
                                            class="text-xs font-semibold border pointer-events-none {assignmentStatusClass[
                                                asgn.assignmentStatus
                                            ] ??
                                                'bg-stone-100 text-stone-500 border-stone-200'}"
                                        >
                                            {asgn.assignmentStatus}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <div
                                            class="flex items-center justify-center gap-1.5"
                                        >
                                            <StatusIcon
                                                class="w-3.5 h-3.5 {asgn.status ===
                                                    'Submitted' ||
                                                asgn.status === 'Graded'
                                                    ? 'text-green-500'
                                                    : asgn.status === 'Overdue'
                                                      ? 'text-red-400'
                                                      : asgn.status === 'Late'
                                                        ? 'text-orange-400'
                                                        : 'text-stone-300'}"
                                            />
                                            <Badge
                                                class="text-xs font-semibold border pointer-events-none {submissionStatusClass[
                                                    asgn.status
                                                ] ??
                                                    'bg-stone-100 text-stone-500 border-stone-200'}"
                                            >
                                                {asgn.status}
                                            </Badge>
                                        </div>
                                    </Table.Cell>
                                    <!-- <Table.Cell class="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onclick={() =>
                                                goto(
                                                    `/app/student/assignment-checkpoint/${asgn.id}`,
                                                )}
                                            class="gap-1.5 text-stone-400 hover:text-sky-600 hover:bg-sky-50 cursor-pointer h-7 text-xs"
                                        >
                                            View
                                        </Button>
                                    </Table.Cell> -->
                                </Table.Row>
                            {/each}
                        {/if}
                    </Table.Body>
                </Table.Root>
            </div>

            <!-- Pagination -->
            {#if otherAssignmentsPagination && otherAssignmentsPagination.totalPages > 1}
                {@const p = otherAssignmentsPagination}
                <div class="flex items-center justify-between px-1">
                    <p class="text-xs text-stone-400">
                        Showing {(p.page - 1) * p.limit + 1}–{Math.min(
                            p.page * p.limit,
                            p.totalItems,
                        )} of {p.totalItems}
                    </p>
                    <div class="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            class="w-8 h-8 cursor-pointer text-stone-400 hover:text-stone-700"
                            disabled={p.page <= 1}
                            onclick={() => goToPage(p.page - 1)}
                        >
                            <ChevronLeftIcon class="w-4 h-4" />
                        </Button>
                        {#each Array.from({ length: p.totalPages }, (_, i) => i + 1) as pg}
                            <Button
                                variant="ghost"
                                size="icon"
                                class="w-8 h-8 cursor-pointer text-xs font-semibold {pg ===
                                p.page
                                    ? 'bg-sky-500 text-white border border-sky-500 hover:bg-sky-500'
                                    : 'text-stone-500 hover:text-stone-700'}"
                                onclick={() => goToPage(pg)}
                            >
                                {pg}
                            </Button>
                        {/each}
                        <Button
                            variant="ghost"
                            size="icon"
                            class="w-8 h-8 cursor-pointer text-stone-400 hover:text-stone-700"
                            disabled={p.page >= p.totalPages}
                            onclick={() => goToPage(p.page + 1)}
                        >
                            <ChevronRightIcon class="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            {/if}
        </section>
    </div>
</div>