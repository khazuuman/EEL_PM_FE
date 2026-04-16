<script lang="ts">
    import type { PageData } from "./$types";
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import { toast } from "svelte-sonner";
    import { setActions } from "$lib/stores/actions";
    import { deserialize } from "$app/forms";
    import Button from "$lib/components/ui/button/button.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import {
        ArrowLeftIcon,
        CalendarIcon,
        ClipboardListIcon,
        DownloadIcon,
        EditIcon,
        FileIcon,
        FileTextIcon,
        ImageIcon,
        LayersIcon,
        TrophyIcon,
        TrashIcon,
        UsersIcon,
        StarIcon,
        ClockIcon,
        CheckCircleIcon,
        XCircleIcon,
        AlertCircleIcon,
        EyeIcon,
        PaperclipIcon,
        Loader2Icon,
        LockIcon,
        LockOpenIcon,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

    const assignment = $derived(data?.assignment?.assignment);
    const submissions = $derived(data?.assignment?.submissions ?? []);
    const classId = $derived(data?.classId);
    const assignmentId = $derived($page.params.assignmentId);

    let isToggling = $state(false);

    async function handleToggleStatus() {
        isToggling = true;
        const formData = new FormData();
        formData.append("assignmentId", assignmentId as string);
        const res = await fetch("?/toggleStatus", {
            method: "POST",
            body: formData,
        });
        const result = deserialize(await res.text());
        isToggling = false;
        if (result?.type === "failure") {
            toast.error(
                (result.data as any)?.message ?? "Failed to update status.",
            );
            return;
        }
        toast.success("Status updated successfully.");
        await invalidateAll();
    }

    function formatDateTime(dateStr: string | null) {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function stripUuidPrefix(fileName: string) {
        const uuidPattern =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
        return fileName.replace(uuidPattern, "");
    }

    function getFileIcon(fileName: string) {
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? ""))
            return ImageIcon;
        if (["pdf"].includes(ext ?? "")) return FileTextIcon;
        return FileIcon;
    }

    function getStatusMeta(status: string, isLate: boolean) {
        if (status === "Graded")
            return {
                label: "Graded",
                icon: CheckCircleIcon,
                textColor: "text-emerald-600",
                iconColor: "text-emerald-500",
            };
        if (status === "Submitted" && isLate)
            return {
                label: "Late",
                icon: AlertCircleIcon,
                textColor: "text-orange-600",
                iconColor: "text-orange-400",
            };
        if (status === "Submitted")
            return {
                label: "Submitted",
                icon: ClockIcon,
                textColor: "text-blue-600",
                iconColor: "text-blue-400",
            };
        return {
            label: "Not Submitted",
            icon: XCircleIcon,
            textColor: "text-stone-400",
            iconColor: "text-stone-300",
        };
    }

    const typeConfig = $derived(() => {
        if (assignment?.assignmentType === "Checkpoint")
            return {
                icon: LayersIcon,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-200",
            };
        if (assignment?.assignmentType === "Outcome")
            return {
                icon: TrophyIcon,
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-200",
            };
        return {
            icon: ClipboardListIcon,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
        };
    });

    const isOverdue = $derived(
        assignment?.dueDate ? new Date(assignment.dueDate) < new Date() : false,
    );

    const submittedCount = $derived(
        submissions.filter((s: any) => s.status !== "Not Submitted").length,
    );

    function handleDelete() {
        setActions({
            active: true,
            description:
                "This will permanently delete this assignment and all related submissions. This action cannot be undone.",
            cb: async () => {
                const formData = new FormData();
                formData.append("assignmentId", assignmentId as string);
                const res = await fetch("?/delete", {
                    method: "POST",
                    body: formData,
                });
                const result = deserialize(await res.text());
                if (result?.type === "failure") {
                    toast.error(
                        (result.data as any)?.message ??
                            "Failed to delete assignment.",
                    );
                    return;
                }
                toast.success("Assignment deleted successfully.");
                goto(`/app/lecturer/class/${classId}/assignments-management`);
            },
        });
    }
</script>

