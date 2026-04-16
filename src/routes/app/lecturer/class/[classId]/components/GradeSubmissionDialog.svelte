<!-- src/lib/components/grade-submission-dialog.svelte -->
<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { StarIcon, Loader2Icon } from "lucide-svelte";

    type Props = {
        open: boolean;
        submissionId: number | string;
        assignmentTitle?: string;
        maxScore?: number;
        currentScore?: number | null;
        currentFeedback?: string | null;
        isGraded?: boolean;
        onclose?: () => void;
    };

    let {
        open = $bindable(),
        submissionId,
        assignmentTitle = "",
        maxScore = 10,
        currentScore = null,
        currentFeedback = null,
        isGraded = false,
        onclose,
    }: Props = $props();

    let grading = $state(false);
    let scoreInput = $state<string>(
        currentScore !== null && currentScore !== undefined
            ? String(currentScore)
            : ""
    );
    let feedbackInput = $state<string>(currentFeedback ?? "");

    // Sync lại khi dialog mở
    $effect(() => {
        if (open) {
            scoreInput = currentScore !== null && currentScore !== undefined
                ? String(currentScore)
                : "";
            feedbackInput = currentFeedback ?? "";
        }
    });
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <div class="flex items-center gap-3 mb-1">
                <div class="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <StarIcon class="w-4 h-4 text-amber-600" />
                </div>
                <div>
                    <Dialog.Title class="text-base font-bold text-stone-900">
                        {isGraded ? "Update Grade" : "Grade Submission"}
                    </Dialog.Title>
                    {#if assignmentTitle}
                        <Dialog.Description class="text-xs text-stone-400 mt-0.5">
                            {assignmentTitle}
                        </Dialog.Description>
                    {/if}
                </div>
            </div>
        </Dialog.Header>

        <form
            method="POST"
            action="?/gradeSubmission"
            use:enhance={() => {
                grading = true;
                return async ({ result }) => {
                    grading = false;
                    if (result.type === "success") {
                        toast.success("Submission graded successfully.");
                        open = false;
                        onclose?.();
                        await invalidateAll();
                    } else if (result.type === "failure") {
                        toast.error(
                            (result.data as any)?.message ?? "Failed to grade submission."
                        );
                    }
                };
            }}
            class="flex flex-col gap-5 mt-2"
        >
            <input type="hidden" name="submissionId" value={submissionId} />

            <!-- Score -->
            <div class="flex flex-col gap-2">
                <Label class="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Score <span class="text-red-500">*</span>
                </Label>
                <div class="relative">
                    <Input
                        name="score"
                        type="number"
                        min="0"
                        max={maxScore}
                        step="0.1"
                        bind:value={scoreInput}
                        required
                        placeholder="0.0"
                        class="border-stone-300 text-base pr-16"
                        oninvalid={(e) => {
                            const el = e.target as HTMLInputElement;
                            if (el.validity.valueMissing) el.setCustomValidity("Score is required.");
                            else if (el.validity.rangeOverflow) el.setCustomValidity(`Score cannot exceed ${maxScore}.`);
                            else if (el.validity.rangeUnderflow) el.setCustomValidity("Score must be at least 0.");
                            else el.setCustomValidity("");
                        }}
                        oninput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 pointer-events-none">
                        / {maxScore}
                    </span>
                </div>
                <p class="text-xs text-stone-400">Enter a value from 0 to {maxScore} (e.g. 7.5)</p>
            </div>

            <!-- Feedback -->
            <div class="flex flex-col gap-2">
                <Label class="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Feedback <span class="normal-case font-normal text-stone-400">(optional)</span>
                </Label>
                <Textarea
                    name="feedback"
                    bind:value={feedbackInput}
                    placeholder="Leave feedback for the student..."
                    rows={4}
                    class="border-stone-300 text-base resize-none"
                />
            </div>

            <Dialog.Footer class="gap-2 sm:gap-2">
                <Dialog.Close
                    type="button"
                    disabled={grading}
                    class="px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                    Cancel
                </Dialog.Close>
                <button
                    type="submit"
                    disabled={grading}
                    class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {#if grading}
                        <Loader2Icon class="w-4 h-4 animate-spin" />
                        Saving...
                    {:else}
                        <StarIcon class="w-4 h-4" />
                        {isGraded ? "Update Grade" : "Submit Grade"}
                    {/if}
                </button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>