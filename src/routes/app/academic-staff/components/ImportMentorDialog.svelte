<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { FileSpreadsheetIcon, InfoIcon, UploadIcon } from "@lucide/svelte";

    type Props = {
        open: boolean;
        onOpenChange: (v: boolean) => void;
        onImport?: (data: { file: File }) => Promise<void>;
    };

    const { open, onOpenChange, onImport }: Props = $props();

    let selectedFile = $state<File | null>(null);
    let fileInputRef = $state<HTMLInputElement | null>(null);
    let fileError = $state("");
    let isLoading = $state(false);

    const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];

    function validateFile(file: File | null): string {
        if (!file) return "Please select an Excel file.";
        const name = file.name.toLowerCase();
        const valid = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
        if (!valid) return "Only .xlsx or .xls files are accepted.";
        return "";
    }

    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        selectedFile = file;
        fileError = validateFile(file);
    }

    function handleClose() {
        selectedFile = null;
        fileError = "";
        if (fileInputRef) fileInputRef.value = "";
        onOpenChange(false);
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        fileError = validateFile(selectedFile);
        if (fileError || !selectedFile) return;

        isLoading = true;
        try {
            await onImport?.({ file: selectedFile });
            handleClose();
        } catch {
            // handle error từ bên ngoài nếu cần
        } finally {
            isLoading = false;
        }
    }
</script>

<Dialog.Root {open} {onOpenChange}>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>Import Mentors</Dialog.Title>
            <Dialog.Description>
                Upload an Excel file to import mentor data into the system.
            </Dialog.Description>
        </Dialog.Header>

        <form onsubmit={handleSubmit} class="flex flex-col gap-5 py-2">
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
                    onkeydown={(e) => e.key === "Enter" && fileInputRef?.click()}
                >
                    <FileSpreadsheetIcon class="text-muted-foreground size-5 shrink-0" />
                    <span class={["text-sm truncate", !selectedFile ? "text-muted-foreground" : ""].join(" ")}>
                        {selectedFile ? selectedFile.name : "Click to choose file (.xlsx, .xls)"}
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
            <div class="bg-muted/60 flex items-start gap-2 rounded-md px-3 py-2.5">
                <InfoIcon class="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <p class="text-muted-foreground text-xs leading-relaxed">
                    Sheet 1 of the Excel file must be named
                    <span class="text-foreground font-semibold">"Thông tin mentor"</span>.
                    Please ensure the column headers match the required format before importing.
                </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onclick={handleClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {#if isLoading}
                        <span class="animate-spin mr-2">⏳</span>
                        Importing...
                    {:else}
                        <UploadIcon class="size-4" />
                        Import
                    {/if}
                </Button>
            </div>
        </form>
    </Dialog.Content>
</Dialog.Root>
