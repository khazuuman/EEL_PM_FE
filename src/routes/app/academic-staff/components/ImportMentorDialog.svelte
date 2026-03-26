<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Button } from "$lib/components/ui/button";
    import { FileSpreadsheetIcon, InfoIcon, UploadIcon } from "@lucide/svelte";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";

    type Props = {
        open: boolean;
        onOpenChange: (v: boolean) => void;
    };

    let { open, onOpenChange }: Props = $props();

    let file = $state<File | null>(null);
    let fileInputRef = $state<HTMLInputElement | null>(null);
    let loading = $state(false);
    let fileError = $state("");

    const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];

    function validateFile(f: File | null): string {
        if (!f) return "Please select an Excel file.";
        const valid = ACCEPTED_EXTENSIONS.some((ext) =>
            f.name.toLowerCase().endsWith(ext),
        );
        return valid ? "" : "Only .xlsx or .xls files are accepted.";
    }

    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const selected = input.files?.[0] ?? null;
        file = selected;
        fileError = validateFile(selected);
    }

    function resetForm() {
        file = null;
        fileError = "";
        if (fileInputRef) fileInputRef.value = "";
    }

    async function handleImport() {
        fileError = validateFile(file);
        if (fileError || !file) return;

        loading = true;
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("?/importMentorData", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            if (result?.type === "failure") {
                toast.error(result?.data?.message ?? "Import failed!");
                return;
            }

            toast.success("Import successfully!");
            await invalidateAll();
            resetForm();
            onOpenChange(false);
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            loading = false;
        }
    }
</script>

<Dialog.Root
    {open}
    onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
    }}
>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>Import Mentors</Dialog.Title>
            <Dialog.Description>
                Upload an Excel file to import mentor data into the system.
            </Dialog.Description>
        </Dialog.Header>

        <div class="flex flex-col gap-5 py-2">
            <!-- File input -->
            <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">
                    Excel File <span class="text-destructive">*</span>
                </label>

                <div
                    class={[
                        "flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/50",
                        fileError ? "border-destructive" : "border-input",
                    ].join(" ")}
                    role="button"
                    tabindex="0"
                    onclick={() => fileInputRef?.click()}
                    onkeydown={(e) =>
                        e.key === "Enter" && fileInputRef?.click()}
                >
                    <FileSpreadsheetIcon
                        class="text-muted-foreground size-5 shrink-0"
                    />
                    <span
                        class={[
                            "text-sm truncate",
                            !file ? "text-muted-foreground" : "",
                        ].join(" ")}
                    >
                        {file
                            ? file.name
                            : "Click to choose file (.xlsx, .xls)"}
                    </span>
                </div>

                <input
                    bind:this={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    class="hidden"
                    onchange={handleFileChange}
                />

                {#if fileError}
                    <p class="text-destructive text-xs">{fileError}</p>
                {/if}
            </div>

            <!-- Ghi chú -->
            <div
                class="bg-muted/60 flex items-start gap-2 rounded-md px-3 py-2.5"
            >
                <InfoIcon
                    class="text-muted-foreground mt-0.5 size-4 shrink-0"
                />
                <p class="text-muted-foreground text-xs leading-relaxed">
                    Please ensure the Excel file follows the required column
                    format before importing.
                </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => {
                        resetForm();
                        onOpenChange(false);
                    }}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    disabled={loading || !!fileError || !file}
                    onclick={handleImport}
                >
                    {#if loading}
                        <span class="animate-spin mr-2">⏳</span>
                        Importing...
                    {:else}
                        <UploadIcon class="size-4" />
                        Import
                    {/if}
                </Button>
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>
