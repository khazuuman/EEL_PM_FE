<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { enhance } from "$app/forms";
    import { RefreshCwIcon } from "lucide-svelte";

    type Props = {
        open: boolean;
        onOpenChange: (v: boolean) => void;
    };

    let { open, onOpenChange }: Props = $props();

    let exe1Code = $state("");
    let exe2Code = $state("");
    let loading = $state(false);
    let errorMessage = $state("");
</script>

<Dialog.Root {open} {onOpenChange}>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>Sync Academic Data</Dialog.Title>
            <Dialog.Description>
                Enter the subject codes to synchronize all data from the
                external API. This process may take <strong>30s – 1 minutes</strong>
                — please do not close this page.
            </Dialog.Description>
        </Dialog.Header>

        <form
            method="POST"
            action="?/syncData"
            use:enhance={() => {
                loading = true;
                errorMessage = "";
                return async ({ result, update }) => {
                    loading = false;
                    if (result.type === "failure") {
                        errorMessage =
                            String(result.data?.message ?? "Failed to sync data.");
                    } else if (result.type === "success") {
                        exe1Code = "";
                        exe2Code = "";
                        onOpenChange(false);
                        await update();
                    }
                };
            }}
        >
            <div class="flex flex-col gap-4 py-4">
                <div class="flex flex-col gap-1.5">
                    <Label for="exe1Code">EXE01 Subject Code</Label>
                    <Input
                        id="exe1Code"
                        name="exe1Code"
                        placeholder="e.g. EXE101"
                        bind:value={exe1Code}
                        disabled={loading}
                        required
                    />
                </div>
                <div class="flex flex-col gap-1.5">
                    <Label for="exe2Code">EXE02 Subject Code</Label>
                    <Input
                        id="exe2Code"
                        name="exe2Code"
                        placeholder="e.g. EXE201"
                        bind:value={exe2Code}
                        disabled={loading}
                        required
                    />
                </div>

                {#if errorMessage}
                    <p class="text-sm text-destructive">{errorMessage}</p>
                {/if}
            </div>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => onOpenChange(false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} class="gap-2">
                    <RefreshCwIcon
                        size={16}
                        class={loading ? "animate-spin" : ""}
                    />
                    {loading ? "Syncing..." : "Sync"}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
