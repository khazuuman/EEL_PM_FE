<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import {
        SearchIcon,
        BookUserIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
    } from "lucide-svelte";
    import SemesterDropDown from "./components/SemesterDropDown.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import type { PageData } from "./$types";
    import type { ClassDetail } from "$lib/types/class";
    import type { Semester } from "$lib/types/semester";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    let { data } = $props<{ data: PageData }>();
    let searchQuery = $state(
        page.url.searchParams.get("searchTerm") ?? "",
    );

    const semesters = $derived(data.semesters as Semester[]);
    const classes = $derived(data.classes as ClassDetail[]);

    let selectedSemesterId = $state(
        page.url.searchParams.get("semesterId") ??
            String(data.defaultSemesterId ?? ""),
    );
    let currentPage = $state(Number(page.url.searchParams.get("page") ?? 1));
    let limit = $state(Number(page.url.searchParams.get("limit") ?? 10));

    const totalCount = $derived(data.totalCount ?? 0);
    const totalPages = $derived(Math.ceil(totalCount / limit));

    let debounceTimer: ReturnType<typeof setTimeout>;

    function buildParams(overrides: Record<string, string | number> = {}) {
        const params = new URLSearchParams();
        if (searchQuery) params.set("searchTerm", searchQuery);
        if (selectedSemesterId) params.set("semesterId", selectedSemesterId);
        params.set("page", String(currentPage));
        params.set("limit", String(limit));
        for (const [k, v] of Object.entries(overrides))
            params.set(k, String(v));
        return params.toString();
    }

    function navigate(overrides: Record<string, string | number> = {}) {
        goto(`?${buildParams(overrides)}`, {
            replaceState: true,
            keepFocus: true,
            noScroll: true,
        });
    }

    function updateURL() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => navigate({ page: 1 }), 300);
    }

    $effect(() => {
        searchQuery;
        selectedSemesterId;
        updateURL();
    });

    function goToPage(p: number) {
        currentPage = p;
        navigate({ page: p });
    }

    function changePageSize(size: number) {
        limit = size;
        currentPage = 1;
        navigate({ page: 1, limit: size });
    }

    const statusClass: Record<string, string> = {
        Active: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
        Inactive:
            "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-100",
        Pending:
            "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
        Completed: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
    };

    // Tính dãy số trang hiển thị (tối đa 5 nút)
    const pageNumbers = $derived(() => {
        const delta = 2;
        const range: number[] = [];
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);
        for (let i = left; i <= right; i++) range.push(i);
        return range;
    });
</script>

