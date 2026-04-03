<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import {
        ArrowRightIcon,
        BookUserIcon,
        CalendarIcon,
        MapPinIcon,
        SearchIcon,
    } from "lucide-svelte";
    import SemesterDropDown from "./components/SemesterDropDown.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import type { PageData } from "./$types";
    import type { ClassDetail } from "$lib/types/class";
    import type { Semester } from "$lib/types/semester";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    let { data } = $props<{ data: PageData }>();
    let searchQuery = $state(page.url.searchParams.get("search") ?? "");

    const semesters = $derived(data.semesters as Semester[]);
    const classes = $derived(data.classes as ClassDetail[]);
    let selectedSemesterId = $state(
        page.url.searchParams.get("semesterId") ??
            String(data.defaultSemesterId ?? ""),
    );
    let debounceTimer: ReturnType<typeof setTimeout>;

    function updateURL() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const params = new URLSearchParams();
            if (searchQuery) params.set("searchNameAndCode", searchQuery);
            if (selectedSemesterId) params.set("semesterId", selectedSemesterId);
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
        Active:    { class: "bg-emerald-50 text-emerald-600 border border-emerald-200", dot: "bg-emerald-400" },
        Inactive:  { class: "bg-stone-100 text-stone-500 border border-stone-200",      dot: "bg-stone-400" },
        Pending:   { class: "bg-amber-50 text-amber-600 border border-amber-200",        dot: "bg-amber-400" },
        Completed: { class: "bg-blue-50 text-blue-600 border border-blue-200",           dot: "bg-blue-400" },
    };
</script>

<div class="min-h-screen bg-white">
    <main class="px-6 sm:px-10 lg:px-16 py-10">

        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
                <p class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Lecturer Portal</p>
                <h1 class="text-3xl font-extrabold text-stone-900 leading-tight">My Classes</h1>
                <p class="text-base text-stone-400 mt-1">Select a class to manage students and grades</p>
            </div>

            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-3">
                <div class="relative">
                    <SearchIcon class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <Input
                        id="search"
                        placeholder="Search class code or name..."
                        class="pl-9 w-full sm:w-72 bg-stone-50 border-stone-200 focus:bg-white focus:border-amber-400 transition-colors text-sm rounded-lg"
                        bind:value={searchQuery}
                    />
                </div>
                <SemesterDropDown {semesters} bind:selectedSemesterId />
            </div>
        </div>

        <!-- Stats bar -->
        <div class="flex items-center gap-3 mb-8">
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-100">
                <span class="text-sm text-stone-400 font-medium">Total</span>
                <span class="text-base font-extrabold text-stone-800">{classes.length}</span>
                <span class="text-sm text-stone-400">classes</span>
            </div>
        </div>

        <!-- Class Grid -->
        {#if classes.length === 0}
            <div class="flex flex-col items-center justify-center py-24 text-center">
                <div class="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-4">
                    <BookUserIcon class="w-6 h-6 text-stone-300" />
                </div>
                <p class="text-lg font-semibold text-stone-400">No classes found</p>
                <p class="text-sm text-stone-300 mt-1">Try adjusting your search or semester filter</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each classes as classCard}
                    {@const cfg = statusConfig[classCard.status] ?? { class: "bg-stone-100 text-stone-500 border border-stone-200", dot: "bg-stone-400" }}
                    <div class="group relative flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-200">

                        <div class="h-0.5 w-full bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                        <div class="p-6 flex flex-col flex-1">
                            <!-- Header -->
                            <div class="flex items-start justify-between gap-3 mb-6">
                                <h3 class="font-bold text-stone-900 text-lg leading-snug line-clamp-2 flex-1">
                                    {classCard.className}
                                </h3>
                                <span class="inline-flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full text-xs font-semibold {cfg.class}">
                                    <span class="w-1.5 h-1.5 rounded-full {cfg.dot}"></span>
                                    {classCard.status}
                                </span>
                            </div>

                            <!-- Info rows -->
                            <div class="flex flex-col gap-3 flex-1">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                        <BookUserIcon class="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-stone-400 leading-none mb-0.5">Class Code</p>
                                        <p class="text-base font-semibold text-stone-700">{classCard.classCode}</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                        <CalendarIcon class="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-stone-400 leading-none mb-0.5">Semester</p>
                                        <p class="text-base font-semibold text-stone-700">{classCard.semesterName}</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                        <MapPinIcon class="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-stone-400 leading-none mb-0.5">Campus</p>
                                        <p class="text-base font-semibold text-stone-700">{classCard.campusName}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div class="mt-6 pt-4 border-t border-stone-100">
                                <a
                                    href="/app/lecturer/class/{classCard.classId}"
                                    class="flex items-center justify-between w-full group/link"
                                >
                                    <span class="text-base font-semibold text-amber-500 group-hover/link:text-amber-600 transition-colors">
                                        Manage Class
                                    </span>
                                    <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 group-hover/link:bg-amber-100 transition-colors">
                                        <ArrowRightIcon class="w-4 h-4 text-amber-500 group-hover/link:translate-x-0.5 transition-transform duration-150" />
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