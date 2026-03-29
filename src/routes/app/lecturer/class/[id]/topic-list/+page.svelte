<script lang="ts">
    import type { PageData } from "./$types";
    import { Input } from "$lib/components/ui/input";
    import * as Card from "$lib/components/ui/card";
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
            color: "text-orange-500",
            bg: "bg-orange-50",
        },
        {
            label: "Pending Review",
            icon: Clock,
            color: "text-blue-400",
            bg: "bg-blue-50",
        },
        {
            label: "Approved",
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-50",
        },
        {
            label: "Rejected",
            icon: XCircle,
            color: "text-red-400",
            bg: "bg-red-50",
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
        Pending: "border-orange-400 text-orange-500 bg-orange-50",
        Approved: "border-green-400 text-green-600 bg-green-50",
        Rejected: "border-red-400 text-red-500 bg-red-50",
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

<div class="min-h-screen bg-gray-50 p-6 font-sans pt-20">
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app/lecturer/class/{data.classId}"
    >
        <ArrowLeftIcon /> Back to Dashboard
    </a>

    <div class="mx-auto max-w-7xl space-y-6">
        <!-- Header -->
        <div
            class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
            <div>
                <h1 class="text-3xl font-bold text-gray-900">
                    Class Project Topics
                </h1>
                <p class="mt-1 text-sm text-gray-500">
                    Manage and review student project submissions.
                </p>
            </div>

            <!-- Search + Filter + Reset -->
            <div class="flex items-center gap-2">
                <div class="relative w-56">
                    <Search
                        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                        bind:value={searchTerm}
                        oninput={onSearchInput}
                        placeholder="Search by title..."
                        class="pl-9 bg-white border-gray-200"
                    />
                </div>

                <Select.Root
                    type="single"
                    bind:value={filterStatus}
                    onValueChange={onStatusChange}
                >
                    <Select.Trigger class="w-36 bg-white border-gray-200">
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
                        class="gap-1.5 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <X class="h-4 w-4" /> Reset
                    </Button>
                {/if}
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {#each statCards as stat, i}
                <Card.Root class="border border-gray-100 bg-white shadow-sm">
                    <Card.Content class="flex items-center gap-4 p- 3">
                        <div class="rounded-lg p-2.5 {stat.bg}">
                            <svelte:component
                                this={stat.icon}
                                class="h-8 w-8 {stat.color}"
                            />
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">{stat.label}</p>
                            <p class="text-2xl font-bold text-gray-900">
                                {statValues[i]}
                            </p>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>

        <!-- Cards -->
        {#if topics.length === 0}
            <div class="py-20 text-center text-gray-400">No topics found.</div>
        {:else}
            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {#each topics as topic (topic.topicId)}
                    <Card.Root
                        class="group p-0 flex flex-col justify-between border border-gray-100 bg-white shadow-sm transition-all hover:border-orange-400 hover:shadow-md"
                    >
                        <Card.Content class="flex flex-col gap-3 p-5">
                            <div class="flex items-start justify-between gap-2">
                                <h3
                                    class="text-[18px] font-bold leading-snug text-gray-900 group-hover:text-orange-500 transition-colors"
                                >
                                    {topic.title}
                                </h3>
                                <span
                                    class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium {statusColors[
                                        topic.status
                                    ] ?? 'bg-gray-100 text-gray-500'}"
                                >
                                    {topic.status}
                                </span>
                            </div>

                            <div
                                class="flex items-center gap-1.5 text-sm text-gray-500"
                            >
                                <Layers class="h-4 w-4 shrink-0" />
                                <span class="font-semibold text-gray-700"
                                    >{topic.group?.classCode}</span
                                >
                                <span
                                    class="bg-gray-700 rounded-full w-1 h-1 block"
                                ></span>
                                <span class="truncate"
                                    >{topic.group?.groupName}</span
                                >
                            </div>

                            <div
                                class="flex items-center gap-1.5 text-sm text-gray-500"
                            >
                                <Users class="h-4 w-4 shrink-0" />
                                <span>{topic.group?.memberCount} Members</span>
                            </div>

                            {#if topic.description}
                                <p class="line-clamp-2 text-sm text-gray-400">
                                    {topic.description}
                                </p>
                            {/if}
                        </Card.Content>

                        <div
                            class="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 bg-stone-100 flex items-center justify-between gap-3"
                        >
                            <span>
                                Submitted by
                                <span class="font-semibold text-gray-600"
                                    >{topic.submittedBy?.fullName}</span
                                >
                                ({topic.submittedBy?.studentCode}) · {topic
                                    .submittedBy?.email}
                                <br />on {formatDate(topic.submittedAt)}
                            </span>

                            <Button
                                variant="outline"
                                class="shrink-0 cursor-pointer gap-1.5 border-orange-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600 h-8 px-3 text-xs"
                                onclick={() =>
                                    goto(
                                        `/app/lecturer/class/${data.classId}/topic-list/${topic.topicId}`,
                                    )}
                            >
                                <BookOpen class="h-3.5 w-3.5" />
                                View Detail
                            </Button>
                        </div>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </div>
</div>
