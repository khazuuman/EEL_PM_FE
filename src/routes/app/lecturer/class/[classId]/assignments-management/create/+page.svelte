<script lang="ts">
    import type { PageData, ActionData } from "./$types";
    import { enhance, deserialize } from "$app/forms";
    import { toast } from "svelte-sonner";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Badge } from "$lib/components/ui/badge";
    import {
        ArrowLeftIcon,
        TrophyIcon,
        LayersIcon,
        ClipboardListIcon,
        PaperclipIcon,
        FileIcon,
        XIcon,
        Loader2Icon,
        UploadCloudIcon,
        SaveIcon,
    } from "lucide-svelte";
    import * as Select from "$lib/components/ui/select/index";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const type = $derived(data.type);

    const typeConfig = $derived(
        (
            {
                Checkpoint: {
                    label: "Checkpoint",
                    icon: LayersIcon,
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                    border: "border-amber-100",
                    ring: "focus-visible:ring-amber-400",
                },
                Outcome: {
                    label: "Outcome",
                    icon: TrophyIcon,
                    color: "text-purple-500",
                    bg: "bg-purple-50",
                    border: "border-purple-100",
                    ring: "focus-visible:ring-purple-400",
                },
                Other: {
                    label: "Assignment",
                    icon: ClipboardListIcon,
                    color: "text-sky-500",
                    bg: "bg-sky-50",
                    border: "border-sky-100",
                    ring: "focus-visible:ring-sky-400",
                },
            } as any
        )[type] ?? {
            label: type,
            icon: LayersIcon,
            color: "text-stone-500",
            bg: "bg-stone-50",
            border: "border-stone-100",
            ring: "focus-visible:ring-stone-400",
        },
    );

    // ── Form state ─────────────────────────────────────────
    let title = $state("");
    let description = $state("");
    let dueDate = $state("");
    let maxScore = $state(10);
    const gradeItems = $derived((data.gradeItems as any[]) ?? []);
    let selectedGradeItemId = $state<number | null>(null);
    let isSubmitting = $state(false);

    // ── File upload ────────────────────────────────────────
    type UploadedFile = { name: string; url: string; isImage?: boolean };
    let uploadedFiles = $state<UploadedFile[]>([]);
    let uploadingFiles = $state<string[]>([]);

    function isImageFile(name: string): boolean {
        return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(name);
    }

    async function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        if (!files.length) return;

        for (const file of files) {
            if (uploadingFiles.includes(file.name)) continue;
            uploadingFiles = [...uploadingFiles, file.name];

            const fd = new FormData();
            fd.append("file", file);

            const res = await fetch("?/uploadFile", {
                method: "POST",
                body: fd,
                headers: { "x-sveltekit-action": "true" },
            });

            const result = deserialize(await res.text()) as any;
            uploadingFiles = uploadingFiles.filter((n) => n !== file.name);

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
                        {
                            name: file.name,
                            url,
                            isImage: isImageFile(file.name), // thêm dòng này
                        },
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
        }

        input.value = "";
    }

    function removeFile(url: string) {
        uploadedFiles = uploadedFiles.filter((f) => f.url !== url);
    }
</script>

