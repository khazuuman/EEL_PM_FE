<script lang="ts">
    import type { PageData } from "./$types";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import {
        ArrowLeftIcon,
        CalendarIcon,
        TrophyIcon,
        LayersIcon,
        ClipboardListIcon,
        FileIcon,
        LinkIcon,
        CheckCircle2Icon,
        ClockIcon,
        XCircleIcon,
        AlertCircleIcon,
        ExternalLinkIcon,
        StickyNoteIcon,
        MessageSquareIcon,
        StarIcon,
        Loader2Icon,
    } from "lucide-svelte";
    import GradeSubmissionDialog from "../../../../components/GradeSubmissionDialog.svelte";

    let { data }: { data: PageData } = $props();

    let assignment = $derived(data.submission?.assignment ?? null);
    let submission = $derived(data.submission?.submission ?? null);
    let isGraded = $derived(submission?.status === "Graded");

    // Grade dialog state
    let showGradeDialog = $state(false);

    function isImageUrl(url: string): boolean {
        return /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(url);
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

    const typeClass: Record<string, string> = {
        Checkpoint: "bg-amber-100 text-amber-700 border-amber-200",
        Outcome: "bg-purple-100 text-purple-700 border-purple-200",
        Other: "bg-sky-100 text-sky-700 border-sky-200",
    };
    const assignmentStatusClass: Record<string, string> = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Inactive: "bg-stone-100 text-stone-500 border-stone-200",
        Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
        Closed: "bg-red-100 text-red-600 border-red-200",
    };
    const submissionStatusClass: Record<string, string> = {
        "Not Submitted": "bg-stone-100 text-stone-500 border-stone-200",
        Submitted: "bg-blue-100 text-blue-700 border-blue-200",
        Graded: "bg-green-100 text-green-700 border-green-200",
        Late: "bg-orange-100 text-orange-600 border-orange-200",
        Overdue: "bg-red-100 text-red-600 border-red-200",
    };

    let canGrade = $derived(
        submission?.status === "Submitted" ||
            submission?.status === "Late" ||
            submission?.status === "Graded",
    );
</script>