<div class="h-[calc(100vh-4rem)] flex flex-col bg-white">
    <!-- Page Header -->
    <div class="flex-none px-8 pt-8 pb-6 border-b border-stone-100">
        <div
            class="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
            <div>
                <p
                    class="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1"
                >
                    Lecturer Portal
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    My Classes
                </h1>
                <p class="text-sm text-stone-400 mt-1">
                    Click on a class name to manage students and grades
                </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
                <div class="relative">
                    <SearchIcon
                        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                    />
                    <Input
                        placeholder="Search class code or name..."
                        class="pl-9 w-full sm:w-64 bg-stone-50 border-stone-200 focus:bg-white focus:border-amber-400 text-sm rounded-lg"
                        bind:value={searchQuery}
                    />
                </div>
                <SemesterDropDown {semesters} bind:selectedSemesterId />
            </div>
        </div>
    </div>

    <!-- Table Area -->
    <div class="flex-1 overflow-y-auto px-8 py-6">
        {#if classes.length === 0}
            <div
                class="flex flex-col items-center justify-center h-full text-center"
            >
                <div
                    class="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-4"
                >
                    <BookUserIcon class="w-6 h-6 text-stone-300" />
                </div>
                <p class="text-base font-semibold text-stone-400">
                    No classes found
                </p>
                <p class="text-sm text-stone-300 mt-1">
                    Try adjusting your search or semester filter
                </p>
            </div>
        {:else}
            <div class="rounded-xl border border-stone-200 overflow-hidden">
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-stone-50 hover:bg-stone-50">
                            <Table.Head
                                class="w-12 text-center text-stone-400 font-semibold"
                                >#</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Class Name</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Class Code</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Student Count</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Semester</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Status</Table.Head
                            >
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each classes as classItem, i}
                            {@const rowNum =
                                (currentPage - 1) * limit + i + 1}
                            <Table.Row
                                class="hover:bg-amber-50/50 transition-colors group"
                            >
                                <Table.Cell
                                    class="text-center text-stone-400 text-sm"
                                    >{rowNum}</Table.Cell
                                >
                                <Table.Cell
                                    class="cursor-pointer"
                                    onclick={() =>
                                        goto(
                                            `/app/lecturer/class/${classItem.classId}`,
                                        )}
                                >
                                    <span
                                        class="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors"
                                    >
                                        {classItem.className}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <code
                                        class="text-sm font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                                    >
                                        {classItem.classCode}
                                    </code>
                                </Table.Cell>
                                <Table.Cell>
                                    <span
                                        class="font-semibold text-stone-900"
                                    >
                                        {classItem.currentStudentCount}
                                    </span>
                                </Table.Cell>
                                <Table.Cell class="text-stone-600 text-sm"
                                    >{classItem.semesterName}</Table.Cell
                                >
                                <Table.Cell>
                                    <Badge
                                        class="text-xs font-semibold border {statusClass[
                                            classItem.status
                                        ] ?? statusClass['Inactive']}"
                                    >
                                        {classItem.status}
                                    </Badge>
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </div>

            <!-- Pagination Footer -->
            <div
                class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4"
            >
                <p class="text-sm text-stone-400">
                    Showing
                    <span class="font-semibold text-stone-600">
                        {(currentPage - 1) * limit + 1}–{Math.min(
                            currentPage * limit,
                            totalCount,
                        )}
                    </span>
                    of
                    <span class="font-semibold text-stone-600"
                        >{totalCount}</span
                    >
                    classes
                </p>

                <div class="flex items-center gap-3">
                    <!-- Rows per page -->
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-stone-400">Rows per page</span
                        >
                        <Select.Root
                            type="single"
                            value={String(limit)}
                            onValueChange={(v) =>
                                v && changePageSize(Number(v))}
                        >
                            <Select.Trigger
                                class="w-16 h-8 text-sm border-stone-200"
                            >
                                {limit}
                            </Select.Trigger>
                            <Select.Content>
                                {#each [5, 10, 20, 50] as size}
                                    <Select.Item value={String(size)}
                                        >{size}</Select.Item
                                    >
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <!-- Page buttons -->
                    <div class="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            class="w-8 h-8 border-stone-200"
                            disabled={currentPage <= 1}
                            onclick={() => goToPage(currentPage - 1)}
                        >
                            <ChevronLeftIcon class="w-4 h-4" />
                        </Button>

                        {#if pageNumbers()[0] > 1}
                            <Button
                                variant="outline"
                                size="icon"
                                class="w-8 h-8 border-stone-200 text-sm"
                                onclick={() => goToPage(1)}>1</Button
                            >
                            {#if pageNumbers()[0] > 2}
                                <span class="text-stone-300 px-1">…</span>
                            {/if}
                        {/if}

                        {#each pageNumbers() as p}
                            <Button
                                variant={p === currentPage
                                    ? "default"
                                    : "outline"}
                                size="icon"
                                class="w-8 h-8 text-sm {p === currentPage
                                    ? 'bg-amber-500 hover:bg-amber-600 border-amber-500 text-white'
                                    : 'border-stone-200 text-stone-600'}"
                                onclick={() => goToPage(p)}
                            >
                                {p}
                            </Button>
                        {/each}

                        {#if pageNumbers()[pageNumbers().length - 1] < totalPages}
                            {#if pageNumbers()[pageNumbers().length - 1] < totalPages - 1}
                                <span class="text-stone-300 px-1">…</span>
                            {/if}
                            <Button
                                variant="outline"
                                size="icon"
                                class="w-8 h-8 border-stone-200 text-sm"
                                onclick={() => goToPage(totalPages)}
                                >{totalPages}</Button
                            >
                        {/if}

                        <Button
                            variant="outline"
                            size="icon"
                            class="w-8 h-8 border-stone-200"
                            disabled={currentPage >= totalPages}
                            onclick={() => goToPage(currentPage + 1)}
                        >
                            <ChevronRightIcon class="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
