<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { FileSpreadsheetIcon, InfoIcon, UploadIcon } from "@lucide/svelte";

    type Option = { label: string; value: string; variant?: string };

    type Props = {
        open: boolean;
        onOpenChange: (v: boolean) => void;
        semesters: Option[];
        campuses: Option[];
        onImport?: (data: {
            semesterId: string;
            campusId: string;
            file: File;
        }) => Promise<void>;
    };

    const { open, onOpenChange, semesters, campuses, onImport }: Props =
        $props();

    // Filter bỏ item "All" (value === "")
    let semesterOptions = $derived(semesters.filter((s) => s.value !== ""));
    let campusOptions = $derived(campuses.filter((c) => c.value !== ""));

    let selectedSemester = $state("");
    let selectedCampus = $state("");
    let selectedFile = $state<File | null>(null);
    let fileInputRef = $state<HTMLInputElement | null>(null);

    // Errors
    let errors = $state({
        semester: "",
        campus: "",
        file: "",
    });

    let isLoading = $state(false);

    const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];

    function validateFile(file: File | null): string {
        if (!file) return "Please select an Excel file.";
        const name = file.name.toLowerCase();
        const valid = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
        if (!valid) return "Only .xlsx or .xls files are accepted.";
        return "";
    }

    function validate(): boolean {
        errors.semester = selectedSemester ? "" : "Please choose a semester.";
        errors.campus = selectedCampus ? "" : "Please choose a campus.";
        errors.file = validateFile(selectedFile);
        return !errors.semester && !errors.campus && !errors.file;
    }

    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        selectedFile = file;
        errors.file = validateFile(file);
    }

    function handleClose() {
        // Reset state khi đóng
        selectedSemester = "";
        selectedCampus = "";
        selectedFile = null;
        errors = { semester: "", campus: "", file: "" };
        if (fileInputRef) fileInputRef.value = "";
        onOpenChange(false);
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!validate()) return;
        if (!selectedFile) return;

        isLoading = true;
        try {
            await onImport?.({
                semesterId: selectedSemester,
                campusId: selectedCampus,
                file: selectedFile,
            });
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
            <Dialog.Title>Import Students</Dialog.Title>
            <Dialog.Description>
                Upload an Excel file to import student data into the system.
            </Dialog.Description>
        </Dialog.Header>

        <form onsubmit={handleSubmit} class="flex flex-col gap-5 py-2">
            <!-- Semester -->
            <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">
                    Semester <span class="text-destructive">*</span>
                </label>
                <Select.Root
                    type="single"
                    value={selectedSemester}
                    onValueChange={(v) => {
                        selectedSemester = v;
                        errors.semester = v ? "" : "Please choose a semester.";
                    }}
                >
                    <Select.Trigger
                        class={[
                            "w-full",
                            errors.semester
                                ? "border-destructive focus:ring-destructive"
                                : "",
                        ].join(" ")}
                    >
                        {semesterOptions.find(
                            (s) => s.value === selectedSemester,
                        )?.label ?? "Choose semester..."}
                    </Select.Trigger>
                    <Select.Content>
                        {#each semesterOptions as s}
                            <Select.Item value={s.value}>{s.label}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
                {#if errors.semester}
                    <p class="text-destructive text-xs">{errors.semester}</p>
                {/if}
            </div>

            <!-- Campus -->
            <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">
                    Campus <span class="text-destructive">*</span>
                </label>
                <Select.Root
                    type="single"
                    value={selectedCampus}
                    onValueChange={(v) => {
                        selectedCampus = v;
                        errors.campus = v ? "" : "Please choose a campus.";
                    }}
                >
                    <Select.Trigger
                        class={[
                            "w-full",
                            errors.campus
                                ? "border-destructive focus:ring-destructive"
                                : "",
                        ].join(" ")}
                    >
                        {campusOptions.find((c) => c.value === selectedCampus)
                            ?.label ?? "Choose campus..."}
                    </Select.Trigger>
                    <Select.Content>
                        {#each campusOptions as c}
                            <Select.Item value={c.value}>{c.label}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
                {#if errors.campus}
                    <p class="text-destructive text-xs">{errors.campus}</p>
                {/if}
            </div>

            <!-- File input -->
            <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">
                    Excel File <span class="text-destructive">*</span>
                </label>

                <!-- Custom file button -->
                <div
                    class={[
                        "flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/50",
                        errors.file ? "border-destructive" : "border-input",
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
                            !selectedFile ? "text-muted-foreground" : "",
                        ].join(" ")}
                    >
                        {selectedFile
                            ? selectedFile.name
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

                {#if errors.file}
                    <p class="text-destructive text-xs">{errors.file}</p>
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
                    Sheet 1 of the Excel file must be named
                    <span class="text-foreground font-semibold"
                        >"Thông tin học vụ"</span
                    >. Please ensure the column headers match the required
                    format before importing.
                </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    onclick={handleClose}
                    disabled={isLoading}
                >
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
