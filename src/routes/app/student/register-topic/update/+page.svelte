<script lang="ts">
    import { deserialize, enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator";
    import * as Card from "$lib/components/ui/card";
    import {
        LinkIcon,
        UploadCloudIcon,
        XIcon,
        ArrowLeftIcon,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import type { PageData, ActionData } from "./$types";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const topic = $derived(
        data.currentTopic && data.currentTopic.length > 0
            ? data.currentTopic[0]
            : null,
    );

    let logoUrl = $state(topic?.logoUrl ?? "");
    let isUploading = $state(false);
    let uploadError = $state("");
    let previewUrl = $state(topic?.logoUrl ?? "");
    let isDragging = $state(false);

    async function handleFileUpload(file: File) {
        if (!file) return;
        isUploading = true;
        uploadError = "";

        const fd = new FormData();
        fd.append("file", file);

        const toastId = toast.loading("Uploading logo...");

        const res = await fetch("?/UploadLogo", {
            method: "POST",
            body: fd,
            headers: { "x-sveltekit-action": "true" },
        });

        const text = await res.text();
        const result = deserialize(text) as any;

        const url = result?.data?.result?.data;

        if (result?.type === "success" && url) {
            logoUrl = url;
            previewUrl = url; // ← dùng URL từ server thay vì createObjectURL
            toast.success("Logo uploaded successfully", { id: toastId });
        } else {
            uploadError = result?.data?.message ?? "Failed to upload logo";
            toast.error(uploadError, { id: toastId });
        }

        isUploading = false;
    }

    function onFileInput(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) handleFileUpload(file);
    }

    function onDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;
        const file = e.dataTransfer?.files?.[0];
        if (file) handleFileUpload(file);
    }

    function removeImage() {
        logoUrl = "";
        previewUrl = "";
        toast.info("Logo removed");
    }
</script>