<div class="h-full flex flex-col px-6 py-6 space-y-5 bg-white">
    <!-- Header -->
    <div class="flex items-center gap-3">
        <Button
            variant="ghost"
            size="icon"
            onclick={() => history.back()}
            class="w-9 h-9 text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
        >
            <ArrowLeftIcon class="w-4 h-4" />
        </Button>
        <div class="flex items-center gap-3">
            <div
                class="w-9 h-9 rounded-xl {typeConfig.bg} border {typeConfig.border} flex items-center justify-center shrink-0"
            >
                <typeConfig.icon class="w-4 h-4 {typeConfig.color}" />
            </div>
            <div>
                <p
                    class="text-[11px] font-semibold {typeConfig.color} uppercase tracking-widest leading-none mb-0.5"
                >
                    Create
                </p>
                <h1 class="text-xl font-bold text-stone-900 leading-tight">
                    New {typeConfig.label}
                </h1>
            </div>
        </div>
    </div>

    <!-- Form -->
    <form
        method="POST"
        action="?/createAssignment"
        class="flex-1 flex flex-col min-h-0"
        use:enhance={() => {
            isSubmitting = true;
            return async ({ result, update }) => {
                isSubmitting = false;
                if (result.type === "failure") {
                    toast.error(
                        (result.data as any) ?? "Failed to create assignment.",
                    );
                    await update({ reset: false });
                } else if (result.type === "redirect") {
                    toast.success(`${typeConfig.label} created successfully!`);
                    await update();
                }
            };
        }}
    >
        <!-- Hidden fields -->
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="classId" value={data.classId} />

        <!-- Uploaded file URLs -->
        {#each uploadedFiles as f (f.url)}
            <input type="hidden" name="files" value={f.url} />
        {/each}

        <!-- Main content: 2 columns -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">
            <!-- LEFT COLUMN: Basic Info + Schedule & Scoring -->
            <div
                class="rounded-xl border border-stone-200 bg-white divide-y divide-stone-100 h-fit"
            >
                <!-- Basic Info -->
                <div class="p-6 space-y-5">
                    <p
                        class="text-xs font-semibold text-stone-400 uppercase tracking-wider"
                    >
                        Basic Information
                    </p>

                    {#if type !== "Other"}
                        <div class="space-y-1.5">
                            <Label class="text-sm font-semibold text-stone-700">
                                Grade Item <span class="text-red-500">*</span>
                            </Label>

                            <!-- Hidden input để submit giá trị qua form -->
                            <input
                                type="hidden"
                                name="gradeItemId"
                                value={selectedGradeItemId ?? ""}
                            />

                            <Select.Root
                                type="single"
                                onValueChange={(val) =>
                                    (selectedGradeItemId = Number(val))}
                            >
                                <Select.Trigger
                                    class="w-full border-stone-200 {typeConfig.ring}"
                                >
                                    {#if selectedGradeItemId}
                                        {@const selected = gradeItems.find(
                                            (g) =>
                                                g.gradeItemId ===
                                                selectedGradeItemId,
                                        )}
                                        {selected
                                            ? `${selected.name} — ${selected.weight}%`
                                            : "Select a grade item…"}
                                    {:else}
                                        <span class="text-stone-400"
                                            >Select a grade item…</span
                                        >
                                    {/if}
                                </Select.Trigger>
                                <Select.Content>
                                    {#if gradeItems.length === 0}
                                        <div
                                            class="px-3 py-4 text-center text-sm text-stone-400 italic"
                                        >
                                            No grade items available
                                        </div>
                                    {:else}
                                        {#each gradeItems as item (item.gradeItemId)}
                                            <Select.Item
                                                value={String(item.gradeItemId)}
                                            >
                                                <div
                                                    class="flex items-center justify-between gap-4 w-full"
                                                >
                                                    <span class="font-medium"
                                                        >{item.name}</span
                                                    >
                                                    <span
                                                        class="text-xs text-stone-400 shrink-0"
                                                        >{item.weight}%</span
                                                    >
                                                </div>
                                            </Select.Item>
                                        {/each}
                                    {/if}
                                </Select.Content>
                            </Select.Root>

                            {#if gradeItems.length === 0}
                                <p class="text-xs text-stone-400 italic">
                                    No grade items available for this course.
                                </p>
                            {/if}
                        </div>
                    {/if}

                    <!-- Title -->
                    <div class="space-y-1.5">
                        <Label class="text-sm font-semibold text-stone-700">
                            Title <span class="text-red-500">*</span>
                        </Label>
                        <Input
                            name="title"
                            bind:value={title}
                            placeholder="Enter title..."
                            required
                            class="border-stone-200 {typeConfig.ring}"
                        />
                        {#if (form as any)?.errors?.title}
                            <p class="text-xs text-red-500">
                                {(form as any).errors.title}
                            </p>
                        {/if}
                    </div>

                    <!-- Description -->
                    <div class="space-y-1.5">
                        <Label class="text-sm font-semibold text-stone-700">
                            Description
                        </Label>
                        <Textarea
                            name="description"
                            bind:value={description}
                            placeholder="Describe the assignment..."
                            rows={4}
                            class="resize-none border-stone-200 {typeConfig.ring}"
                        />
                    </div>
                </div>

                <!-- Schedule & Scoring -->
                <div class="p-6 space-y-5">
                    <p
                        class="text-xs font-semibold text-stone-400 uppercase tracking-wider"
                    >
                        Schedule & Scoring
                    </p>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <Label class="text-sm font-semibold text-stone-700">
                                Due Date <span class="text-red-500">*</span>
                            </Label>
                            <input
                                id="dueDate"
                                name="dueDate"
                                type="datetime-local"
                                bind:value={dueDate}
                                required
                                class="flex h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 py-1 text-sm
                                        shadow-sm transition-colors placeholder:text-stone-400
                                        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500
                                        disabled:cursor-not-allowed disabled:opacity-50
                                        [&::-webkit-calendar-picker-indicator]:opacity-60
                                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                                        [&::-webkit-calendar-picker-indicator]:invert-[45%]
                                        [&::-webkit-calendar-picker-indicator]:ml-auto"
                            />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-sm font-semibold text-stone-700">
                                Max Score <span class="text-red-500">*</span>
                            </Label>
                            <Input
                                name="maxScore"
                                type="number"
                                min={0}
                                bind:value={maxScore}
                                required
                                class="border-stone-200 {typeConfig.ring}"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: Attachments -->
            <div class="rounded-xl border border-stone-200 bg-white h-fit">
                <div class="p-6 space-y-4">
                    <p
                        class="text-xs font-semibold text-stone-400 uppercase tracking-wider"
                    >
                        Attachments
                    </p>

                    <!-- File list -->
                    <!-- Fixed height scrollable container -->
                    <div class="h-72 overflow-y-auto pr-1 space-y-3">
                        {#if uploadedFiles.length > 0 || uploadingFiles.length > 0}
                            <!-- Uploading indicators -->
                            {#if uploadingFiles.length > 0}
                                <div class="space-y-2">
                                    {#each uploadingFiles as name (name)}
                                        <div
                                            class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200 animate-pulse"
                                        >
                                            <Loader2Icon
                                                class="w-4 h-4 text-stone-400 shrink-0 animate-spin"
                                            />
                                            <span
                                                class="flex-1 text-sm text-stone-400 truncate"
                                                >{name}</span
                                            >
                                            <span class="text-xs text-stone-300"
                                                >Uploading...</span
                                            >
                                        </div>
                                    {/each}
                                </div>
                            {/if}

                            {@const imageFiles = uploadedFiles.filter(
                                (f) => f.isImage,
                            )}
                            {@const nonImageFiles = uploadedFiles.filter(
                                (f) => !f.isImage,
                            )}

                            <!-- Images: 2-column grid -->
                            {#if imageFiles.length > 0}
                                <div class="grid grid-cols-2 gap-2">
                                    {#each imageFiles as f (f.url)}
                                        <div
                                            class="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden"
                                        >
                                            <div
                                                class="w-full bg-stone-100"
                                                style="height:120px"
                                            >
                                                <img
                                                    src={f.url}
                                                    alt={f.name}
                                                    class="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div
                                                class="px-2 py-1.5 flex items-center gap-1.5"
                                            >
                                                <a
                                                    href={f.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="flex-1 text-xs text-stone-600 font-medium truncate hover:text-amber-600 hover:underline transition-colors"
                                                    title={f.name}
                                                >
                                                    {f.name}
                                                </a>
                                                <Badge
                                                    class="text-[10px] px-1 py-0 bg-amber-100 text-amber-600 border-amber-200 pointer-events-none shrink-0"
                                                >
                                                    New
                                                </Badge>
                                                <button
                                                    type="button"
                                                    onclick={() =>
                                                        removeFile(f.url)}
                                                    class="text-stone-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                                >
                                                    <XIcon
                                                        class="w-3.5 h-3.5"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {/if}

                            <!-- Non-image files: 1 row each -->
                            {#if nonImageFiles.length > 0}
                                <div class="space-y-2">
                                    {#each nonImageFiles as f (f.url)}
                                        <div
                                            class="rounded-lg border border-amber-200 bg-amber-50 flex items-center gap-3 px-3 py-2.5"
                                        >
                                            <FileIcon
                                                class="w-4 h-4 text-amber-500 shrink-0"
                                            />
                                            <a
                                                href={f.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="flex-1 text-sm text-stone-700 font-medium truncate hover:text-amber-600 hover:underline transition-colors"
                                                title={f.name}
                                            >
                                                {f.name}
                                            </a>
                                            <Badge
                                                class="text-xs bg-amber-100 text-amber-600 border-amber-200 pointer-events-none shrink-0"
                                            >
                                                New
                                            </Badge>
                                            <button
                                                type="button"
                                                onclick={() =>
                                                    removeFile(f.url)}
                                                class="text-stone-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                            >
                                                <XIcon class="w-4 h-4" />
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        {:else}
                            <!-- Empty state -->
                            <div
                                class="flex flex-col items-center justify-center h-full gap-2 text-stone-300"
                            >
                                <UploadCloudIcon class="w-10 h-10" />
                                <p class="text-sm font-semibold text-stone-400">
                                    No attachments yet
                                </p>
                                <p class="text-xs text-stone-300">
                                    Upload files below
                                </p>
                            </div>
                        {/if}
                    </div>

                    <!-- Upload button -->
                    <label
                        class="flex items-center gap-2.5 w-fit px-4 py-2.5 rounded-lg border border-dashed border-stone-300 text-stone-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer text-sm font-medium {uploadingFiles.length >
                        0
                            ? 'opacity-50 pointer-events-none'
                            : ''}"
                    >
                        {#if uploadingFiles.length > 0}
                            <Loader2Icon class="w-4 h-4 animate-spin" />
                            Uploading...
                        {:else}
                            <UploadCloudIcon class="w-4 h-4" />
                            Upload files
                        {/if}
                        <input
                            type="file"
                            multiple
                            class="hidden"
                            onchange={handleFileChange}
                            disabled={uploadingFiles.length > 0}
                        />
                    </label>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-4">
            <Button
                type="button"
                variant="ghost"
                onclick={() => history.back()}
                disabled={isSubmitting}
                class="text-stone-400 hover:text-stone-600 cursor-pointer"
            >
                Cancel
            </Button>
            <Button
                type="submit"
                disabled={isSubmitting || uploadingFiles.length > 0}
                class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 cursor-pointer min-w-36"
            >
                {#if isSubmitting}
                    <Loader2Icon class="w-4 h-4 animate-spin mr-2" />
                    Creating...
                {:else}
                    <SaveIcon class="w-4 h-4 mr-2" />
                    Create {typeConfig.label}
                {/if}
            </Button>
        </div>
    </form>
</div>
