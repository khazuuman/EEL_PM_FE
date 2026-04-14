<script lang="ts">
    import { GraduationCapIcon } from "lucide-svelte";

    let { children } = $props();
</script>

<div class="flex flex-col h-screen">
    <header class="w-full border-b border-stone-300 p-4 bg-white">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-3 shrink-0">
            <button
                class="flex items-center gap-2.5 group"
                aria-label="Go to home"
            >
                <div
                    class="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors duration-150"
                >
                    <GraduationCapIcon class="w-5 h-5 text-amber-500" />
                </div>
                <div
                    class="flex items-center gap-1.5 text-md font-semibold text-stone-800 tracking-tight"
                >
                    <span class="text-amber-500 font-bold text-base">EELPM</span>
                    <span
                        class="w-1 h-1 rounded-full bg-stone-300 hidden sm:block"
                    ></span>
                    <span class="hidden sm:block text-stone-600 font-medium"
                        >FPT</span
                    >
                </div>
            </button>
        </div>
    </header>

    <main
        class="flex-1 flex h-full w-screen justify-center items-center bg-stone-100"
    >
        {@render children()}
    </main>
</div>
