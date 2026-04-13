<script lang="ts">
    import { deserialize } from "$app/forms";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Card from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { LinkIcon, UploadCloudIcon, XIcon } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    let {
        logoUrl = $bindable(""),
        previewUrl = $bindable(""),
    }: {
        logoUrl?: string;
        previewUrl?: string;
    } = $props();

    let isUploading = $state(false);
    let uploadError = $state("");
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

        const result = deserialize(await res.text()) as any;
        const url = result?.data?.result?.data;

        if (result?.type === "success" && url) {
            logoUrl = url;
            previewUrl = url;
            toast.success("Logo uploaded successfully", { id: toastId });
        } else {
            uploadError = result?.data?.message ?? "Failed to upload logo";
            toast.error(uploadError, { id: toastId });
        }

        isUploading = false;
    }

    function onFileInput(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
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

<Card.Root class="rounded-xl border border-zinc-200 shadow-sm">
    <Card.Header>
        <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Project Logo
        </p>
        <p class="mt-1 text-xs text-zinc-400">
            Optional — upload a logo for your project
        </p>
    </Card.Header>
    <Separator />
    <Card.Content class="flex flex-col gap-4 pt-5">
        {#if previewUrl}
            <div class="relative flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <img
                    src={previewUrl}
                    alt="Logo preview"
                    class="h-24 w-24 rounded-lg object-cover border border-zinc-200"
                />
                <p class="break-all text-center text-xs text-zinc-400">{logoUrl}</p>
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
                ondragover={(e) => { e.preventDefault(); isDragging = true; }}
                ondragleave={() => (isDragging = false)}
                ondrop={onDrop}
            >
                {#if isUploading}
                    <div class="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                    <p class="text-sm text-zinc-500">Uploading...</p>
                {:else}
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                        <UploadCloudIcon class="h-5 w-5 text-orange-500" />
                    </div>
                    <p class="text-center text-sm text-zinc-600">
                        <span class="font-medium text-orange-500">Click to upload</span>
                        <br />or drag and drop
                    </p>
                    <p class="text-xs text-zinc-400">PNG, JPG, SVG (max. 10MB)</p>
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
            <p class="text-xs text-red-500">{uploadError}</p>
        {/if}

        <div class="flex flex-col gap-1.5">
            <Label class="text-sm font-medium text-zinc-900">Or paste URL</Label>
            <div class="relative flex items-center">
                <LinkIcon class="absolute left-3 h-4 w-4 text-zinc-400" />
                <Input
                    bind:value={logoUrl}
                    placeholder="https://..."
                    class="pl-9 border-zinc-200 focus-visible:ring-orange-500"
                />
            </div>
        </div>
    </Card.Content>
</Card.Root>