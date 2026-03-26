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
        onClose: () => void;
    };

    let { open = $bindable(), classId, onClose }: Props = $props();

    let groupCount = $state<number | "">("");
    let memberCount = $state<number | "">("");
    let minMembers = $state<number | "">("");
    let maxMembers = $state<number | "">("");

    const memberError = $derived(
        minMembers !== "" &&
            maxMembers !== "" &&
            Number(minMembers) > Number(maxMembers)
            ? "Min members must be less than or equal to max members."
            : null,
    );

    const isFormValid = $derived(
        !!groupCount &&
            !!memberCount &&
            minMembers !== "" &&
            maxMembers !== "" &&
            !memberError,
    );

    function resetForm() {
        groupCount = "";
        memberCount = "";
        minMembers = "";
        maxMembers = "";
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
                </div>

                <div class="grid gap-2">
                    <Label for="memberCount">Members per Group</Label>
                    <Input
                        id="memberCount"
                        name="memberCount"
                        type="number"
                        min="1"
                        placeholder="e.g. 4"
                        bind:value={memberCount}
                        class="border-zinc-300"
                        required
                    />
                </div>

                <p class="text-[12px] text-zinc-500">
                    Set the allowed member range for each group.
                </p>

                <div class="grid grid-cols-2 gap-3">
                    <div class="grid gap-2">
                        <Label for="minMembers">Min Members</Label>
                        <Input
                            id="minMembers"
                            name="minMembers"
                            type="number"
                            min="1"
                            placeholder="e.g. 3"
                            bind:value={minMembers}
                            class={memberError
                                ? "border-red-400 focus-visible:ring-red-400"
                                : "border-zinc-300"}
                            required
                        />
                    </div>
                    <div class="grid gap-2">
                        <Label for="maxMembers">Max Members</Label>
                        <Input
                            id="maxMembers"
                            name="maxMembers"
                            type="number"
                            min="1"
                            placeholder="e.g. 5"
                            bind:value={maxMembers}
                            class={memberError
                                ? "border-red-400 focus-visible:ring-red-400"
                                : "border-zinc-300"}
                            required
                        />
                    </div>
                </div>

                {#if memberError}
                    <p class="text-xs text-red-500 -mt-2">{memberError}</p>
                {/if}
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
