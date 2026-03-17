<!-- ComingSoon.svelte -->
<script lang="ts">
    import { goto } from "$app/navigation";
    import { ArrowLeftIcon, WrenchIcon } from "lucide-svelte";

    let {
        title = "Feature Under Development",
        backPath = "/app",
    }: {
        title?: string;
        backPath?: string;
    } = $props();
</script>

<div
    class="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4"
>
    <!-- Icon -->
    <div
        class="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center"
    >
        <WrenchIcon class="w-12 h-12 text-amber-500 animate-bounce" />
    </div>

    <!-- Text -->
    <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold text-gray-800">{title}</h1>
        <p class="text-gray-500 max-w-sm">
            This feature is currently being developed. <br />
            Please check back later!
        </p>
    </div>

    <!-- Badge -->
    <span
        class="px-4 py-1.5 bg-amber-100 text-amber-600 text-sm font-medium rounded-full"
    >
        🚧 Coming Soon
    </span>

    <!-- Back button -->
    <button
        onclick={() => goto(backPath)}
        class="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
    >
        <ArrowLeftIcon class="w-4 h-4" />
        Go Back
    </button>
</div>