<div class="h-full flex flex-col bg-white">
    <!-- Top Header bar -->
    <div
        class="flex-none px-6 py-4 border-b border-stone-200 flex items-center justify-between"
    >
        <div class="flex items-center gap-3">
            <Button
                variant="ghost"
                size="icon"
                class="w-9 h-9 text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                onclick={() =>
                    goto(
                        `/app/lecturer/class/${classId}/assignments-management`,
                    )}
            >
                <ArrowLeftIcon class="w-4 h-4" />
            </Button>
            {#if assignment}
                {@const cfg = typeConfig()}
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-xl {cfg.bg} border {cfg.border} flex items-center justify-center"
                    >
                        <cfg.icon class="w-5 h-5 {cfg.color}" />
                    </div>
                    <div>
                        <h1
                            class="text-lg font-semibold text-stone-800 leading-tight"
                        >
                            {assignment.title}
                        </h1>
                        <p class="text-sm text-stone-400">
                            {assignment.assignmentType}{assignment.sequenceNumber
                                ? ` · #${assignment.sequenceNumber}`
                                : ""}
                        </p>
                    </div>
                </div>
            {/if}
        </div>

        <div class="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                class="text-stone-600 border-stone-200 hover:bg-stone-50 cursor-pointer"
                onclick={() => goto(`...update`)}
            >
                <EditIcon class="w-4 h-4 mr-1.5" />
                Edit
            </Button>

            <!-- ✅ Toggle Status button -->
            {#if assignment?.status === "Active" || assignment?.status === "Closed"}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isToggling}
                    class="cursor-pointer {assignment?.status === 'Active'
                        ? 'text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200'
                        : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200'}"
                    onclick={handleToggleStatus}
                >
                    {#if isToggling}
                        <Loader2Icon class="w-4 h-4 mr-1.5 animate-spin" />
                        Updating...
                    {:else if assignment?.status === "Active"}
                        <LockIcon class="w-4 h-4 mr-1.5" />
                        Close
                    {:else}
                        <LockOpenIcon class="w-4 h-4 mr-1.5" />
                        Reopen
                    {/if}
                </Button>
            {/if}

            <Button
                variant="outline"
                size="sm"
                class="text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 cursor-pointer"
                onclick={handleDelete}
            >
                <TrashIcon class="w-4 h-4 mr-1.5" />
                Delete
            </Button>
        </div>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-6">
        <!-- Assignment Info + Attachments (single card, full width) -->
        <div
            class="border border-stone-200 rounded-2xl overflow-hidden shadow-sm"
        >
            <!-- Info row -->
            <div
                class="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-200"
            >
                <!-- Status -->
                <div class="px-5 py-4">
                    <p
                        class="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2"
                    >
                        Status
                    </p>
                    <Badge
                        class="{assignment?.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 border-0'
                            : 'bg-stone-100 text-stone-500 border-0'} text-sm px-3 py-1"
                    >
                        {assignment?.status ?? "—"}
                    </Badge>
                </div>

                <!-- Due Date -->
                <div class="px-5 py-4">
                    <p
                        class="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2"
                    >
                        Due Date
                    </p>
                    <div class="flex items-center gap-2">
                        {#if isOverdue}
                            <AlertCircleIcon
                                class="w-4 h-4 text-red-400 flex-none"
                            />
                        {:else}
                            <CalendarIcon
                                class="w-4 h-4 text-stone-300 flex-none"
                            />
                        {/if}
                        <span
                            class="text-sm font-medium {isOverdue
                                ? 'text-red-500'
                                : 'text-stone-700'}"
                        >
                            {formatDateTime(assignment?.dueDate)}
                        </span>
                    </div>
                </div>

                <!-- Max Score -->
                <div class="px-5 py-4">
                    <p
                        class="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2"
                    >
                        Max Score
                    </p>
                    <div class="flex items-center gap-2">
                        <StarIcon class="w-4 h-4 text-amber-400" />
                        <span class="text-sm font-semibold text-stone-700">
                            {assignment?.maxScore ?? "—"} pts
                        </span>
                    </div>
                </div>

                <!-- Submission Progress -->
                <div class="px-5 py-4">
                    <p
                        class="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2"
                    >
                        Submissions
                    </p>
                    <div class="flex items-center gap-2">
                        <span
                            class="text-sm font-semibold text-stone-700 tabular-nums"
                        >
                            {submittedCount}
                            <span class="font-normal text-stone-400"
                                >/ {submissions.length}</span
                            >
                        </span>
                        <div
                            class="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden min-w-[40px]"
                        >
                            <div
                                class="h-full bg-emerald-400 rounded-full"
                                style="width: {submissions.length
                                    ? (submittedCount / submissions.length) *
                                      100
                                    : 0}%"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator class="bg-stone-100" />

            <!-- Description + Attachments row -->
            <div
                class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200"
            >
                <!-- Description -->
                <div class="px-5 py-4">
                    <p
                        class="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3"
                    >
                        Description
                    </p>
                    {#if assignment?.description}
                        <p class="text-sm text-stone-600 leading-relaxed">
                            {assignment.description}
                        </p>
                    {:else}
                        <p class="text-sm text-stone-300 italic">
                            No description provided.
                        </p>
                    {/if}
                </div>

                <!-- Attachments -->
                <div class="px-5 py-4">
                    <div class="flex items-center justify-between mb-3">
                        <p
                            class="text-xs font-medium text-stone-400 uppercase tracking-wider"
                        >
                            Attachments
                        </p>
                        <span class="text-xs text-stone-300">
                            {assignment?.files?.length ?? 0} file{(assignment
                                ?.files?.length ?? 0) !== 1
                                ? "s"
                                : ""}
                        </span>
                    </div>

                    {#if !assignment?.files?.length}
                        <div class="flex items-center gap-2 text-stone-300">
                            <PaperclipIcon class="w-4 h-4" />
                            <span class="text-sm">No attachments</span>
                        </div>
                    {:else}
                        <div class="space-y-2">
                            {#each assignment.files as file}
                                {@const FileIconComp = getFileIcon(
                                    file.fileName,
                                )}
                                <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-3 p-2.5 rounded-lg border border-stone-200 hover:border-stone-200 hover:bg-stone-50 transition-colors group"
                                >
                                    <div
                                        class="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center flex-none"
                                    >
                                        <FileIconComp
                                            class="w-4 h-4 text-stone-400"
                                        />
                                    </div>
                                    <span
                                        class="text-sm text-stone-600 truncate flex-1 group-hover:text-stone-800"
                                    >
                                        {stripUuidPrefix(file.fileName)}
                                    </span>
                                    <DownloadIcon
                                        class="w-4 h-4 text-stone-300 group-hover:text-stone-500 flex-none"
                                    />
                                </a>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Submissions Table — full width -->
        <div
            class="border border-stone-200 rounded-2xl overflow-hidden shadow-sm"
        >
            <div
                class="px-5 py-4 border-b border-stone-200 flex items-center gap-2"
            >
                <UsersIcon class="w-5 h-5 text-stone-400" />
                <h2 class="text-base font-semibold text-stone-700">
                    Group Submissions
                </h2>
                <span class="ml-auto text-sm text-stone-400 tabular-nums">
                    {submissions.length} groups
                </span>
            </div>

            {#if !submissions.length}
                <div
                    class="flex flex-col items-center justify-center py-16 gap-3"
                >
                    <div
                        class="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center"
                    >
                        <UsersIcon class="w-6 h-6 text-stone-300" />
                    </div>
                    <p class="text-base font-medium text-stone-400">
                        No groups yet
                    </p>
                    <p class="text-sm text-stone-300">
                        Groups will appear here once assigned to this class.
                    </p>
                </div>
            {:else}
                <Table.Root>
                    <Table.Header>
                        <Table.Row
                            class="border-stone-50 hover:bg-transparent bg-stone-50"
                        >
                            <Table.Head
                                class="text-xs font-semibold text-stone-500 uppercase tracking-wide pl-5 py-3"
                                >Group</Table.Head
                            >
                            <Table.Head
                                class="text-xs font-semibold text-stone-500 uppercase tracking-wide py-3"
                                >Status</Table.Head
                            >
                            <!-- <Table.Head class="text-xs font-semibold text-stone-500 uppercase tracking-wide py-3 text-center">Version</Table.Head> -->
                            <Table.Head
                                class="text-xs font-semibold text-stone-500 uppercase tracking-wide py-3"
                                >Submitted At</Table.Head
                            >
                            <Table.Head
                                class="text-xs font-semibold text-stone-500 uppercase tracking-wide py-3 text-center"
                                >Score</Table.Head
                            >
                            <Table.Head
                                class="text-xs font-semibold text-stone-500 uppercase tracking-wide py-3 text-right pr-5"
                                >Action</Table.Head
                            >
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each submissions as submission}
                            {@const meta = getStatusMeta(
                                submission.status,
                                submission.isLate,
                            )}
                            <Table.Row
                                class="border-stone-50 hover:bg-stone-50 transition-colors"
                            >
                                <!-- Group -->
                                <Table.Cell class="pl-5 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center flex-none"
                                        >
                                            <UsersIcon
                                                class="w-4 h-4 text-stone-400"
                                            />
                                        </div>
                                        <span
                                            class="text-sm font-semibold text-stone-800"
                                        >
                                            {submission.groupName}
                                        </span>
                                    </div>
                                </Table.Cell>

                                <!-- Status -->
                                <Table.Cell class="py-4">
                                    <div class="flex items-center gap-2">
                                        <meta.icon
                                            class="w-4 h-4 {meta.iconColor}"
                                        />
                                        <span
                                            class="text-sm font-medium {meta.textColor}"
                                        >
                                            {meta.label}
                                        </span>
                                    </div>
                                </Table.Cell>

                                <!-- Version -->
                                <!-- <Table.Cell class="text-center py-4">
                                    {#if submission.versionNumber > 0}
                                        <span class="text-sm bg-stone-100 text-stone-600 rounded-lg px-2.5 py-1 font-mono tabular-nums font-medium">
                                            v{submission.versionNumber}
                                        </span>
                                    {:else}
                                        <span class="text-sm text-stone-300">—</span>
                                    {/if}
                                </Table.Cell> -->

                                <!-- Submitted At -->
                                <Table.Cell class="py-4">
                                    {#if submission.submittedAt}
                                        <div class="flex items-center gap-2">
                                            <CalendarIcon
                                                class="w-3.5 h-3.5 text-stone-300"
                                            />
                                            <span
                                                class="text-sm text-stone-600 tabular-nums"
                                            >
                                                {formatDateTime(
                                                    submission.submittedAt,
                                                )}
                                            </span>
                                        </div>
                                    {:else}
                                        <span class="text-sm text-stone-300"
                                            >—</span
                                        >
                                    {/if}
                                </Table.Cell>

                                <!-- Score -->
                                <Table.Cell class="text-center py-4">
                                    {#if submission.score !== null}
                                        <span
                                            class="text-sm font-bold tabular-nums {submission.score >=
                                            (assignment?.maxScore ?? 100) * 0.8
                                                ? 'text-emerald-600'
                                                : submission.score >=
                                                    (assignment?.maxScore ??
                                                        100) *
                                                        0.5
                                                  ? 'text-amber-500'
                                                  : 'text-red-400'}"
                                        >
                                            {submission.score}
                                            <span
                                                class="text-xs text-stone-300 font-normal"
                                                >/{assignment?.maxScore}</span
                                            >
                                        </span>
                                    {:else}
                                        <span class="text-sm text-stone-300"
                                            >—</span
                                        >
                                    {/if}
                                </Table.Cell>

                                <!-- Action -->
                                <Table.Cell class="text-right pr-5 py-4">
                                    {#if submission.status !== "Not Submitted"}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="h-8 px-3 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
                                            onclick={() =>
                                                goto(
                                                    `/app/lecturer/class/${classId}/assignments-management/${assignmentId}/submissions/${submission.groupId}`,
                                                )}
                                        >
                                            <EyeIcon class="w-4 h-4 mr-1.5" />
                                            View
                                        </Button>
                                    {:else}
                                        <span
                                            class="text-sm text-stone-200 px-3"
                                            >—</span
                                        >
                                    {/if}
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            {/if}
        </div>
    </div>
</div>
