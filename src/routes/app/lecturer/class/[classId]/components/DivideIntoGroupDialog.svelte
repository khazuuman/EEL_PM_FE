<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Button } from "$lib/components/ui/button";
    import Label from "$lib/components/ui/label/label.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";

    type Props = {
        open: boolean;
        classId: string;
        totalStudent: number;
        onClose: () => void;
    };

    let {
        open = $bindable(),
        classId,
        totalStudent,
        onClose,
    }: Props = $props();

    let groupCount = $state<number | "">("");

    const isFormValid = $derived(!!groupCount);

    function resetForm() {
        groupCount = "";
    }
</script>

<Dialog.Root
    bind:open
    onOpenChange={(v) => {
        if (!v) {
            resetForm();
            onClose();
        }
    }}
>
    <Dialog.Content class="sm:max-w-[400px]">
        <Dialog.Header>
            <Dialog.Title>Grouping</Dialog.Title>
            <Dialog.Description>
                Configure group allocation settings for this class.
            </Dialog.Description>
        </Dialog.Header>

        <form
            method="POST"
            action="?/autoAllocate"
            use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === "success") {
                        toast.success(
                            String(
                                (result.data as any)?.message ??
                                    "Grouping activated successfully!",
                            ),
                        );
                        resetForm();
                        await invalidateAll();
                        open = false;
                    } else if (result.type === "failure") {
                        toast.error(
                            String(
                                (result.data as any)?.message ??
                                    "Failed to activate grouping.",
                            ),
                        );
                    } else {
                        toast.error("An unexpected error occurred.");
                    }
                };
            }}
        >
            <div class="grid gap-4 py-4">
                <input type="hidden" value={classId} name="classId" />

                <!-- Total Students info -->
                <div
                    class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                    <span class="text-sm text-gray-500">Total Students</span>
                    <span class="text-sm font-bold text-gray-900"
                        >{totalStudent}</span
                    >
                </div>

                <div class="grid gap-2">
                    <Label for="groupCount">Number of Groups</Label>
                    <Input
                        id="groupCount"
                        name="groupCount"
                        type="number"
                        min="2"
                        placeholder="e.g. 5"
                        bind:value={groupCount}
                        class="border-zinc-300"
                        required
                    />
                    <!-- Gợi ý số người mỗi nhóm -->
                    <!-- {#if totalStudent > 0}
                        <p class="text-xs text-gray-400">
                            ~{Math.ceil(totalStudent / Number(groupCount))} students
                            per group
                        </p>
                    {/if} -->
                </div>
            </div>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (open = false)}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    class="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={!isFormValid}
                >
                    Confirm
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
