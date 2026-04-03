<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import {
        ArrowRightIcon,
        SearchIcon,
        UsersIcon,
        UserStarIcon,
        BuildingIcon,
        CalendarIcon,
        LayersIcon,
    } from "lucide-svelte";
    import SemesterDropDown from "../../lecturer/class/components/SemesterDropDown.svelte";
    import type { PageData } from "./$types";
    import type { Semester } from "$lib/types/semester";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    let { data } = $props<{ data: PageData }>();
    let searchQuery = $state(page.url.searchParams.get("Keyword") ?? "");

    const semesters = $derived(data.semesters as Semester[]);
    const groups = $derived(data.groups as any[]);
    const totalCount = $derived(data.totalCount as number);

    let selectedSemesterId = $state(
        page.url.searchParams.get("semesterId") ??
            String(data.defaultSemesterId ?? ""),
    );
    let debounceTimer: ReturnType<typeof setTimeout>;

    function updateURL() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const params = new URLSearchParams();
            if (searchQuery) params.set("Keyword", searchQuery);
            if (selectedSemesterId)
                params.set("semesterId", selectedSemesterId);
            goto(`?${params.toString()}`, {
                replaceState: true,
                keepFocus: true,
                noScroll: true,
            });
        }, 300);
    }

    $effect(() => {
        searchQuery;
        selectedSemesterId;
        updateURL();
    });

    const statusConfig: Record<string, { class: string; dot: string }> = {
        Draft: {
            class: "bg-stone-100 text-stone-500 border border-stone-200",
            dot: "bg-stone-400",
        },
        Pending: {
            class: "bg-amber-50 text-amber-600 border border-amber-200",
            dot: "bg-amber-400",
        },
        Approved: {
            class: "bg-emerald-50 text-emerald-600 border border-emerald-200",
            dot: "bg-emerald-400",
        },
        Active: {
            class: "bg-emerald-50 text-emerald-600 border border-emerald-200",
            dot: "bg-emerald-400",
        },
        Rejected: {
            class: "bg-red-50 text-red-500 border border-red-200",
            dot: "bg-red-400",
        },
        Completed: {
            class: "bg-blue-50 text-blue-600 border border-blue-200",
            dot: "bg-blue-400",
        },
    };
</script>

