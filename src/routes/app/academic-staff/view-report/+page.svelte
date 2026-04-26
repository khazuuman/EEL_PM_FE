<script lang="ts">
    import type { PageData } from "./$types";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
    import {
        BookOpenIcon,
        UsersIcon,
        LayersIcon,
        FileTextIcon,
        TrendingUpIcon,
        AwardIcon,
        BarChart3Icon,
        CrownIcon,
        SearchIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
        ArrowLeftIcon,
        DownloadIcon,
    } from "lucide-svelte";
    import * as Select from "$lib/components/ui/select/index";
    import { toast } from "svelte-sonner";

    let { data }: { data: PageData } = $props();
    const courses = $derived(data.courses ?? []);
    const summary = $derived(data.dashboardData?.summary);
    const topicDist = $derived(
        data.dashboardData?.topicStatusDistribution ?? {},
    );
    const submissionStats = $derived(data.dashboardData?.submissionStats);
    const gradeRange = $derived(
        data.dashboardData?.gradeRangeDistribution ?? {},
    );
    const topGroups = $derived(data.topTierGroups ?? []);
    const pagination = $derived(data.topTierGroupPagination);

    // Filter state
    let minScore = $state(data.filters?.minScore ?? 7);
    let topPercentage = $state(data.filters?.topPercentage ?? 30);
    const semesters = $derived(data.semesters ?? []);
    let semesterId = $state(data.filters?.semesterId ?? "");

    let exporting = $state(false);

    // Dashboard filter state
    let dashboardSemesterId = $state(data.dashboardFilters?.semesterId ?? "");
    let dashboardCourseId = $state(data.dashboardFilters?.courseId ?? "");

    function applyDashboardFilter() {
        const url = new URL(page.url);
        // Chỉ set các param dashboard, giữ nguyên top tier params
        if (dashboardSemesterId) {
            url.searchParams.set("dashboardSemesterId", dashboardSemesterId);
        } else {
            url.searchParams.delete("dashboardSemesterId");
        }
        if (dashboardCourseId) {
            url.searchParams.set("dashboardCourseId", dashboardCourseId);
        } else {
            url.searchParams.delete("dashboardCourseId");
        }
        // Reset về page 1 nhưng GIỮ NGUYÊN top tier filters
        goto(url.toString(), { invalidateAll: true });
    }

    function applyFilter() {
        const url = new URL(page.url);
        url.searchParams.set("page", "1");
        url.searchParams.set("minScore", String(minScore));
        url.searchParams.set("topPercentage", String(topPercentage));
        if (semesterId) {
            url.searchParams.set("semesterId", semesterId);
        } else {
            url.searchParams.delete("semesterId");
        }
        goto(url.toString(), { invalidateAll: true });
    }

    function goToPage(p: number) {
        const url = new URL(page.url);
        url.searchParams.set("page", String(p));
        url.searchParams.set("minScore", String(minScore));
        url.searchParams.set("topPercentage", String(topPercentage));
        if (semesterId) {
            url.searchParams.set("semesterId", semesterId);
        } else {
            url.searchParams.delete("semesterId");
        }
        goto(url.toString(), { invalidateAll: true });
    }

    const summaryCards = $derived([
        {
            label: "Total Classes",
            value: summary?.totalClasses ?? 0,
            icon: LayersIcon,
            color: "text-orange-500",
            bg: "bg-orange-50",
        },
        {
            label: "Total Courses",
            value: summary?.totalCourses ?? 0,
            icon: BookOpenIcon,
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        {
            label: "Total Groups",
            value: summary?.totalGroups ?? 0,
            icon: UsersIcon,
            color: "text-green-500",
            bg: "bg-green-50",
        },
        {
            label: "Total Topics",
            value: summary?.totalTopics ?? 0,
            icon: FileTextIcon,
            color: "text-purple-500",
            bg: "bg-purple-50",
        },
    ]);

    const gradeCards = $derived([
        {
            label: "Average Grade",
            value: summary?.averageGrade?.toFixed(1) ?? "0.0",
            icon: BarChart3Icon,
            color: "text-orange-500",
        },
        {
            label: "Highest Grade",
            value: summary?.highestGrade?.toFixed(1) ?? "0.0",
            icon: TrendingUpIcon,
            color: "text-green-500",
        },
        {
            label: "Lowest Grade",
            value: summary?.lowestGrade?.toFixed(1) ?? "0.0",
            icon: AwardIcon,
            color: "text-red-500",
        },
    ]);

    const gradeRangeColors: Record<string, string> = {
        "> 9.0": "bg-green-500",
        "8.0 - 9.0": "bg-blue-500",
        "7.0 - 8.0": "bg-yellow-500",
        "< 7.0": "bg-red-400",
    };

    const topicStatusColors: Record<string, string> = {
        Approved: "bg-green-100 text-green-700 border-green-200",
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Rejected: "bg-red-100 text-red-700 border-red-200",
    };

    const totalGroups = $derived(summary?.totalGroups ?? 1);

    // Pagination helpers
    const currentPage = $derived(pagination?.page ?? 1);
    const totalPages = $derived(pagination?.totalPages ?? 1);
    const totalItems = $derived(pagination?.totalItems ?? 0);
    const startItem = $derived(
        (currentPage - 1) * (pagination?.limit ?? 10) + 1,
    );
    const endItem = $derived(
        Math.min(currentPage * (pagination?.limit ?? 10), totalItems),
    );

    function getPageNumbers(
        current: number,
        total: number,
    ): (number | "...")[] {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
        if (current >= total - 3)
            return [
                1,
                "...",
                total - 4,
                total - 3,
                total - 2,
                total - 1,
                total,
            ];
        return [1, "...", current - 1, current, current + 1, "...", total];
    }

    //export
    async function handleExport() {
        exporting = true;
        try {
            const params = new URLSearchParams();
            params.set("minScore", String(minScore));
            params.set("topPercentage", String(topPercentage));
            if (semesterId) params.set("semesterId", semesterId);

            const res = await fetch(`/api/export/groups?${params.toString()}`);
            if (!res.ok) {
                toast.error("Failed to export groups.");
                return;
            }

            const disposition = res.headers.get("content-disposition") ?? "";
            const filenameMatch =
                disposition.match(/filename\*=UTF-8''([^;\n]+)/i) ??
                disposition.match(/filename="?([^";\n]+)"?/i);
            const filename = filenameMatch
                ? decodeURIComponent(filenameMatch[1])
                : `top_tier_groups.xlsx`;

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Top tier groups exported successfully.");
        } catch {
            toast.error("Failed to export groups.");
        } finally {
            exporting = false;
        }
    }
