<script lang="ts">
    import { GraduationCapIcon } from "lucide-svelte";

    let { children } = $props();
</script>

<div class="flex flex-col h-screen">
    <header class="w-full border-b border-stone-300 p-4 bg-white">
        <div class="flex gap-5">
            <GraduationCapIcon color="#f2a20d" class="w-8 h-8" />
            <div class="text-lg font-bold flex justify-center items-center">
                <h1>EELPM</h1>
                <span class="mx-2 h-0.75 w-2.5 bg-black"></span>
                <h1>FPT University Portal</h1>
            </div>
        </div>
    </header>

    <main
        class="flex-1 flex h-full w-screen justify-center items-center bg-stone-100"
    >
        {@render children()}
    </main>
</div>