<div class="min-h-screen bg-white">
    <main class="px-6 sm:px-10 lg:px-16 py-10">
        <!-- Page Header -->
        <div
            class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
            <div>
                <p
                    class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1"
                >
                    Mentor Portal
                </p>
                <h1
                    class="text-3xl font-extrabold text-stone-900 leading-tight"
                >
                    My Groups
                </h1>
                <p class="text-base text-stone-400 mt-1">
                    Manage and track your assigned student groups
                </p>
            </div>

            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-3">
                <div class="relative">
                    <SearchIcon
                        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                    />
                    <Input
                        id="search"
                        placeholder="Search group name..."
                        class="pl-9 w-full sm:w-72 bg-stone-50 border-stone-200 focus:bg-white focus:border-amber-400 transition-colors text-sm rounded-lg"
                        bind:value={searchQuery}
                    />
                </div>
                <SemesterDropDown {semesters} bind:selectedSemesterId />
            </div>
        </div>

        <!-- Stats bar -->
        <div class="flex items-center gap-3 mb-8">
            <div
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-100"
            >
                <span class="text-sm text-stone-400 font-medium">Total</span>
                <span class="text-base font-extrabold text-stone-800"
                    >{totalCount}</span
                >
                <span class="text-sm text-stone-400">groups</span>
            </div>
        </div>

        <!-- Groups Grid -->
        {#if groups.length === 0}
            <div
                class="flex flex-col items-center justify-center py-24 text-center"
            >
                <div
                    class="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-4"
                >
                    <UsersIcon class="w-6 h-6 text-stone-300" />
                </div>
                <p class="text-lg font-semibold text-stone-400">
                    No groups found
                </p>
                <p class="text-sm text-stone-300 mt-1">
                    Try adjusting your search or semester filter
                </p>
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each groups as group}
                    {@const cfg = statusConfig[group.status] ?? {
                        class: "bg-stone-100 text-stone-500 border border-stone-200",
                        dot: "bg-stone-400",
                    }}
                    {@const fillPct = Math.min(
                        100,
                        Math.round((group.memberCount / group.maxMember) * 100),
                    )}
                    {@const isFull = group.memberCount >= group.maxMember}

                    <div
                        class="group/card relative flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-200"
                    >
                        <div
                            class="h-0.5 w-full bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
                        ></div>

                        <div class="p-6 flex flex-col flex-1">
                            <!-- Header -->
                            <div
                                class="flex items-start justify-between gap-3 mb-6"
                            >
                                <h3
                                    class="font-bold text-stone-900 text-lg leading-snug line-clamp-2 flex-1"
                                >
                                    {group.name}
                                </h3>
                                <span
                                    class="inline-flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full text-xs font-semibold {cfg.class}"
                                >
                                    <span
                                        class="w-1.5 h-1.5 rounded-full {cfg.dot}"
                                    ></span>
                                    {group.status}
                                </span>
                            </div>

                            <!-- Info rows -->
                            <div class="flex flex-col gap-3 flex-1">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"
                                    >
                                        <UserStarIcon
                                            class="w-4 h-4 text-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <p
                                            class="text-xs text-stone-400 leading-none mb-0.5"
                                        >
                                            Leader
                                        </p>
                                        <p
                                            class="text-base font-semibold text-stone-700"
                                        >
                                            {group.leaderName}
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"
                                    >
                                        <LayersIcon
                                            class="w-4 h-4 text-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <p
                                            class="text-xs text-stone-400 leading-none mb-0.5"
                                        >
                                            Class
                                        </p>
                                        <p
                                            class="text-base font-semibold text-stone-700"
                                        >
                                            {group.className}
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"
                                    >
                                        <CalendarIcon
                                            class="w-4 h-4 text-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <p
                                            class="text-xs text-stone-400 leading-none mb-0.5"
                                        >
                                            Semester
                                        </p>
                                        <p
                                            class="text-base font-semibold text-stone-700"
                                        >
                                            {group.semesterName}
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"
                                    >
                                        <BuildingIcon
                                            class="w-4 h-4 text-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <p
                                            class="text-xs text-stone-400 leading-none mb-0.5"
                                        >
                                            Campus
                                        </p>
                                        <p
                                            class="text-base font-semibold text-stone-700"
                                        >
                                            {group.campusName}
                                        </p>
                                    </div>
                                </div>

                                <!-- Members progress -->
                                <div class="mt-1">
                                    <div
                                        class="flex items-center justify-between mb-1.5"
                                    >
                                        <div class="flex items-center gap-1.5">
                                            <UsersIcon
                                                class="w-3.5 h-3.5 text-stone-400"
                                            />
                                            <span
                                                class="text-xs text-stone-500 font-medium"
                                            >
                                                {group.memberCount}<span
                                                    class="text-stone-300 mx-0.5"
                                                    >/</span
                                                >{group.maxMember} members
                                            </span>
                                        </div>
                                        <span
                                            class="text-xs font-bold {isFull
                                                ? 'text-red-400'
                                                : 'text-stone-400'}"
                                        >
                                            {isFull ? "Full" : `${fillPct}%`}
                                        </span>
                                    </div>
                                    <div
                                        class="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden"
                                    >
                                        <div
                                            class="h-full rounded-full transition-all duration-500 {isFull
                                                ? 'bg-red-400'
                                                : 'bg-amber-400'}"
                                            style="width: {fillPct}%"
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div class="mt-6 pt-4 border-t border-stone-100">
                                <a
                                    href="/app/mentor/groups/{group.id}"
                                    class="flex items-center justify-between w-full group/link"
                                >
                                    <span
                                        class="text-base font-semibold text-amber-500 group-hover/link:text-amber-600 transition-colors"
                                    >
                                        Manage Group
                                    </span>
                                    <div
                                        class="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 group-hover/link:bg-amber-100 transition-colors"
                                    >
                                        <ArrowRightIcon
                                            class="w-4 h-4 text-amber-500 group-hover/link:translate-x-0.5 transition-transform duration-150"
                                        />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </main>
</div>
