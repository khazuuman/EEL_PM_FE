<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { enhance } from "$app/forms";
    import { setActions } from "$lib/stores/actions";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import {
        ArrowLeftIcon,
        CheckSquareIcon,
        ClipboardListIcon,
        PlusIcon,
        PencilIcon,
        Trash2Icon,
        CalendarIcon,
        TrophyIcon,
        LayersIcon,
        Loader2Icon,
        ChevronRightIcon,
        ChevronLeftIcon,
        LockIcon,
        LockOpenIcon,
        DownloadIcon,
        TagIcon,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();
    let otherAssignmentsPagination = $derived(data.otherAssignmentsPagination);
    let checkpoints = $derived(
        [...(data.checkpoints ?? [])].sort(
            (a, b) => a.sequenceNumber - b.sequenceNumber,
        ),
    );
    let otherAssignments = $derived(data.otherAssignments ?? []);
    let deletingId = $state<number | null>(null);
    let togglingId = $state<number | null>(null);
    let exporting = $state(false);

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

    const statusClass: Record<string, string> = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Inactive: "bg-stone-100 text-stone-500 border-stone-200",
        Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
        Closed: "bg-red-100 text-red-600 border-red-200",
    };

    const typeClass: Record<string, string> = {
        Checkpoint: "bg-amber-100 text-amber-700 border-amber-200",
        Outcome: "bg-purple-100 text-purple-700 border-purple-200",
        Other: "bg-sky-100 text-sky-700 border-sky-200",
    };

    async function handleExportGrade() {
        exporting = true;
        try {
            const res = await fetch(`/api/export/grades/${data.classId}`);
            if (!res.ok) { toast.error("Failed to export grade."); return; }
            const disposition = res.headers.get("content-disposition") ?? "";
            const filenameMatch =
                disposition.match(/filename\*=UTF-8''([^;\n]+)/i) ??
                disposition.match(/filename="?([^";\n]+)"?/i);
            const filename = filenameMatch
                ? decodeURIComponent(filenameMatch[1])
                : `grades_${data.classId}.xlsx`;
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Grade exported successfully.");
        } catch {
            toast.error("Failed to export grade.");
        } finally {
            exporting = false;
        }
    }
</script>

