<script lang="ts">
    import type { LayoutData } from "../$types";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import { GraduationCapIcon } from "lucide-svelte";
    import NavUser from "./components/nav-user.svelte";
    import { goto } from "$app/navigation";
    let { data, children } = $props<{ data: LayoutData; children: any }>();
</script>

<header
    class="px-5 py-2 flex flex-row w-full justify-between items-center gap-10 bg-white border border-amber-600 fixed z-50"
>
    <div class="w-full bg-white z-100">
        <div class="flex gap-5">
            <GraduationCapIcon
                color="#f2a20d"
                class="w-8 h-8 cursor-pointer"
                onclick={() => goto("/app")}
            />
            <div class="text-lg font-bold flex justify-center items-center">
                <h1>EXE</h1>
                <span class="mx-2 h-0.75 w-2.5 bg-black"></span>
                <h1>FPT University Portal</h1>
            </div>
        </div>
    </div>
    <div class="flex flex-row w-160">
        <span
            class="w-90 flex flex-row justify-center items-center text-[18px] text-stone-600 font-bold"
            >{data.user.student?.classCode
                ? `Class: ${data.user.student?.classCode}`
                : ""}</span
        >
        <Separator orientation="vertical" class="bg-amber-500 mx-4" />
        <NavUser user={data.user} />
    </div>
</header>
<div class="w-full min-h-screen bg-stone-100 overflow-x-hidden">
    {@render children()}
</div>

