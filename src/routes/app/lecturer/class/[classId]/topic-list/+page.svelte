<script lang="ts">
    import type { PageData } from "./$types";
    import { Input } from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select";
    import { Button } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import {
        BookOpen,
        Clock,
        CheckCircle2,
        XCircle,
        Users,
        Search,
        Layers,
        ArrowLeftIcon,
        X,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

    const statCards = [
        {
            label: "Total Topics",
            icon: BookOpen,
            color: "text-orange-600",
            bg: "bg-orange-100",
        },
        {
            label: "Pending Review",
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            label: "Approved",
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            label: "Rejected",
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-100",
        },
    ] as const;

    let topics = $derived(data.topics);

    let stats = $derived({
        total: topics.length,
        pending: topics.filter((t: any) => t.status === "Pending").length,
        approved: topics.filter((t: any) => t.status === "Approved").length,
        rejected: topics.filter((t: any) => t.status === "Rejected").length,
    });

    let statValues = $derived([
        stats.total,
        stats.pending,
        stats.approved,
        stats.rejected,
    ]);

    // Khởi tạo từ URL params (giữ state khi reload)
    let searchTerm = $state(data.searchTerm ?? "");
    let filterStatus = $state(data.status ?? "");

    let isFiltering = $derived(searchTerm !== "" || filterStatus !== "");

    // Debounce search để tránh call liên tục khi gõ
    let searchTimeout: ReturnType<typeof setTimeout>;
    function onSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => applyFilter(), 400);
    }

    function onStatusChange() {
        applyFilter();
    }

    function applyFilter() {
        const params = new URLSearchParams($page.url.searchParams);
        if (searchTerm) params.set("search", searchTerm);
        else params.delete("search");
        if (filterStatus) params.set("status", filterStatus);
        else params.delete("status");
        goto(`?${params.toString()}`, { keepFocus: true });
    }

    function resetFilter() {
        searchTerm = "";
        filterStatus = "";
        goto("?", { keepFocus: true });
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    const statusColors: Record<string, string> = {
        Pending: "border-orange-200 text-orange-600 bg-orange-50",
        Approved: "border-green-200 text-green-700 bg-green-50",
        Rejected: "border-red-200 text-red-600 bg-red-50",
    };

    const statusOptions = [
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Rejected", label: "Rejected" },
    ];

    let selectedLabel = $derived(
        statusOptions.find((o) => o.value === filterStatus)?.label ??
            "All Status",
    );
</script>

<div class="min-h-screen bg-white pt-5 font-sans">
    <!-- ── Sticky Top Bar ──────────────────────────────────────── -->
    <div
        class="sticky top-0 z-10 px-6 flex items-center"
    >
        <Button
            variant="ghost"
            onclick={() => goto(`/app/lecturer/class/${data.classId}`)}
            class="flex items-center gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-3 py-4 transition-all cursor-pointer"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            <span class="text-sm font-semibold">Back to Home</span>
        </Button>
    </div>

    <!-- ── Main Content ────────────────────────────────────────── -->
    <div class="px-6 py-6 space-y-6">
        <!-- Header & Filters -->
        <div
            class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
            <div>
                <h1 class="text-2xl font-extrabold text-gray-900">
                    Class Project Topics
                </h1>
                <p class="mt-1 text-sm text-gray-500">
                    Manage and review student project submissions.
                </p>
            </div>

            <!-- Search + Filter + Reset -->
            <div class="flex items-center gap-2 flex-wrap">
                <div class="relative w-64">
                    <Search
                        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                        bind:value={searchTerm}
                        oninput={onSearchInput}
                        placeholder="Search by title..."
                        class="pl-9 bg-gray-50 border-gray-200 h-10"
                    />
                </div>

                <Select.Root
                    type="single"
                    bind:value={filterStatus}
                    onValueChange={onStatusChange}
                >
                    <Select.Trigger
                        class="w-40 bg-gray-50 border-gray-200 h-10"
                    >
                        {selectedLabel}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="">All Status</Select.Item>
                        {#each statusOptions as opt}
                            <Select.Item value={opt.value}
                                >{opt.label}</Select.Item
                            >
                        {/each}
                    </Select.Content>
                </Select.Root>

                {#if isFiltering}
                    <Button
                        variant="outline"
                        onclick={resetFilter}
                        class="gap-1.5 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 h-10"
                    >
                        <X class="h-4 w-4" /> Reset
                    </Button>
                {/if}
            </div>
        </div>

        <!-- Stats -->
        <div class="flex flex-wrap gap-4">
            {#each statCards as stat, i}
                <div
                    class="flex flex-1 min-w-[200px] items-center gap-4 px-5 py-4 rounded-xl bg-white border border-gray-200 shadow-sm"
                >
                    <div
                        class="rounded-full p-2.5 flex items-center justify-center shrink-0 {stat.bg}"
                    >
                        <svelte:component
                            this={stat.icon}
                            class="h-5 w-5 {stat.color}"
                        />
                    </div>
                    <div>
                        <p
                            class="text-xs text-gray-400 font-semibold uppercase tracking-wide"
                        >
                            {stat.label}
                        </p>
                        <p class="text-xl font-bold text-gray-900">
                            {statValues[i]}
                        </p>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Cards Grid -->
        {#if topics.length === 0}
            <div
                class="col-span-full flex flex-col items-center justify-center py-24 text-gray-400 gap-3"
            >
                <BookOpen class="w-14 h-14 text-gray-300" />
                <p class="text-lg font-semibold text-gray-500">
                    No topics found
                </p>
                <p class="text-sm text-gray-400">
                    There are no topics matching your criteria.
                </p>
            </div>
        {:else}
            <!-- Lưới tự động mở rộng theo màn hình -->
            <div
                class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            >
                {#each topics as topic (topic.topicId)}
                    <div
                        class="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md overflow-hidden"
                    >
                        <!-- Card Body -->
                        <div class="flex flex-col gap-3 p-5">
                            <div class="flex items-start justify-between gap-2">
                                <h3
                                    class="text-base font-bold leading-snug text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2"
                                >
                                    {topic.title}
                                </h3>
                                <span
                                    class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold {statusColors[
                                        topic.status
                                    ] ??
                                        'border-gray-200 bg-gray-50 text-gray-500'}"
                                >
                                    {topic.status}
                                </span>
                            </div>

                            <div
                                class="flex items-center gap-2 text-sm text-gray-600 mt-1"
                            >
                                <Layers
                                    class="h-4 w-4 shrink-0 text-orange-500"
                                />
                                <span class="font-semibold text-gray-800"
                                    >{topic.group?.classCode}</span
                                >
                                <span
                                    class="bg-gray-300 rounded-full w-1 h-1 block shrink-0"
                                ></span>
                                <span class="truncate"
                                    >{topic.group?.groupName}</span
                                >
                            </div>

                            <div
                                class="flex items-center gap-2 text-sm text-gray-600"
                            >
                                <Users class="h-4 w-4 shrink-0 text-gray-400" />
                                <span>{topic.group?.memberCount} Members</span>
                            </div>

                            {#if topic.description}
                                <p
                                    class="line-clamp-2 text-sm text-gray-500 mt-2"
                                >
                                    {topic.description}
                                </p>
                            {/if}
                        </div>

                        <!-- Card Footer -->
                        <div
                            class="border-t border-gray-100 px-5 py-3 text-xs text-gray-500 bg-gray-50 flex items-center justify-between gap-3"
                        >
                            <div class="flex-1 min-w-0">
                                <p class="truncate">
                                    By <span class="font-semibold text-gray-700"
                                        >{topic.submittedBy?.fullName}</span
                                    >
                                    ({topic.submittedBy?.studentCode})
                                </p>
                                <p class="mt-0.5 text-gray-400">
                                    on {formatDate(topic.submittedAt)}
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                class="shrink-0 cursor-pointer gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300 h-8 px-3 text-xs bg-white transition-colors"
                                onclick={() =>
                                    goto(
                                        `/app/lecturer/class/${data.classId}/topic-list/${topic.topicId}`,
                                    )}
                            >
                                <BookOpen class="h-3.5 w-3.5" />
                                View
                            </Button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
