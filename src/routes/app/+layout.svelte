<script lang="ts">
    import type { LayoutData } from "../$types";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import { GraduationCapIcon, MenuIcon, XIcon } from "lucide-svelte";
    import NavUser from "./components/nav-user.svelte";
    import { goto } from "$app/navigation";
    import ChatWidget from "$lib/components/chat/ChatWidget.svelte";
    import { page } from "$app/stores";
    import * as Tooltip from "$lib/components/ui/tooltip/index";
    import { setHeaderCtx } from "$lib/contexts/header.context.svelte";

    let { data, children } = $props<{ data: LayoutData; children: any }>();

    const user = $page.data.user;
    const token = $page.data.accessToken;
    const headerCtx = setHeaderCtx();
</script>

<div class="overflow-y-hidden">
    <header
        class="px-4 md:px-6 h-16 flex items-center justify-between w-full bg-white border-b border-amber-400/60 fixed top-0 left-0 right-0 z-50 shadow-sm"
    >
        <!-- Logo & Brand -->
        <div class="flex items-center gap-3 shrink-0">
            <button
                onclick={() => goto("/app")}
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

        {#if headerCtx.subtitle}
            <div
                class="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200"
            >
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                <span
                    class="text-sm font-semibold text-amber-700 tracking-wide uppercase"
                >
                    {headerCtx.subtitle}
                </span>
            </div>
        {:else if data.user.student?.classCode}
            <div
                class="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200"
            >
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                <span
                    class="text-sm font-semibold text-amber-700 tracking-wide uppercase"
                >
                    {data.user.student.classCode}
                </span>
            </div>
        {/if}

        <!-- Right: NavUser (desktop) + mobile toggle -->
        <div class="flex items-center gap-3">
            <!-- Class code pill on mobile -->
            {#if data.user.student?.classCode}
                <div
                    class="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200"
                >
                    <span class="text-xs font-semibold text-amber-700">
                        {data.user.student.classCode}
                    </span>
                </div>
            {/if}

            <!-- Separator (desktop) -->
            <Separator
                orientation="vertical"
                class="hidden md:block h-6 bg-stone-200 mx-1"
            />

            <!-- NavUser -->
            <NavUser user={data.user} />
        </div>
    </header>

    <!-- Spacer to offset fixed header -->
    <div class="h-16"></div>

    <Tooltip.Provider>
        <div class="w-full bg-stone-100 overflow-hidden">
            {@render children()}
        </div>
        {#if user}
            {#if user?.roles.includes("Student") && user?.student?.group !== null}
                <ChatWidget
                    groupId={user.student.group.groupId}
                    {token}
                    userId={user.userId}
                    {user}
                />
            {/if}
        {/if}
    </Tooltip.Provider>
</div>