<div class="bg-stone-100 min-h-screen px-8 py-6">
    <div class="flex flex-col gap-5">
        <!-- Back -->
        <button
            onclick={() => history.back()}
            class="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors cursor-pointer w-fit"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            Back
        </button>

        {#if !assignment}
            <div
                class="bg-white rounded-xl border border-stone-200 flex flex-col items-center justify-center py-24 gap-3"
            >
                <ClipboardListIcon class="w-12 h-12 text-stone-300" />
                <p class="text-base text-stone-400">Assignment not found</p>
            </div>
        {:else}
            <!-- ── SECTION 1: Assignment Info ── -->
            <div
                class="bg-white rounded-xl border border-stone-200 overflow-hidden"
            >
                <div
                    class="flex items-center gap-4 px-6 py-4 border-b border-stone-100"
                >
                    <div
                        class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0"
                    >
                        {#if assignment.assignmentType === "Outcome"}
                            <TrophyIcon class="w-5 h-5 text-white" />
                        {:else if assignment.assignmentType === "Other"}
                            <ClipboardListIcon class="w-5 h-5 text-white" />
                        {:else}
                            <LayersIcon class="w-5 h-5 text-white" />
                        {/if}
                    </div>
                    <div>
                        <p
                            class="text-xs font-semibold text-stone-400 uppercase tracking-widest leading-none mb-1"
                        >
                            {assignment.assignmentType}{#if assignment.sequenceNumber}
                                · #{assignment.sequenceNumber}{/if}
                        </p>
                        <h1
                            class="text-xl font-bold text-stone-900 leading-tight"
                        >
                            {assignment.title}
                        </h1>
                    </div>
                </div>

                <div class="px-6 py-5 flex flex-col gap-5">
                    <div class="flex items-center gap-2.5 flex-wrap">
                        <Badge
                            class="text-sm font-semibold border pointer-events-none px-3 py-1 {typeClass[
                                assignment.assignmentType
                            ] ??
                                'bg-stone-100 text-stone-500 border-stone-200'}"
                        >
                            {assignment.assignmentType}
                        </Badge>
                        <Badge
                            class="text-sm font-semibold border pointer-events-none px-3 py-1 {assignmentStatusClass[
                                assignment.status
                            ] ??
                                'bg-stone-100 text-stone-500 border-stone-200'}"
                        >
                            {assignment.status}
                        </Badge>
                        <span
                            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 border border-stone-200 text-sm font-medium text-stone-500"
                        >
                            <CalendarIcon class="w-3.5 h-3.5" />
                            Due:
                            <strong class="text-stone-700 font-semibold"
                                >{formatDate(assignment.dueDate)}</strong
                            >
                        </span>
                        <span
                            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 border border-stone-200 text-sm font-medium text-stone-500"
                        >
                            <TrophyIcon class="w-3.5 h-3.5" />
                            Max score:
                            <strong class="text-stone-700 font-semibold"
                                >{assignment.maxScore}</strong
                            >
                        </span>
                    </div>

                    <div class="rounded-xl border border-stone-200 px-5 py-4">
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2"
                        >
                            Description
                        </p>
                        {#if !assignment.description}
                            <p class="text-sm text-stone-400 italic">
                                No description provided.
                            </p>
                        {:else}
                            <p
                                class="text-base text-stone-700 leading-relaxed whitespace-pre-line"
                            >
                                {assignment.description}
                            </p>
                        {/if}
                    </div>

                    <div class="rounded-xl border border-stone-200 px-5 py-4">
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3"
                        >
                            Assignment Files
                        </p>
                        {#if !assignment.files || assignment.files.length === 0}
                            <p class="text-sm text-stone-400 italic">
                                No files attached
                            </p>
                        {:else}
                            <div class="flex flex-col gap-2">
                                {#each assignment.files as f}
                                    <a
                                        href={f.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors group"
                                    >
                                        {#if isImageUrl(f.fileUrl)}
                                            <div
                                                class="w-10 h-10 rounded-lg border border-stone-200 overflow-hidden shrink-0 bg-white"
                                            >
                                                <img
                                                    src={f.fileUrl}
                                                    alt={f.fileName}
                                                    class="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        {:else}
                                            <div
                                                class="w-10 h-10 rounded-lg border border-stone-200 bg-white flex items-center justify-center shrink-0"
                                            >
                                                <FileIcon
                                                    class="w-5 h-5 text-stone-400"
                                                />
                                            </div>
                                        {/if}
                                        <span
                                            class="text-sm font-medium text-stone-700 group-hover:text-stone-900 truncate flex-1"
                                            >{f.fileName}</span
                                        >
                                        <ExternalLinkIcon
                                            class="w-4 h-4 text-stone-300 group-hover:text-stone-500 shrink-0"
                                        />
                                    </a>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- ── SECTION 2: Submission ── -->
            <div
                class="bg-white rounded-xl border border-stone-200 overflow-hidden"
            >
                <!-- Header -->
                <div
                    class="flex items-center gap-4 px-6 py-4 border-b border-stone-100"
                >
                    <div
                        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                        {isGraded || submission?.status === 'Submitted'
                            ? 'bg-green-600'
                            : submission?.status === 'Overdue'
                              ? 'bg-red-500'
                              : submission?.status === 'Late'
                                ? 'bg-orange-500'
                                : 'bg-stone-400'}"
                    >
                        {#if isGraded || submission?.status === "Submitted"}
                            <CheckCircle2Icon class="w-5 h-5 text-white" />
                        {:else if submission?.status === "Overdue"}
                            <XCircleIcon class="w-5 h-5 text-white" />
                        {:else if submission?.status === "Late"}
                            <AlertCircleIcon class="w-5 h-5 text-white" />
                        {:else}
                            <ClockIcon class="w-5 h-5 text-white" />
                        {/if}
                    </div>
                    <div class="flex-1">
                        <p
                            class="text-xs font-semibold text-stone-400 uppercase tracking-widest leading-none mb-1"
                        >
                            Submission <span class="text-black font-bold text-[14px]">(Group: {submission.groupName})</span>
                        </p>
                        <div class="flex items-center gap-3">
                            <Badge
                                class="text-sm font-semibold border pointer-events-none px-3 py-0.5 {submissionStatusClass[
                                    submission?.status ?? ''
                                ] ??
                                    'bg-stone-100 text-stone-500 border-stone-200'}"
                            >
                                {submission?.status ?? "Not Submitted"}
                            </Badge>
                            {#if isGraded}
                                <span class="text-lg font-bold text-stone-900">
                                    {#if submission?.score !== null && submission?.score !== undefined}
                                        {submission.score}
                                    {:else}
                                        <span
                                            class="text-base font-normal text-stone-400 italic"
                                            >Ungraded</span
                                        >
                                    {/if}
                                    <span
                                        class="text-base font-normal text-stone-400"
                                    >
                                        / {assignment.maxScore}</span
                                    >
                                </span>
                            {/if}
                        </div>
                    </div>

                    <!-- Grade button -->
                    {#if canGrade}
                        <button
                            onclick={() => {
                                showGradeDialog = true;
                            }}
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-700 text-white text-sm font-semibold cursor-pointer transition-colors"
                        >
                            <StarIcon class="w-4 h-4" />
                            {isGraded ? "Update Grade" : "Grade"}
                        </button>
                    {/if}
                </div>

                <!-- Body -->
                <div class="px-6 py-5 flex flex-col gap-5">
                    {#if submission?.feedback}
                        <div
                            class="rounded-xl border border-green-200 bg-green-50 px-5 py-4"
                        >
                            <div class="flex items-center gap-2 mb-2.5">
                                <MessageSquareIcon
                                    class="w-4 h-4 text-green-600"
                                />
                                <p
                                    class="text-xs font-bold uppercase tracking-widest text-green-700"
                                >
                                    Lecturer Feedback
                                </p>
                            </div>
                            <p
                                class="text-base text-stone-700 leading-relaxed whitespace-pre-line"
                            >
                                {submission.feedback}
                            </p>
                        </div>
                    {/if}

                    <!-- Files -->
                    <div class="flex flex-col gap-2">
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-stone-400"
                        >
                            Files <span class="normal-case font-normal"
                                >({submission?.files?.length ?? 0})</span
                            >
                        </p>
                        {#if !submission?.files || submission.files.length === 0}
                            <p class="text-sm text-stone-400 italic">
                                No files submitted
                            </p>
                        {:else}
                            <div class="flex flex-col gap-2">
                                {#each submission.files as f}
                                    <a
                                        href={f.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors group"
                                    >
                                        {#if isImageUrl(f.fileUrl)}
                                            <div
                                                class="w-10 h-10 rounded-lg border border-stone-200 overflow-hidden shrink-0 bg-white"
                                            >
                                                <img
                                                    src={f.fileUrl}
                                                    alt={f.fileName}
                                                    class="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        {:else}
                                            <div
                                                class="w-10 h-10 rounded-lg border border-stone-200 bg-white flex items-center justify-center shrink-0"
                                            >
                                                <FileIcon
                                                    class="w-5 h-5 text-stone-400"
                                                />
                                            </div>
                                        {/if}
                                        <span
                                            class="text-sm font-medium text-stone-700 group-hover:text-stone-900 truncate flex-1"
                                            >{f.fileName}</span
                                        >
                                        <ExternalLinkIcon
                                            class="w-4 h-4 text-stone-300 group-hover:text-stone-500 shrink-0"
                                        />
                                    </a>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <!-- Links -->
                    <div class="flex flex-col gap-2">
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-stone-400"
                        >
                            Links <span class="normal-case font-normal"
                                >({submission?.links?.length ?? 0})</span
                            >
                        </p>
                        {#if !submission?.links || submission.links.length === 0}
                            <p class="text-sm text-stone-400 italic">
                                No links submitted
                            </p>
                        {:else}
                            <div class="flex flex-col gap-2">
                                {#each submission.links as link}
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors group"
                                    >
                                        <div
                                            class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0"
                                        >
                                            <LinkIcon
                                                class="w-5 h-5 text-indigo-600"
                                            />
                                        </div>
                                        <div
                                            class="flex flex-col flex-1 min-w-0"
                                        >
                                            {#if link.title}
                                                <span
                                                    class="text-sm font-semibold text-indigo-600 truncate"
                                                    >{link.title}</span
                                                >
                                                <span
                                                    class="text-xs text-stone-400 truncate"
                                                    >{link.url}</span
                                                >
                                            {:else}
                                                <span
                                                    class="text-sm font-medium text-indigo-600 truncate"
                                                    >{link.url}</span
                                                >
                                            {/if}
                                        </div>
                                        <ExternalLinkIcon
                                            class="w-4 h-4 text-stone-300 group-hover:text-stone-500 shrink-0"
                                        />
                                    </a>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <!-- Notes -->
                    {#if submission?.notes}
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center gap-2">
                                <StickyNoteIcon
                                    class="w-4 h-4 text-stone-400"
                                />
                                <p
                                    class="text-xs font-bold uppercase tracking-widest text-stone-400"
                                >
                                    Notes
                                </p>
                            </div>
                            <div
                                class="bg-stone-50 rounded-xl border border-stone-200 px-4 py-3.5"
                            >
                                <p
                                    class="text-base text-stone-700 leading-relaxed whitespace-pre-line"
                                >
                                    {submission.notes}
                                </p>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>

<GradeSubmissionDialog
    bind:open={showGradeDialog}
    submissionId={submission?.id}
    assignmentTitle={assignment?.title}
    maxScore={assignment?.maxScore}
    currentScore={submission?.score}
    currentFeedback={submission?.feedback}
    {isGraded}
/>