</script>

<div class="w-full space-y-6 p-6 bg-white">
    <!-- Page Header -->
    <div class="flex items-center gap-3">
        <Button
            variant="ghost"
            onclick={() => goto(`/app/academic-staff`)}
            class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer -ml-3"
        >
            <ArrowLeftIcon class="w-4 h-4" />
        </Button>
        <div class="rounded-lg bg-orange-100 p-2">
            <BarChart3Icon class="h-6 w-6 text-orange-600" />
        </div>
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-sm text-gray-500">Overview of academic statistics</p>
        </div>
    </div>

    <Separator />

    <!-- Dashboard Filters -->
    <div
        class="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
    >
        <!-- Semester -->
        <div class="flex flex-col gap-1">
            <Label class="text-xs text-gray-500">Semester</Label>
            <Select.Root
                type="single"
                value={dashboardSemesterId}
                onValueChange={(val) => (dashboardSemesterId = val ?? "")}
            >
                <Select.Trigger class="h-8 w-44 text-sm">
                    {semesters.find(
                        (s: any) =>
                            String(s.semesterId) === dashboardSemesterId,
                    )?.semesterName ?? "All Semesters"}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="">All Semesters</Select.Item>
                    {#each semesters as semester}
                        <Select.Item value={String(semester.semesterId)}>
                            <div class="flex items-center gap-2">
                                {semester.semesterName}
                                {#if semester.isCurrent}
                                    <Badge
                                        class="h-4 bg-orange-100 px-1.5 text-[10px] text-orange-600"
                                        >Current</Badge
                                    >
                                {/if}
                            </div>
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>

        <!-- Course -->
        <div class="flex flex-col gap-1">
            <Label class="text-xs text-gray-500">Course</Label>
            <Select.Root
                type="single"
                value={dashboardCourseId}
                onValueChange={(val) => (dashboardCourseId = val ?? "")}
            >
                <Select.Trigger class="h-8 w-fit text-sm">
                    {courses.find(
                        (c: any) => String(c.courseId) === dashboardCourseId,
                    )?.courseName ?? "All Courses"}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="">All Courses</Select.Item>
                    {#each courses as course}
                        <Select.Item value={String(course.courseId)}>
                            {course.courseName}
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>

        <Button
            onclick={applyDashboardFilter}
            size="sm"
            class="h-8 gap-1.5 bg-orange-500 text-white hover:bg-orange-600"
        >
            <SearchIcon class="h-3.5 w-3.5" />
            Apply
        </Button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {#each summaryCards as card}
            <Card.Root class="border border-gray-100 shadow-sm">
                <Card.Content class="p-5">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">{card.label}</p>
                            <p class="mt-1 text-3xl font-bold text-gray-900">
                                {card.value}
                            </p>
                        </div>
                        <div class="rounded-xl {card.bg} p-3">
                            <svelte:component
                                this={card.icon}
                                class="h-6 w-6 {card.color}"
                            />
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        {/each}
    </div>

    <!-- Grade Stats + Topic Distribution + Submission -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card.Root class="border border-gray-100 shadow-sm">
            <Card.Header class="pb-2">
                <Card.Title
                    class="flex items-center gap-2 text-base font-semibold"
                >
                    <TrendingUpIcon class="h-4 w-4 text-orange-500" />
                    Grade Statistics
                </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-4">
                {#each gradeCards as g}
                    <div
                        class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                    >
                        <div class="flex items-center gap-2">
                            <svelte:component
                                this={g.icon}
                                class="h-4 w-4 {g.color}"
                            />
                            <span class="text-sm text-gray-600">{g.label}</span>
                        </div>
                        <span class="text-xl font-bold {g.color}"
                            >{g.value}</span
                        >
                    </div>
                {/each}
            </Card.Content>
        </Card.Root>

        <Card.Root class="border border-gray-100 shadow-sm">
            <Card.Header class="pb-2">
                <Card.Title
                    class="flex items-center gap-2 text-base font-semibold"
                >
                    <FileTextIcon class="h-4 w-4 text-orange-500" />
                    Topic Status
                </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-3">
                {#if Object.keys(topicDist).length === 0}
                    <p class="text-sm text-gray-400">No data available.</p>
                {:else}
                    {#each Object.entries(topicDist) as [status, count]}
                        <div class="flex items-center justify-between">
                            <Badge
                                variant="outline"
                                class="text-xs font-medium {topicStatusColors[
                                    status
                                ] ?? 'bg-gray-100 text-gray-600'}"
                            >
                                {status}
                            </Badge>
                            <span class="text-lg font-semibold text-gray-800"
                                >{count}</span
                            >
                        </div>
                    {/each}
                {/if}
            </Card.Content>
        </Card.Root>

        <Card.Root class="border border-gray-100 shadow-sm">
            <Card.Header class="pb-2">
                <Card.Title
                    class="flex items-center gap-2 text-base font-semibold"
                >
                    <LayersIcon class="h-4 w-4 text-orange-500" />
                    Submission Stats
                </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-3">
                <div
                    class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                    <span class="text-sm text-gray-600"
                        >Groups with Submissions</span
                    >
                    <span class="font-bold text-gray-800">
                        {submissionStats?.groupsWithSubmissions ?? 0} / {submissionStats?.totalGroups ??
                            0}
                    </span>
                </div>
                <div
                    class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                    <span class="text-sm text-gray-600">Total Submissions</span>
                    <span class="font-bold text-orange-600"
                        >{submissionStats?.totalSubmissions ?? 0}</span
                    >
                </div>
                {#if submissionStats && Object.keys(submissionStats.statusDistribution ?? {}).length > 0}
                    <Separator />
                    {#each Object.entries(submissionStats.statusDistribution) as [status, count]}
                        <div class="flex items-center justify-between px-1">
                            <span class="text-xs text-gray-500">{status}</span>
                            <Badge variant="secondary" class="text-xs"
                                >{count}</Badge
                            >
                        </div>
                    {/each}
                {/if}
            </Card.Content>
        </Card.Root>
    </div>

    <!-- Grade Range Distribution -->
    <Card.Root class="border border-gray-100 shadow-sm">
        <Card.Header class="pb-2">
            <Card.Title class="flex items-center gap-2 text-base font-semibold">
                <BarChart3Icon class="h-4 w-4 text-orange-500" />
                Grade Range Distribution
            </Card.Title>
            <Card.Description class="text-xs text-gray-400">
                Number of groups per grade range
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="space-y-3">
                {#each Object.entries(gradeRange) as [range, count]}
                    {@const pct =
                        totalGroups > 0
                            ? Math.round(
                                  ((count as number) / totalGroups) * 100,
                              )
                            : 0}
                    <div class="flex items-center gap-3">
                        <span
                            class="w-24 text-right text-sm font-medium text-gray-600"
                            >{range}</span
                        >
                        <div
                            class="flex-1 overflow-hidden rounded-full bg-gray-100"
                        >
                            <div
                                class="h-3 rounded-full transition-all duration-500 {gradeRangeColors[
                                    range
                                ] ?? 'bg-gray-400'}"
                                style="width: {pct}%"
                            ></div>
                        </div>
                        <span
                            class="w-8 text-right text-sm font-semibold text-gray-700"
                            >{count as number}</span
                        >
                    </div>
                {/each}
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Top Tier Groups -->
    <Card.Root class="border border-gray-100 shadow-sm">
        <Card.Header>
            <div
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <Card.Title
                        class="flex items-center gap-2 text-base font-semibold"
                    >
                        <CrownIcon class="h-4 w-4 text-orange-500" />
                        Top Tier Groups
                    </Card.Title>
                    <Card.Description class="mt-1 text-xs text-gray-400">
                        Groups with highest total scores
                    </Card.Description>
                </div>

                <!-- Filter -->
                <div class="flex flex-wrap items-end gap-3">
                    <div class="flex flex-col gap-1">
                        <Label class="text-xs text-gray-500">Min Score</Label>
                        <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            bind:value={minScore}
                            class="h-8 w-24 text-sm"
                        />
                    </div>
                    <div class="flex flex-col gap-1">
                        <Label class="text-xs text-gray-500"
                            >Top Percentage (%)</Label
                        >
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            bind:value={topPercentage}
                            class="h-8 w-24 text-sm"
                        />
                    </div>

                    <!-- Semester Dropdown -->
                    <div class="flex flex-col gap-1">
                        <Label class="text-xs text-gray-500">Semester</Label>
                        <Select.Root
                            type="single"
                            value={semesterId}
                            onValueChange={(val) => (semesterId = val ?? "")}
                        >
                            <Select.Trigger class="h-8 w-40 text-sm">
                                {semesters.find(
                                    (s: any) =>
                                        String(s.semesterId) === semesterId,
                                )?.semesterName ?? "All Semesters"}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="">All Semesters</Select.Item
                                >
                                {#each semesters as semester}
                                    <Select.Item
                                        value={String(semester.semesterId)}
                                    >
                                        <div class="flex items-center gap-2">
                                            {semester.semesterName}
                                            {#if semester.isCurrent}
                                                <Badge
                                                    class="h-4 bg-orange-100 px-1.5 text-[10px] text-orange-600"
                                                >
                                                    Current
                                                </Badge>
                                            {/if}
                                        </div>
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                    <Button
                        onclick={applyFilter}
                        size="sm"
                        class="h-8 gap-1.5 bg-orange-500 text-white hover:bg-orange-600"
                    >
                        <SearchIcon class="h-3.5 w-3.5" />
                        Apply
                    </Button>

                    <!-- Export Button -->
                    <Button
                        onclick={handleExport}
                        disabled={exporting}
                        variant="outline"
                        size="sm"
                        class="h-8 gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                    >
                        {#if exporting}
                            <div
                                class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-400 border-t-transparent"
                            ></div>
                            Exporting...
                        {:else}
                            <DownloadIcon class="h-3.5 w-3.5" />
                            Export
                        {/if}
                    </Button>
                </div>
            </div>
        </Card.Header>

        <Card.Content>
            {#if topGroups.length === 0}
                <p class="text-sm text-gray-400">
                    No top tier groups available.
                </p>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr
                                class="border-b border-gray-100 text-left text-xs text-gray-500"
                            >
                                <th class="pb-3 pr-4 font-medium">#</th>
                                <th class="pb-3 pr-4 font-medium">Group</th>
                                <th class="pb-3 pr-4 font-medium">Topic</th>
                                <th class="pb-3 pr-4 font-medium">Class</th>
                                <th class="pb-3 pr-4 font-medium">Lecturer</th>
                                <th class="pb-3 font-medium text-right"
                                    >Score</th
                                >
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            {#each topGroups as group, i}
                                {@const globalIndex =
                                    (currentPage - 1) *
                                        (pagination?.limit ?? 10) +
                                    i +
                                    1}
                                <tr class="transition-colors hover:bg-gray-50">
                                    <td class="py-3 pr-4">
                                        {#if globalIndex === 1}
                                            <span class="font-bold">🥇</span>
                                        {:else if globalIndex === 2}
                                            <span class="font-bold">🥈</span>
                                        {:else if globalIndex === 3}
                                            <span class="font-bold">🥉</span>
                                        {:else}
                                            <span class="text-gray-400"
                                                >{globalIndex}</span
                                            >
                                        {/if}
                                    </td>
                                    <td class="py-3 pr-4">
                                        <span
                                            class="font-semibold text-gray-800"
                                            >{group.groupName}</span
                                        >
                                    </td>
                                    <td
                                        class="max-w-[200px] truncate py-3 pr-4 text-gray-600"
                                    >
                                        {group.topicTitle}
                                    </td>
                                    <td class="py-3 pr-4">
                                        <Badge
                                            variant="outline"
                                            class="border-orange-200 text-xs text-orange-600"
                                        >
                                            {group.classCode}
                                        </Badge>
                                    </td>
                                    <td class="py-3 pr-4 text-gray-600"
                                        >{group.lecturerName}</td
                                    >
                                    <td class="py-3 text-right">
                                        <span
                                            class="font-bold {group.totalScore >=
                                            9
                                                ? 'text-green-600'
                                                : group.totalScore >= 7
                                                  ? 'text-blue-600'
                                                  : 'text-red-500'}"
                                        >
                                            {group.totalScore.toFixed(1)}
                                        </span>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div
                    class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4"
                >
                    <p class="text-xs text-gray-500">
                        Showing <span class="font-medium text-gray-700"
                            >{startItem}–{endItem}</span
                        >
                        of
                        <span class="font-medium text-gray-700"
                            >{totalItems}</span
                        > groups
                    </p>

                    <div class="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            class="h-8 w-8"
                            disabled={currentPage <= 1}
                            onclick={() => goToPage(currentPage - 1)}
                        >
                            <ChevronLeftIcon class="h-4 w-4" />
                        </Button>

                        {#each getPageNumbers(currentPage, totalPages) as p}
                            {#if p === "..."}
                                <span class="px-1 text-gray-400">…</span>
                            {:else}
                                <Button
                                    variant={p === currentPage
                                        ? "default"
                                        : "outline"}
                                    size="icon"
                                    class="h-8 w-8 {p === currentPage
                                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                                        : ''}"
                                    onclick={() => goToPage(p as number)}
                                >
                                    {p}
                                </Button>
                            {/if}
                        {/each}

                        <Button
                            variant="outline"
                            size="icon"
                            class="h-8 w-8"
                            disabled={currentPage >= totalPages}
                            onclick={() => goToPage(currentPage + 1)}
                        >
                            <ChevronRightIcon class="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            {/if}
        </Card.Content>
    </Card.Root>
</div>
