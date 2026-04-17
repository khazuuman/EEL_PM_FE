<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import {
        SearchIcon,
        UsersIcon,
        ArrowRightIcon,
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
        <div class="flex items-center gap-3 mb-6">
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

        <!-- Table -->
        {#if groups.length === 0}
            <div
                class="flex flex-col items-center justify-center py-24 text-center border border-stone-100 rounded-2xl"
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
            <div class="rounded-2xl border border-stone-200 overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-stone-50 border-b border-stone-200">
                            <th
                                class="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider w-12"
                            >
                                #
                            </th>
                            <th
                                class="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider"
                            >
                                <div class="flex items-center gap-1.5">
                                    <UsersIcon class="w-3.5 h-3.5" />
                                    Group
                                </div>
                            </th>
                            <th
                                class="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider"
                            >
                                <div class="flex items-center gap-1.5">
                                    <UserStarIcon class="w-3.5 h-3.5" />
                                    Leader
                                </div>
                            </th>
                            <th
                                class="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider"
                            >
                                <div class="flex items-center gap-1.5">
                                    <LayersIcon class="w-3.5 h-3.5" />
                                    Class
                                </div>
                            </th>
                            <th
                                class="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider"
                            >
                                <div class="flex items-center gap-1.5">
                                    <CalendarIcon class="w-3.5 h-3.5" />
                                    Semester
                                </div>
                            </th>
                            <th
                                class="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider"
                            >
                                <div class="flex items-center gap-1.5">
                                    <BuildingIcon class="w-3.5 h-3.5" />
                                    Campus
                                </div>
                            </th>
                            <th
                                class="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider"
                            >
                                <div class="flex items-center gap-1.5">
                                    <UsersIcon class="w-3.5 h-3.5" />
                                    Members
                                </div>
                            </th>
                            <th
                                class="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider"
                            >
                                Status
                            </th>
                            <th class="px-5 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-100">
                        {#each groups as group, i}
                            {@const cfg = statusConfig[group.status] ?? {
                                class: "bg-stone-100 text-stone-500 border border-stone-200",
                                dot: "bg-stone-400",
                            }}
                            {@const fillPct = Math.min(
                                100,
                                Math.round(
                                    (group.memberCount / group.maxMember) * 100,
                                ),
                            )}
                            {@const isFull =
                                group.memberCount >= group.maxMember}

                            <tr
                                class="bg-white hover:bg-amber-50/40 transition-colors duration-100 group/row"
                            >
                                <!-- Index -->
                                <td class="px-5 py-4">
                                    <span
                                        class="text-sm font-medium text-stone-400 tabular-nums"
                                    >
                                        {i + 1}
                                    </span>
                                </td>
                                <!-- Group Name -->
                                <td class="px-5 py-4">
                                    <p
                                        class="font-semibold text-stone-900 truncate max-w-[180px]"
                                    >
                                        {group.name}
                                    </p>
                                </td>

                                <!-- Leader -->
                                <td class="px-5 py-4">
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0"
                                        >
                                            {group.leaderName?.charAt(0) ?? "?"}
                                        </div>
                                        <span
                                            class="text-stone-700 font-medium truncate max-w-[140px]"
                                        >
                                            {group.leaderName ?? "—"}
                                        </span>
                                    </div>
                                </td>

                                <!-- Class -->
                                <td class="px-5 py-4">
                                    <span
                                        class="text-stone-600 truncate max-w-[120px] block"
                                    >
                                        {group.className ?? "—"}
                                    </span>
                                </td>

                                <!-- Semester -->
                                <td class="px-5 py-4">
                                    <span
                                        class="text-stone-600 truncate max-w-[120px] block"
                                    >
                                        {group.semesterName ?? "—"}
                                    </span>
                                </td>

                                <!-- Campus -->
                                <td class="px-5 py-4">
                                    <span
                                        class="text-stone-600 truncate max-w-[100px] block"
                                    >
                                        {group.campusName ?? "—"}
                                    </span>
                                </td>

                                <!-- Members + Progress -->
                                <td class="px-5 py-4">
                                    <div
                                        class="flex flex-col gap-1 min-w-[90px]"
                                    >
                                        <div
                                            class="flex items-center justify-between"
                                        >
                                            <span
                                                class="text-xs text-stone-500 font-medium tabular-nums"
                                            >
                                                {group.memberCount}<span
                                                    class="text-stone-300 mx-0.5"
                                                    >/</span
                                                >{group.maxMember}
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
                                </td>

                                <!-- Status -->
                                <td class="px-5 py-4">
                                    <span
                                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold {cfg.class}"
                                    >
                                        <span
                                            class="w-1.5 h-1.5 rounded-full {cfg.dot}"
                                        ></span>
                                        {group.status}
                                    </span>
                                </td>

                                <!-- Action -->
                                <td class="px-5 py-4">
                                    <a
                                        href="/app/mentor/groups/{group.id}"
                                        class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors whitespace-nowrap"
                                    >
                                        View
                                        <ArrowRightIcon
                                            class="w-3.5 h-3.5 group-hover/row:translate-x-0.5 transition-transform duration-150"
                                        />
                                    </a>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </main>
</div>
