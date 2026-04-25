<!-- src/routes/app/student/assignments/[assignmentId]/+page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { deserialize, enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import {
        ArrowLeftIcon,
        CalendarIcon,
        TrophyIcon,
        LayersIcon,
        ClipboardListIcon,
        FileIcon,
        LinkIcon,
        SendIcon,
        CheckCircle2Icon,
        ClockIcon,
        XCircleIcon,
        AlertCircleIcon,
        PlusIcon,
        Trash2Icon,
        UploadIcon,
        Loader2Icon,
        PencilIcon,
        ExternalLinkIcon,
        StickyNoteIcon,
        MessageSquareIcon,
    } from "lucide-svelte";

    type UploadedFile = {
        name: string;
        url: string;
        isImage: boolean;
    };

    let { data }: { data: PageData } = $props();

    let assignment = $derived(data.submission?.assignment ?? null);
    let submission = $derived(data.submission?.submission ?? null);
    let isNotSubmitted = $derived(submission?.status === "Not Submitted");
    let isGraded = $derived(submission?.status === "Graded");
    let isLeader = $derived(data.user?.student?.group?.isLeader ?? false);

    let editMode = $state(false);
    let linkUrlError = $state("");

    let uploadedFiles = $state<UploadedFile[]>(
        isNotSubmitted
            ? []
            : (submission?.files ?? []).map(
                  (f: { fileName: string; fileUrl: string }) => ({
                      name: f.fileName,
                      url: f.fileUrl,
                      isImage: isImageUrl(f.fileName),
                  }),
              ),
    );
    let links = $state<{ title: string; url: string }[]>(
        isNotSubmitted ? [] : (submission?.links ?? []),
    );
    let notes = $state<string>(isNotSubmitted ? "" : (submission?.notes ?? ""));
    let newLinkTitle = $state("");
    let newLinkUrl = $state("");
    let uploadingFile = $state(false);
    let submitting = $state(false);

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

    function getFileName(url: string): string {
        try {
            const segments = new URL(url).pathname.split("/");
            return decodeURIComponent(segments[segments.length - 1]) || url;
        } catch {
            return url;
        }
    }

    function isValidUrl(url: string): boolean {
        try {
            const u = new URL(url.trim());
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    }

    function addLink() {
        if (!newLinkUrl.trim()) return;
        if (!isValidUrl(newLinkUrl)) {
            linkUrlError =
                "Invalid URL. Please enter a URL starting with http:// or https://";
            return;
        }
        linkUrlError = "";
        links = [
            ...links,
            { title: newLinkTitle.trim(), url: newLinkUrl.trim() },
        ];
        newLinkTitle = "";
        newLinkUrl = "";
    }

    function removeLink(i: number) {
        links = links.filter((_, idx) => idx !== i);
    }

    function removeFile(url: string) {
        uploadedFiles = uploadedFiles.filter((f) => f.url !== url);
    }

    async function handleFileUpload(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        uploadingFile = true;
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("?/uploadFile", {
            method: "POST",
            body: fd,
            headers: { "x-sveltekit-action": "true" },
        });

        const result = deserialize(await res.text()) as any;
        uploadingFile = false;

        if (result?.type === "success") {
            const url =
                typeof result?.data?.result === "string"
                    ? result.data.result
                    : (result?.data?.result?.data ??
                      result?.data?.result?.fileUrl ??
                      null);
            if (url) {
                uploadedFiles = [
                    ...uploadedFiles,
                    { name: file.name, url, isImage: isImageUrl(file.name) },
                ];
                toast.success(`${file.name} uploaded.`);
            } else {
                toast.error(`Failed to get URL for ${file.name}`);
            }
        } else {
            toast.error(
                result?.data?.message ?? `Failed to upload ${file.name}`,
            );
        }

        input.value = "";
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

    let showForm = $derived((isNotSubmitted || editMode) && isLeader);
</script>

<div class="bg-stone-100 min-h-screen px-8 py-6">
    <div class="flex flex-col gap-5">
        <!-- Back -->
        <button
            onclick={() => goto(`/app/student/assignment-checkpoint`)}
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
            <!-- ── SECTION 1: Assignment Info ────────────────────── -->
            <div
                class="bg-white rounded-xl border border-stone-200 overflow-hidden"
            >
                <!-- Header -->
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

                <!-- Body -->
                <div class="px-6 py-5 flex flex-col gap-5">
                    <!-- Meta chips -->
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

                    <!-- Description -->
                    <div class="rounded-xl border border-stone-300 px-5 py-4">
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

                    <div class="rounded-xl border border-stone-300 px-5 py-4">
                        <div class="flex flex-col gap-2">
                            <p
                                class="text-xs font-bold uppercase tracking-widest text-stone-400"
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
                                            >
                                                {f.fileName}
                                            </span>
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
            </div>

            <!-- ── SECTION 2: My Submission ──────────────────────── -->
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
                            My Submission
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

                    <!-- Edit button -->
                    {#if !isNotSubmitted && !isGraded && assignment.status === "Active" && isLeader}
                        <button
                            onclick={() => {
                                editMode = !editMode;
                            }}
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-sm font-medium text-stone-700 cursor-pointer transition-colors"
                        >
                            <PencilIcon class="w-4 h-4" />
                            {editMode ? "Cancel" : "Edit submission"}
                        </button>
                    {/if}
                </div>

                <!-- Body -->
                <div class="px-6 py-5 flex flex-col gap-5">
                    <!-- Feedback + Notes khi Graded -->
                    {#if isGraded}
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
                        {#if submission?.notes}
                            <div
                                class="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4"
                            >
                                <div class="flex items-center gap-2 mb-2.5">
                                    <StickyNoteIcon
                                        class="w-4 h-4 text-amber-600"
                                    />
                                    <p
                                        class="text-xs font-bold uppercase tracking-widest text-amber-700"
                                    >
                                        Notes
                                    </p>
                                </div>
                                <p
                                    class="text-base text-stone-700 leading-relaxed whitespace-pre-line"
                                >
                                    {submission.notes}
                                </p>
                            </div>
                        {/if}
                    {/if}

                    <!-- View mode -->
                    {#if !showForm}
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
                                            >
                                                {f.fileName}
                                            </span>
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

                        <!-- Notes view -->
                        {#if submission?.notes && !isGraded}
                            <div class="flex flex-col gap-2">
                                <p
                                    class="text-xs font-bold uppercase tracking-widest text-stone-400"
                                >
                                    Notes
                                </p>
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
                    {/if}

                    <!-- ── FORM ─────────────────────────────────── -->
                    {#if showForm}
                        <form
                            method="POST"
                            action="?/submitAssignment"
                            use:enhance={() => {
                                submitting = true;
                                return async ({ result }) => {
                                    submitting = false;
                                    if (result.type === "success") {
                                        toast.success(
                                            editMode
                                                ? "Submission updated."
                                                : "Assignment submitted!",
                                        );
                                        editMode = false;
                                        await invalidateAll();
                                    } else if (result.type === "failure") {
                                        toast.error(
                                            (result.data as any)?.message ??
                                                "Failed to submit.",
                                        );
                                    }
                                };
                            }}
                            class="flex flex-col gap-6"
                        >
                            <input
                                type="hidden"
                                name="assignmentId"
                                value={assignment.assignmentId}
                            />
                            {#each uploadedFiles as f}
                                <input
                                    type="hidden"
                                    name="fileUrls"
                                    value={f.url}
                                />
                            {/each}
                            {#each links as link}
                                <input
                                    type="hidden"
                                    name="links"
                                    value={JSON.stringify(link)}
                                />
                            {/each}

                            <!-- Files -->
                            <div class="flex flex-col gap-3">
                                <Label
                                    class="text-xs font-bold uppercase tracking-widest text-stone-500"
                                    >Files</Label
                                >

                                {#if uploadedFiles.length > 0}
                                    <div class="flex flex-col gap-2">
                                        {#each uploadedFiles as f}
                                            <div
                                                class="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 group"
                                            >
                                                {#if f.isImage}
                                                    <div
                                                        class="w-10 h-10 rounded-lg border border-stone-200 overflow-hidden shrink-0 bg-white"
                                                    >
                                                        <img
                                                            src={f.url}
                                                            alt={f.name}
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
                                                <div
                                                    class="flex flex-col flex-1 min-w-0"
                                                >
                                                    <span
                                                        class="text-sm font-medium text-stone-700 truncate"
                                                        >{f.name}</span
                                                    >
                                                    <a
                                                        href={f.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="text-xs text-stone-400 hover:text-indigo-500 truncate transition-colors"
                                                    >
                                                        {f.url}
                                                    </a>
                                                </div>
                                                <button
                                                    type="button"
                                                    onclick={() =>
                                                        removeFile(f.url)}
                                                    class="text-stone-300 hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                                                >
                                                    <Trash2Icon
                                                        class="w-4 h-4"
                                                    />
                                                </button>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}

                                <label
                                    class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                                >
                                    {#if uploadingFile}
                                        <Loader2Icon
                                            class="w-5 h-5 text-indigo-500 animate-spin"
                                        />
                                        <span
                                            class="text-sm font-medium text-indigo-500"
                                            >Uploading...</span
                                        >
                                    {:else}
                                        <UploadIcon
                                            class="w-5 h-5 text-stone-400 group-hover:text-indigo-500 transition-colors"
                                        />
                                        <span
                                            class="text-sm font-medium text-stone-400 group-hover:text-indigo-500 transition-colors"
                                        >
                                            Click to upload file
                                        </span>
                                    {/if}
                                    <input
                                        type="file"
                                        class="hidden"
                                        disabled={uploadingFile}
                                        onchange={handleFileUpload}
                                    />
                                </label>
                            </div>

                            <!-- Links -->
                            <div class="flex flex-col gap-3">
                                <Label
                                    class="text-xs font-bold uppercase tracking-widest text-stone-500"
                                    >Links</Label
                                >

                                {#if links.length > 0}
                                    <div class="flex flex-col gap-2">
                                        {#each links as link, i}
                                            <div
                                                class="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50"
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
                                                            class="text-sm font-semibold text-stone-700 truncate"
                                                            >{link.title}</span
                                                        >
                                                        <span
                                                            class="text-xs text-stone-400 truncate"
                                                            >{link.url}</span
                                                        >
                                                    {:else}
                                                        <span
                                                            class="text-sm font-medium text-stone-600 truncate"
                                                            >{link.url}</span
                                                        >
                                                    {/if}
                                                </div>
                                                <button
                                                    type="button"
                                                    onclick={() =>
                                                        removeLink(i)}
                                                    class="text-stone-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                                >
                                                    <Trash2Icon
                                                        class="w-4 h-4"
                                                    />
                                                </button>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}

                                <div class="flex gap-2">
                                    <Input
                                        bind:value={newLinkTitle}
                                        placeholder="Title (optional)"
                                        class="flex-[2] border-stone-300 text-sm h-11"
                                    />
                                    <Input
                                        bind:value={newLinkUrl}
                                        placeholder="https://..."
                                        oninput={() => {
                                            linkUrlError = "";
                                        }}
                                        class="flex-[3] border-stone-300 text-sm h-11
                                        {linkUrlError
                                            ? 'border-red-400 focus-visible:ring-red-300'
                                            : ''}"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onclick={addLink}
                                        disabled={!newLinkUrl.trim()}
                                        class="gap-1.5 cursor-pointer border-stone-300 h-11 shrink-0"
                                    >
                                        <PlusIcon class="w-4 h-4" />
                                        Add
                                    </Button>
                                </div>
                                {#if linkUrlError}
                                        <p class="text-xs text-red-500 mt-1">
                                            {linkUrlError}
                                        </p>
                                    {/if}
                            </div>

                            <!-- Notes -->
                            <div class="flex flex-col gap-2">
                                <Label
                                    class="text-xs font-bold uppercase tracking-widest text-stone-500"
                                >
                                    Notes <span
                                        class="normal-case font-normal text-stone-400"
                                        >(optional)</span
                                    >
                                </Label>
                                <Textarea
                                    name="notes"
                                    bind:value={notes}
                                    placeholder="Add any notes for your lecturer..."
                                    rows={4}
                                    class="border-stone-300 text-base resize-none"
                                />
                            </div>

                            <!-- Submit -->
                            <div class="flex items-center gap-3 pt-1">
                                <Button
                                    type="submit"
                                    disabled={submitting || uploadingFile}
                                    class="gap-2 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer px-8 h-11 text-base font-semibold"
                                >
                                    {#if submitting}
                                        <Loader2Icon
                                            class="w-4 h-4 animate-spin"
                                        />
                                        Submitting...
                                    {:else}
                                        <SendIcon class="w-4 h-4" />
                                        {editMode
                                            ? "Update Submission"
                                            : "Submit"}
                                    {/if}
                                </Button>
                                {#if editMode}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onclick={() => {
                                            editMode = false;
                                        }}
                                        class="cursor-pointer text-stone-500 h-11 text-base"
                                    >
                                        Cancel
                                    </Button>
                                {/if}
                            </div>
                        </form>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>
