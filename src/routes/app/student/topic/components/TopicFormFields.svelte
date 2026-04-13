<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator";
    import * as Card from "$lib/components/ui/card";

    let {
        title = "",
        description = "",
        objectives = "",
        errorMessage = "",
    }: {
        title?: string;
        description?: string;
        objectives?: string;
        errorMessage?: string;
    } = $props();
</script>

<Card.Root class="rounded-xl border border-zinc-200 shadow-sm">
    <Card.Header>
        <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Topic Information
        </p>
    </Card.Header>
    <Separator />
    <Card.Content class="flex flex-col gap-5 pt-5">
        <div class="flex flex-col gap-1.5">
            <Label for="title" class="text-sm font-medium text-zinc-900">
                Topic Title
            </Label>
            <Input
                id="title"
                name="title"
                value={title}
                placeholder="e.g., E-commerce Management System"
                required
                class="border-zinc-200 focus-visible:ring-orange-500"
            />
            <p class="text-xs text-zinc-400">
                Provide a clear, concise title for your project.
            </p>
        </div>

        <div class="flex flex-col gap-1.5">
            <Label for="description" class="text-sm font-medium text-zinc-900">
                Description
            </Label>
            <Textarea
                id="description"
                name="description"
                value={description}
                placeholder="Briefly describe your project..."
                required
                class="min-h-[120px] resize-y border-zinc-200 focus-visible:ring-orange-500"
            />
        </div>

        <div class="flex flex-col gap-1.5">
            <Label for="objectives" class="text-sm font-medium text-zinc-900">
                Objectives
            </Label>
            <Textarea
                id="objectives"
                name="objectives"
                value={objectives}
                placeholder="What are the main goals of this project?"
                required
                class="min-h-[120px] resize-y border-zinc-200 focus-visible:ring-orange-500"
            />
        </div>
    </Card.Content>
</Card.Root>

{#if errorMessage}
    <p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500">
        {errorMessage}
    </p>
{/if}