<div class="bg-white w-full px-10 pt-6 pb-12 min-h-screen">
    <!-- Back -->
    <div class="flex items-center h-10 mb-2">
        <Button
            variant="ghost"
            onclick={() => goto(`/app/lecturer/class/${data.classId}`)}
            class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 cursor-pointer -ml-3"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            Back
        </Button>
    </div>

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <CheckSquareIcon class="w-5 h-5 text-amber-500" />
            </div>
            <div>
                <p class="text-[11px] font-semibold text-amber-500 uppercase tracking-widest leading-none mb-0.5">
                    Lecturer
                </p>
                <h1 class="text-2xl font-extrabold text-stone-900 leading-tight">
                    Assignment Management
                </h1>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-8">
        <!-- ── SECTION 1: Checkpoints / Outcomes ─────────────────── -->
        <section class="flex flex-col gap-4">
            <!-- Export Grade Button -->
            <Button
                type="button"
                onclick={handleExportGrade}
                class="gap-2 w-40 bg-neutral-600 hover:bg-neutral-900 text-white cursor-pointer"
                disabled={exporting}
            >
                {#if exporting}
                    <Loader2Icon class="w-4 h-4 animate-spin" />
                    Exporting...
                {:else}
                    <DownloadIcon class="w-4 h-4" />
                    Export Grade
                {/if}
            </Button>

            <!-- Section Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        {#if checkpointType === "Outcome"}
                            <TrophyIcon class="w-4 h-4 text-purple-500" />
                        {:else}
                            <LayersIcon class="w-4 h-4 text-amber-500" />
                        {/if}
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5">
                            Milestones
                        </p>
                        <h2 class="text-base font-extrabold text-stone-900 leading-tight">
                            {checkpointType === "Outcome" ? "Outcomes" : "Checkpoints"}
                        </h2>
                    </div>
                    <span class="text-xs font-bold text-stone-400 bg-stone-100 border border-stone-200 rounded-full px-2.5 py-0.5">
                        {checkpoints.length}
                    </span>
                </div>
                <Button
                    onclick={() =>
                        goto(
                            checkpointType === "Outcome"
                                ? `/app/lecturer/class/${data.classId}/assignments-management/create?type=Outcome`
                                : `/app/lecturer/class/${data.classId}/assignments-management/create?type=Checkpoint`,
                        )}
                    class="gap-2 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                >
                    <PlusIcon class="w-4 h-4" />
                    Add {checkpointType === "Outcome" ? "Outcome" : "Checkpoint"}
                </Button>
            </div>

            <!-- Checkpoint Table -->
            <div class="rounded-xl border border-stone-200 overflow-hidden">
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-stone-50 hover:bg-stone-50">
                            <Table.Head class="w-12 text-center text-stone-400 font-semibold">#</Table.Head>
                            <Table.Head class="text-stone-600 font-semibold">Title</Table.Head>
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
                                    <TrophyIcon class="w-3.5 h-3.5" /> Max Score
                                </div>
                            </Table.Head>
                            <Table.Head class="text-stone-600 font-semibold text-center">Status</Table.Head>
                            <Table.Head class="text-stone-600 font-semibold text-center">Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if checkpoints.length === 0}
                            <Table.Row>
                                <Table.Cell colspan={7} class="py-16 text-center">
                                    <div class="flex flex-col items-center gap-2 text-stone-300">
                                        <LayersIcon class="w-10 h-10" />
                                        <p class="text-sm font-semibold text-stone-400">
                                            No {checkpointType === "Outcome" ? "outcomes" : "checkpoints"} yet
                                        </p>
                                        <p class="text-xs text-stone-300">Click "Add" to create the first one</p>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each checkpoints as cp, i (cp.id)}
                                <Table.Row class="hover:bg-amber-50/40 transition-colors">
                                    <!-- Index tự sinh (1-based) -->
                                    <Table.Cell class="text-center text-stone-400 text-sm font-mono">
                                        {i + 1}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <button
                                            type="button"
                                            onclick={() => goto(`/app/lecturer/class/${data.classId}/assignments-management/${cp.id}`)}
                                            class="text-sm font-semibold text-stone-900 hover:text-amber-600 hover:underline transition-colors cursor-pointer text-left"
                                        >
                                            {cp.title}
                                        </button>
                                    </Table.Cell>
                                    <!-- Grade Item (checkpoint/outcome only) -->
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
                                    <Table.Cell class="text-sm text-stone-500">
                                        {formatDate(cp.dueDate)}
                                    </Table.Cell>
                                    <Table.Cell class="text-sm font-semibold text-stone-700">
                                        {cp.maxScore}
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <Badge class="text-xs font-semibold border pointer-events-none {statusClass[cp.status] ?? 'bg-stone-100 text-stone-500 border-stone-200'}">
                                            {cp.status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex items-center justify-center gap-1">
                                            {#if cp.status === "Active" || cp.status === "Closed"}
                                                <form
                                                    id="toggle-cp-{cp.id}"
                                                    method="POST"
                                                    action="?/toggleStatus"
                                                    use:enhance={() => {
                                                        togglingId = cp.id;
                                                        return async ({ result }) => {
                                                            togglingId = null;
                                                            if (result.type === "success") {
                                                                toast.success("Status updated.");
                                                                await invalidateAll();
                                                            } else if (result.type === "failure") {
                                                                toast.error((result.data as any)?.message ?? "Failed to update status.");
                                                            }
                                                        };
                                                    }}
                                                >
                                                    <input type="hidden" name="assignmentId" value={cp.id} />
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="icon"
                                                        class="w-8 h-8 cursor-pointer {cp.status === 'Active' ? 'text-green-500 hover:text-red-600 hover:bg-red-50' : 'text-stone-400 hover:text-green-600 hover:bg-green-50'}"
                                                        title={cp.status === "Active" ? "Close" : "Reopen"}
                                                        disabled={togglingId === cp.id}
                                                    >
                                                        {#if togglingId === cp.id}
                                                            <Loader2Icon class="w-4 h-4 animate-spin" />
                                                        {:else if cp.status === "Active"}
                                                            <LockIcon class="w-4 h-4" />
                                                        {:else}
                                                            <LockOpenIcon class="w-4 h-4" />
                                                        {/if}
                                                    </Button>
                                                </form>
                                            {/if}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="w-8 h-8 text-stone-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                                title="Edit"
                                                onclick={() => goto(`/app/lecturer/class/${data.classId}/assignments-management/${cp.id}/update`)}
                                            >
                                                <PencilIcon class="w-4 h-4" />
                                            </Button>
                                            <form
                                                id="delete-cp-{cp.id}"
                                                method="POST"
                                                action="?/delete"
                                                use:enhance={() => {
                                                    deletingId = cp.id;
                                                    return async ({ result }) => {
                                                        deletingId = null;
                                                        if (result.type === "success") {
                                                            toast.success("Deleted successfully.");
                                                            await invalidateAll();
                                                        } else if (result.type === "failure") {
                                                            toast.error((result.data?.message as any) ?? "Delete failed.");
                                                        }
                                                    };
                                                }}
                                            >
                                                <input type="hidden" name="assignmentId" value={cp.id} />
                                                <input type="hidden" name="classId" value={data.classId} />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    class="w-8 h-8 text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                    title="Delete"
                                                    disabled={deletingId === cp.id}
                                                    onclick={() =>
                                                        setActions({
                                                            active: true,
                                                            description: `Are you sure you want to delete "${cp.title}"? This action cannot be undone.`,
                                                            cb: async () => {
                                                                (document.getElementById(`delete-cp-${cp.id}`) as HTMLFormElement)?.requestSubmit();
                                                            },
                                                        })}
                                                >
                                                    {#if deletingId === cp.id}
                                                        <Loader2Icon class="w-4 h-4 animate-spin" />
                                                    {:else}
                                                        <Trash2Icon class="w-4 h-4" />
                                                    {/if}
                                                </Button>
                                            </form>
                                        </div>
                                    </Table.Cell>
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
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                        <ClipboardListIcon class="w-4 h-4 text-sky-500" />
                    </div>
                    <div>
                        <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5">
                            Small Tasks
                        </p>
                        <h2 class="text-base font-extrabold text-stone-900 leading-tight">
                            Other Assignments
                        </h2>
                    </div>
                    <span class="text-xs font-bold text-stone-400 bg-stone-100 border border-stone-200 rounded-full px-2.5 py-0.5">
                        {otherAssignments.length}
                    </span>
                </div>
                <Button
                    onclick={() => goto(`/app/lecturer/class/${data.classId}/assignments-management/create?type=Other`)}
                    class="gap-2 bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
                >
                    <PlusIcon class="w-4 h-4" />
                    Add Assignment
                </Button>
            </div>

            <!-- Other Assignments Table (no Grade Item, no Type) -->
            <div class="rounded-xl border border-stone-200 overflow-hidden">
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-stone-50 hover:bg-stone-50">
                            <Table.Head class="w-12 text-center text-stone-400 font-semibold">#</Table.Head>
                            <Table.Head class="text-stone-600 font-semibold">Title</Table.Head>
                            <Table.Head class="text-stone-600 font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <CalendarIcon class="w-3.5 h-3.5" /> Due Date
                                </div>
                            </Table.Head>
                            <Table.Head class="text-stone-600 font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <TrophyIcon class="w-3.5 h-3.5" /> Max Score
                                </div>
                            </Table.Head>
                            <Table.Head class="text-stone-600 font-semibold text-center">Status</Table.Head>
                            <Table.Head class="text-stone-600 font-semibold text-center">Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if otherAssignments.length === 0}
                            <Table.Row>
                                <Table.Cell colspan={6} class="py-16 text-center">
                                    <div class="flex flex-col items-center gap-2 text-stone-300">
                                        <ClipboardListIcon class="w-10 h-10" />
                                        <p class="text-sm font-semibold text-stone-400">No assignments yet</p>
                                        <p class="text-xs text-stone-300">Click "Add Assignment" to create one</p>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each otherAssignments as asgn, i (asgn.id)}
                                <Table.Row class="hover:bg-sky-50/40 transition-colors">
                                    <Table.Cell class="text-center text-stone-400 text-sm font-mono">
                                        {((otherAssignmentsPagination?.page ?? 1) - 1) *
                                            (otherAssignmentsPagination?.limit ?? 5) +
                                            i + 1}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <button
                                            type="button"
                                            onclick={() => goto(`/app/lecturer/class/${data.classId}/assignments-management/${asgn.id}`)}
                                            class="text-sm font-semibold text-stone-900 hover:text-sky-600 hover:underline transition-colors cursor-pointer text-left"
                                        >
                                            {asgn.title}
                                        </button>
                                    </Table.Cell>
                                    <Table.Cell class="text-sm text-stone-500">
                                        {formatDate(asgn.dueDate)}
                                    </Table.Cell>
                                    <Table.Cell class="text-sm font-semibold text-stone-700">
                                        {asgn.maxScore}
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <Badge class="text-xs font-semibold border pointer-events-none {statusClass[asgn.status] ?? 'bg-stone-100 text-stone-500 border-stone-200'}">
                                            {asgn.status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex items-center justify-center gap-1">
                                            {#if asgn.status === "Active" || asgn.status === "Closed"}
                                                <form
                                                    id="toggle-asgn-{asgn.id}"
                                                    method="POST"
                                                    action="?/toggleStatus"
                                                    use:enhance={() => {
                                                        togglingId = asgn.id;
                                                        return async ({ result }) => {
                                                            togglingId = null;
                                                            if (result.type === "success") {
                                                                toast.success("Status updated.");
                                                                await invalidateAll();
                                                            } else if (result.type === "failure") {
                                                                toast.error((result.data as any)?.message ?? "Failed to update status.");
                                                            }
                                                        };
                                                    }}
                                                >
                                                    <input type="hidden" name="assignmentId" value={asgn.id} />
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="icon"
                                                        class="w-8 h-8 cursor-pointer {asgn.status === 'Active' ? 'text-green-500 hover:text-red-600 hover:bg-red-50' : 'text-stone-400 hover:text-green-600 hover:bg-green-50'}"
                                                        title={asgn.status === "Active" ? "Close" : "Reopen"}
                                                        disabled={togglingId === asgn.id}
                                                    >
                                                        {#if togglingId === asgn.id}
                                                            <Loader2Icon class="w-4 h-4 animate-spin" />
                                                        {:else if asgn.status === "Active"}
                                                            <LockIcon class="w-4 h-4" />
                                                        {:else}
                                                            <LockOpenIcon class="w-4 h-4" />
                                                        {/if}
                                                    </Button>
                                                </form>
                                            {/if}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="w-8 h-8 text-stone-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                                title="Edit"
                                                onclick={() => goto(`/app/lecturer/class/${data.classId}/assignments-management/${asgn.id}/update`)}
                                            >
                                                <PencilIcon class="w-4 h-4" />
                                            </Button>
                                            <form
                                                id="delete-asgn-{asgn.id}"
                                                method="POST"
                                                action="?/delete"
                                                use:enhance={() => {
                                                    deletingId = asgn.id;
                                                    return async ({ result }) => {
                                                        deletingId = null;
                                                        if (result.type === "success") {
                                                            toast.success("Deleted successfully.");
                                                            await invalidateAll();
                                                        } else if (result.type === "failure") {
                                                            toast.error((result.data as any)?.message ?? "Delete failed.");
                                                        }
                                                    };
                                                }}
                                            >
                                                <input type="hidden" name="assignmentId" value={asgn.id} />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    class="w-8 h-8 text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                    title="Delete"
                                                    disabled={deletingId === asgn.id}
                                                    onclick={() =>
                                                        setActions({
                                                            active: true,
                                                            description: `Are you sure you want to delete "${asgn.title}"? This action cannot be undone.`,
                                                            cb: async () => {
                                                                (document.getElementById(`delete-asgn-${asgn.id}`) as HTMLFormElement)?.requestSubmit();
                                                            },
                                                        })}
                                                >
                                                    {#if deletingId === asgn.id}
                                                        <Loader2Icon class="w-4 h-4 animate-spin" />
                                                    {:else}
                                                        <Trash2Icon class="w-4 h-4" />
                                                    {/if}
                                                </Button>
                                            </form>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        {/if}
                    </Table.Body>
                </Table.Root>
            </div>

            <!-- Pagination -->
            {#if otherAssignmentsPagination && otherAssignmentsPagination.totalPages > 1}
                <div class="flex items-center justify-between px-1">
                    <p class="text-xs text-stone-400">
                        Showing
                        <span class="font-semibold text-stone-600">
                            {(otherAssignmentsPagination.page - 1) * otherAssignmentsPagination.limit + 1}
                        </span>
                        –
                        <span class="font-semibold text-stone-600">
                            {Math.min(otherAssignmentsPagination.page * otherAssignmentsPagination.limit, otherAssignmentsPagination.totalItems)}
                        </span>
                        of
                        <span class="font-semibold text-stone-600">{otherAssignmentsPagination.totalItems}</span>
                    </p>
                    <div class="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            class="w-8 h-8 cursor-pointer"
                            disabled={otherAssignmentsPagination.page <= 1}
                            onclick={() => goToPage(otherAssignmentsPagination.page - 1)}
                        >
                            <ChevronLeftIcon class="w-4 h-4" />
                        </Button>
                        {#each Array.from({ length: otherAssignmentsPagination.totalPages }, (_, i) => i + 1) as p}
                            <Button
                                variant={p === otherAssignmentsPagination.page ? "default" : "outline"}
                                size="icon"
                                class="w-8 h-8 cursor-pointer {p === otherAssignmentsPagination.page ? 'bg-sky-500 hover:bg-sky-600 border-sky-500 text-white' : ''}"
                                onclick={() => goToPage(p)}
                            >
                                {p}
                            </Button>
                        {/each}
                        <Button
                            variant="outline"
                            size="icon"
                            class="w-8 h-8 cursor-pointer"
                            disabled={otherAssignmentsPagination.page >= otherAssignmentsPagination.totalPages}
                            onclick={() => goToPage(otherAssignmentsPagination.page + 1)}
                        >
                            <ChevronRightIcon class="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            {/if}
        </section>
    </div>
</div>