<!-- Guard: không có topic để update -->
{#if !topic}
    <div
        class="flex min-h-[calc(100vh-80px)] items-center justify-center px-8 pt-20"
    >
        <div class="flex max-w-md flex-col items-center gap-4 text-center">
            <div
                class="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                </svg>
            </div>
            <div class="flex flex-col gap-1">
                <h2 class="text-lg font-semibold text-zinc-900">
                    No topic found
                </h2>
                <p class="text-sm text-zinc-500 leading-relaxed">
                    Your group has not registered a topic yet. Please register a
                    topic first before updating.
                </p>
            </div>
            <Button
                type="button"
                variant="outline"
                class="mt-2 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                onclick={() => history.back()}
            >
                <ArrowLeftIcon class="mr-2 h-4 w-4" />
                Go Back
            </Button>
        </div>
    </div>
{:else}
    <!-- Top bar -->
    <div
        class="sticky top-0 z-10 border-b border-zinc-200 bg-white px-8 pb-5 pt-20"
    >
        <div class="mx-auto flex max-w-5xl items-center justify-between">
            <div class="flex items-center gap-3">
                <button
                    type="button"
                    onclick={() => history.back()}
                    class="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
                >
                    <ArrowLeftIcon class="h-4 w-4" />
                    Back
                </button>
                <Separator orientation="vertical" class="h-5" />
                <div>
                    <h1 class="text-base font-semibold text-zinc-900">
                        Update Topic
                    </h1>
                    <p class="text-xs text-zinc-400">
                        Edit your group's graduation project topic
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    class="border-zinc-200 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    onclick={() => history.back()}
                >
                    Cancel
                </Button>
                <Button
                    form="update-topic-form"
                    type="submit"
                    disabled={isUploading}
                    class="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    </div>

    <!-- Page body -->
    <div class="mx-auto max-w-5xl px-8 py-8">
        <form
            id="update-topic-form"
            method="POST"
            action="?/UpdateTopic"
            use:enhance={() => {
                const toastId = toast.loading("Saving changes...");
                return async ({ result, update }) => {
                    if (result.type === "success") {
                        toast.success("Topic updated successfully!", {
                            id: toastId,
                        });
                        await history.back();
                    } else {
                        const msg =
                            result.type === "failure"
                                ? ((result.data?.message as string) ??
                                  "Failed to update topic")
                                : "An unexpected error occurred";
                        toast.error(msg, { id: toastId });
                        await update();
                    }
                };
            }}
        >
            <!-- Hidden fields -->
            <input type="hidden" name="topicId" value={topic.topicId} />
            <input type="hidden" name="logoUrl" value={logoUrl} />

            <div class="grid grid-cols-3 gap-8">
                <!-- LEFT: Main fields (2/3) -->
                <div class="col-span-2 flex flex-col gap-6">
                    <Card.Root
                        class="rounded-xl border border-zinc-200 shadow-sm"
                    >
                        <Card.Header>
                            <p
                                class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
                            >
                                Topic Information
                            </p>
                        </Card.Header>
                        <Separator />
                        <Card.Content class="flex flex-col gap-5 pt-5">
                            <!-- Title -->
                            <div class="flex flex-col gap-1.5">
                                <Label
                                    for="title"
                                    class="text-sm font-medium text-zinc-900"
                                >
                                    Topic Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={topic.title}
                                    placeholder="e.g., E-commerce Management System"
                                    required
                                    class="border-zinc-200 focus-visible:ring-orange-500"
                                />
                                <p class="text-xs text-zinc-400">
                                    Provide a clear, concise title for your
                                    project.
                                </p>
                            </div>

                            <!-- Description -->
                            <div class="flex flex-col gap-1.5">
                                <Label
                                    for="description"
                                    class="text-sm font-medium text-zinc-900"
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={topic.description}
                                    placeholder="Briefly describe your project..."
                                    required
                                    class="min-h-[120px] resize-y border-zinc-200 focus-visible:ring-orange-500"
                                />
                            </div>

                            <!-- Objectives -->
                            <div class="flex flex-col gap-1.5">
                                <Label
                                    for="objectives"
                                    class="text-sm font-medium text-zinc-900"
                                >
                                    Objectives
                                </Label>
                                <Textarea
                                    id="objectives"
                                    name="objectives"
                                    value={topic.objectives ?? ""}
                                    placeholder="What are the main goals of this project?"
                                    required
                                    class="min-h-[120px] resize-y border-zinc-200 focus-visible:ring-orange-500"
                                />
                            </div>
                        </Card.Content>
                    </Card.Root>

                    {#if form?.message}
                        <p
                            class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-500 border border-red-200"
                        >
                            {form.message}
                        </p>
                    {/if}
                </div>

                <!-- RIGHT: Logo upload (1/3) -->
                <div class="col-span-1 flex flex-col gap-6">
                    <Card.Root
                        class="rounded-xl border border-zinc-200 shadow-sm"
                    >
                        <Card.Header>
                            <p
                                class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
                            >
                                Project Logo
                            </p>
                            <p class="text-xs text-zinc-400 mt-1">
                                Optional — upload a logo for your project
                            </p>
                        </Card.Header>
                        <Separator />
                        <Card.Content class="flex flex-col gap-4 pt-5">
                            {#if previewUrl}
                                <div
                                    class="relative flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                                >
                                    <img
                                        src={previewUrl}
                                        alt="Logo preview"
                                        class="h-24 w-24 rounded-lg object-cover border border-zinc-200"
                                    />
                                    <p
                                        class="text-xs text-zinc-400 text-center break-all"
                                    >
                                        {logoUrl}
                                    </p>
                                    <button
                                        type="button"
                                        onclick={removeImage}
                                        class="absolute right-2 top-2 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition"
                                    >
                                        <XIcon class="h-4 w-4" />
                                    </button>
                                </div>
                            {:else}
                                <label
                                    class="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 transition
                                        {isDragging
                                        ? 'border-orange-400 bg-orange-50'
                                        : 'border-zinc-200 bg-zinc-50 hover:border-orange-300 hover:bg-orange-50/50'}"
                                    ondragover={(e) => {
                                        e.preventDefault();
                                        isDragging = true;
                                    }}
                                    ondragleave={() => (isDragging = false)}
                                    ondrop={onDrop}
                                >
                                    {#if isUploading}
                                        <div
                                            class="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"
                                        ></div>
                                        <p class="text-sm text-zinc-500">
                                            Uploading...
                                        </p>
                                    {:else}
                                        <div
                                            class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100"
                                        >
                                            <UploadCloudIcon
                                                class="h-5 w-5 text-orange-500"
                                            />
                                        </div>
                                        <p
                                            class="text-sm text-center text-zinc-600"
                                        >
                                            <span
                                                class="font-medium text-orange-500"
                                                >Click to upload</span
                                            >
                                            <br />or drag and drop
                                        </p>
                                        <p class="text-xs text-zinc-400">
                                            PNG, JPG, SVG (max. 10MB)
                                        </p>
                                    {/if}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        class="hidden"
                                        onchange={onFileInput}
                                        disabled={isUploading}
                                    />
                                </label>
                            {/if}

                            {#if uploadError}
                                <p class="text-xs text-red-500">
                                    {uploadError}
                                </p>
                            {/if}

                            <!-- Manual URL input -->
                            <div class="flex flex-col gap-1.5">
                                <Label
                                    for="logoUrlDisplay"
                                    class="text-sm font-medium text-zinc-900"
                                >
                                    Or paste URL
                                </Label>
                                <div class="relative flex items-center">
                                    <LinkIcon
                                        class="absolute left-3 h-4 w-4 text-zinc-400"
                                    />
                                    <Input
                                        id="logoUrlDisplay"
                                        bind:value={logoUrl}
                                        placeholder="https://..."
                                        class="pl-9 border-zinc-200 focus-visible:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                </div>
            </div>
        </form>
    </div>
{/if}
