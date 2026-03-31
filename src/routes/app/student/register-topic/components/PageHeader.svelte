<script lang="ts">
    import { Separator } from "$lib/components/ui/separator";
    import { ArrowLeftIcon } from "lucide-svelte";
    import type { Snippet } from "svelte";

    let {
        title,
        subtitle,
        onBack,
        actions,
    }: {
        title: string;
        subtitle?: string;
        onBack: () => void;
        actions?: Snippet;
    } = $props();
</script>

<div
    class="sticky top-0 z-10 border-b border-zinc-200 bg-white px-8 pb-5 pt-20"
>
    <div class="mx-auto flex max-w-5xl items-center justify-between">
        <div class="flex items-center gap-3">
            <button
                type="button"
                onclick={onBack}
                class="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
            >
                <ArrowLeftIcon class="h-4 w-4" />
                Back
            </button>
            <Separator orientation="vertical" class="h-5" />
            <div>
                <h1 class="text-base font-semibold text-zinc-900">{title}</h1>
                {#if subtitle}
                    <p class="text-xs text-zinc-400">{subtitle}</p>
                {/if}
            </div>
        </div>

        {#if actions}
            <div class="flex items-center gap-2">
                {@render actions()}
            </div>
        {/if}
    </div>
</div>
