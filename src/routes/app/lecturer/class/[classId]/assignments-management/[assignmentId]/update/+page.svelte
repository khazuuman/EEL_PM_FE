<script lang="ts">
    import { deserialize, enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { toast } from "svelte-sonner";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Badge } from "$lib/components/ui/badge";
    import {
        Loader2Icon,
        UploadCloudIcon,
        FileIcon,
        XIcon,
        ArrowLeftIcon,
        SaveIcon,
        Trash2Icon,
    } from "lucide-svelte";
    import * as Select from "$lib/components/ui/select/index";
    let { data, form } = $props();

    const assignment = data.assignment?.assignment;
    const classId = $page.params.classId;
    const assignmentId = $page.params.assignmentId;

    // Form state
    let title = $state(assignment?.title ?? "");
    let type = $state(assignment?.assignmentType ?? "Checkpoint");
    let sequenceNumber = $state(assignment?.sequenceNumber ?? 1);
    let description = $state(assignment?.description ?? "");
    let dueDate = $state(
        assignment?.dueDate
            ? new Date(assignment.dueDate).toISOString().slice(0, 16)
            : "",
    );
    let maxScore = $state(assignment?.maxScore ?? 100);
    type UploadedFile = { name: string; url: string; isImage: boolean };
    // Existing files from server
    let existingFiles: { fileId: number; fileName: string; fileUrl: string }[] =
        $state(assignment?.files ?? []);

    // Newly uploaded file URLs (after uploadFile action)
    let uploadedFiles = $state<UploadedFile[]>([]);

    // Uploading state
    let uploadingFile = $state(false);
    let saving = $state(false);

    // Show sequenceNumber only for Checkpoint and Outcome
    let showSequence = $derived(type === "Checkpoint" || type === "Outcome");

    function isImageUrl(url: string): boolean {
        return /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
    }

    function isImageFile(name: string): boolean {
        return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(name);
    }

    // Display name for file
    function getDisplayName(fileName: string) {
        // Strip UUID prefix (pattern: uuid_originalname)
        const parts = fileName.split("_");
        if (parts.length > 1) {
            // Check if first segment looks like a UUID
            const uuidPattern =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidPattern.test(parts[0])) {
                return parts.slice(1).join("_");
            }
        }
        return fileName;
    }

    function removeExistingFile(fileId: number) {
        existingFiles = existingFiles.filter((f) => f.fileId !== fileId);
    }

    function removeUploadedFile(url: string) {
        uploadedFiles = uploadedFiles.filter((f) => f.url !== url);
    }

    async function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        if (!files.length) return;

        for (const file of files) {
            // Kiểm tra trùng theo name thay vì includes(file.name) trên object array
            if (uploadedFiles.some((f) => f.name === file.name)) continue;

            // Thêm placeholder object để track uploading state
            const placeholder: UploadedFile = {
                name: file.name,
                url: "",
                isImage: false,
            };
            uploadedFiles = [...uploadedFiles, placeholder];

            const fd = new FormData();
            fd.append("file", file);

            const res = await fetch(
                `/app/lecturer/class/${classId}/assignments-management/${assignmentId}?/uploadFile`,
                {
                    method: "POST",
                    body: fd,
                    headers: { "x-sveltekit-action": "true" },
                },
            );

            const result = deserialize(await res.text()) as any;

            // Xóa placeholder
            uploadedFiles = uploadedFiles.filter(
                (f) => f.name !== file.name || f.url !== "",
            );

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
                            isImage: isImageFile(file.name),
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
</script>

<div class="h-full flex flex-col px-6 py-6 space-y-5 bg-white">
    <!-- Header -->
    <div class="flex items-center gap-3">
        <Button
            variant="ghost"
            size="icon"
            class="w-9 h-9 text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            onclick={() =>
                goto(`/app/lecturer/class/${classId}/assignments-management`)}
        >
            <ArrowLeftIcon class="w-4 h-4" />
        </Button>
        <div>
            <h1 class="text-xl font-bold text-stone-900">Edit Assignment</h1>
            <p class="text-sm text-stone-400 mt-0.5">
                Update the details for this assignment
            </p>
        </div>
    </div>

    <!-- Form -->
    <form
        method="POST"
        action="/app/lecturer/class/${classId}/assignments-management/${assignmentId}?/updateAssignment"
        class="flex-1 flex flex-col min-h-0"
        use:enhance={() => {
            saving = true;
            return async ({ result, update }) => {
                saving = false;
                if (result.type === "redirect") {
                    toast.success("Assignment updated successfully.");
                    await update();
                } else if (result.type === "failure") {
                    toast.error(
                        (result.data as any)?.message ??
                            "Failed to update assignment.",
                    );
                }
            };
        }}
    >
        <!-- Hidden fields -->
        <input type="hidden" name="classId" value={classId} />
        <input type="hidden" name="assignmentId" value={assignmentId} />
        {#each existingFiles as ef}
            <input type="hidden" name="files" value={ef.fileUrl} />
        {/each}
        {#each uploadedFiles as f}
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

                    <!-- Title -->
                    <div class="space-y-1.5">
                        <Label
                            for="title"
                            class="text-sm font-semibold text-stone-700"
                        >
                            Title <span class="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            bind:value={title}
                            placeholder="Enter assignment title"
                            required
                            class="border-stone-200 focus-visible:ring-amber-500"
                        />
                    </div>

                    <!-- Type + Sequence Number -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <Label
                                for="type"
                                class="text-sm font-semibold text-stone-700"
                            >
                                Type <span class="text-red-500">*</span>
                            </Label>
                            <Select.Root
                                type="single"
                                disabled={true}
                                value={type}
                                onValueChange={(v) => {
                                    type = v;
                                }}
                            >
                                <Select.Trigger class="w-full border-stone-200">
                                    {type || "Select type"}
                                </Select.Trigger>
                                <Select.Content>
                                    <Select.Item value="Checkpoint"
                                        >Checkpoint</Select.Item
                                    >
                                    <Select.Item value="Outcome"
                                        >Outcome</Select.Item
                                    >
                                    <Select.Item value="Other"
                                        >Other</Select.Item
                                    >
                                </Select.Content>
                            </Select.Root>
                            <input type="hidden" name="type" value={type} />
                        </div>

                        {#if showSequence}
                            <div class="space-y-1.5">
                                <Label
                                    for="sequenceNumber"
                                    class="text-sm font-semibold text-stone-700"
                                >
                                    Sequence No. <span class="text-red-500"
                                        >*</span
                                    >
                                </Label>
                                <Input
                                    id="sequenceNumber"
                                    name="sequenceNumber"
                                    type="number"
                                    min="1"
                                    bind:value={sequenceNumber}
                                    required={showSequence}
                                    class="border-stone-200 focus-visible:ring-amber-500"
                                />
                            </div>
                        {:else}
                            <input
                                type="hidden"
                                name="sequenceNumber"
                                value="0"
                            />
                        {/if}
                    </div>

                    <!-- Description -->
                    <div class="space-y-1.5">
                        <Label
                            for="description"
                            class="text-sm font-semibold text-stone-700"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            bind:value={description}
                            placeholder="Enter assignment description (optional)"
                            rows={4}
                            class="border-stone-200 focus-visible:ring-amber-500 resize-none"
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
                            <Label
                                for="dueDate"
                                class="text-sm font-semibold text-stone-700"
                            >
                                Due Date <span class="text-red-500">*</span>
                            </Label>
                            <Input
                                id="dueDate"
                                name="dueDate"
                                type="datetime-local"
                                bind:value={dueDate}
                                required
                                class="border-stone-200 focus-visible:ring-amber-500"
                            />
                        </div>
                        <div class="space-y-1.5">
                            <Label
                                for="maxScore"
                                class="text-sm font-semibold text-stone-700"
                            >
                                Max Score <span class="text-red-500">*</span>
                            </Label>
                            <Input
                                id="maxScore"
                                name="maxScore"
                                type="number"
                                min="0"
                                bind:value={maxScore}
                                required
                                class="border-stone-200 focus-visible:ring-amber-500"
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

                    {#if existingFiles.length > 0 || uploadedFiles.length > 0}
                        <div class="space-y-2">
                            <!-- Existing files -->
                            {#each existingFiles as ef (ef.fileId)}
                                <div
                                    class="rounded-lg border border-stone-200 bg-stone-50 overflow-hidden"
                                >
                                    {#if isImageUrl(ef.fileUrl)}
                                        <div
                                            class="w-full bg-stone-100 border-b border-stone-200"
                                            style="max-height:160px"
                                        >
                                            <img
                                                src={ef.fileUrl}
                                                alt={getDisplayName(
                                                    ef.fileName,
                                                )}
                                                class="w-full object-contain"
                                                style="max-height:160px"
                                            />
                                        </div>
                                    {/if}
                                    <div
                                        class="flex items-center gap-3 px-3 py-2.5"
                                    >
                                        <FileIcon
                                            class="w-4 h-4 text-stone-400 shrink-0"
                                        />
                                        <a
                                            href={ef.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="flex-1 text-sm text-stone-700 font-medium truncate hover:text-amber-600 hover:underline transition-colors"
                                            title={getDisplayName(ef.fileName)}
                                        >
                                            {getDisplayName(ef.fileName)}
                                        </a>
                                        <button
                                            type="button"
                                            onclick={() =>
                                                removeExistingFile(ef.fileId)}
                                            class="text-stone-300 hover:text-red-500 transition-colors cursor-pointer"
                                            title="Remove file"
                                        >
                                            <XIcon class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            {/each}

                            <!-- Newly uploaded files -->
                            {#each uploadedFiles as f (f.url)}
                                <div
                                    class="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden"
                                >
                                    {#if f.isImage}
                                        <div
                                            class="w-full bg-stone-100 border-b border-amber-200"
                                            style="max-height:160px"
                                        >
                                            <img
                                                src={f.url}
                                                alt={f.name}
                                                class="w-full object-contain"
                                                style="max-height:160px"
                                            />
                                        </div>
                                    {/if}
                                    <div
                                        class="flex items-center gap-3 px-3 py-2.5"
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
                                            class="text-xs bg-amber-100 text-amber-600 border-amber-200 pointer-events-none"
                                        >
                                            New
                                        </Badge>
                                        <button
                                            type="button"
                                            onclick={() =>
                                                removeUploadedFile(f.url)}
                                            class="text-stone-300 hover:text-red-500 transition-colors cursor-pointer"
                                            title="Remove file"
                                        >
                                            <XIcon class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <!-- Empty state -->
                        <div
                            class="flex flex-col items-center gap-2 py-12 text-stone-300"
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

                    <!-- Upload button -->
                    <label
                        class="flex items-center gap-2.5 w-fit px-4 py-2.5 rounded-lg border border-dashed border-stone-300 text-stone-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer text-sm font-medium {uploadingFile
                            ? 'opacity-50 pointer-events-none'
                            : ''}"
                    >
                        {#if uploadingFile}
                            <Loader2Icon class="w-4 h-4 animate-spin" />
                            Uploading...
                        {:else}
                            <UploadCloudIcon class="w-4 h-4" />
                            Upload file
                        {/if}
                        <input
                            type="file"
                            class="hidden"
                            onchange={handleFileChange}
                            disabled={uploadingFile}
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
                class="text-stone-400 hover:text-stone-600 cursor-pointer"
                onclick={() =>
                    goto(
                        `/app/lecturer/class/${classId}/assignments-management`,
                    )}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                disabled={saving || uploadingFile}
                class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 cursor-pointer"
            >
                {#if saving}
                    <Loader2Icon class="w-4 h-4 animate-spin mr-2" />
                    Saving...
                {:else}
                    <SaveIcon class="w-4 h-4 mr-2" />
                    Save Changes
                {/if}
            </Button>
        </div>
    </form>
</div>
