<script lang="ts">
    import type { PageData } from "./$types";
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import {
        History,
        Users,
        User,
        BookOpen,
        Flag,
        CheckCircle2,
        XCircle,
        RefreshCwIcon
    } from "lucide-svelte";
    import { ArrowLeftIcon } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    let { data }: { data: PageData } = $props();

    // Sắp xếp lịch sử mới nhất lên đầu
    let topics = $derived(
        data.topics?.sort(
            (a: any, b: any) =>
                new Date(b.submittedAt).getTime() -
                new Date(a.submittedAt).getTime(),
        ) || [],
    );

    // Lấy thông tin group từ item đầu tiên
    let groupInfo = $derived(topics.length > 0 ? topics[0].group : null);

    // Format ngày giờ
    function formatDate(iso: string) {
        const d = new Date(iso);
        return {
            date: d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            time: d.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
        };
    }

    // Lấy chữ cái đầu của tên
    function getInitials(name: string) {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    // Cấu hình màu sắc theo trạng thái
    function getStatusConfig(status: string) {
        switch (status) {
            case "Approved":
                return {
                    badgeClass: "bg-green-100 text-green-700 border-green-300",
                    dotClass: "bg-green-500 ring-green-50",
                    icon: CheckCircle2,
                };
            case "Rejected":
                return {
                    badgeClass: "bg-red-100 text-red-700 border-red-300",
                    dotClass: "bg-red-500 ring-red-50",
                    icon: XCircle,
                };
            default: // Pending
                return {
                    badgeClass: "bg-amber-100 text-amber-700 border-amber-300",
                    dotClass: "bg-orange-400 ring-orange-50",
                    icon: History,
                };
        }
    }
</script>

<div class="min-h-screen bg-white pt-5 font-sans">
    <!-- ── Sticky Top Bar ───────────────────────────────────────── -->
    <div
        class="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-3 backdrop-blur-sm"
    >
        <Button
            variant="ghost"
            href="/app"
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Back to Home</span>
        </Button>
    </div>

    <!-- ── Main Content ─────────────────────────────────────────── -->
    <div class="px-6 py-5 space-y-10 max-w-[1600px] mx-auto">
        <!-- HEADER -->
        <Card.Root
            class="border-gray-200 shadow-sm bg-white overflow-hidden rounded-2xl"
        >
            <Card.Content
                class="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 px-8"
            >
                <div class="flex items-start gap-5">
                    <div
                        class="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 shrink-0"
                    >
                        <History class="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                        <h1
                            class="text-2xl font-extrabold text-gray-900 tracking-tight"
                        >
                            Topic Change History
                        </h1>
                        <p class="text-base text-gray-500 mt-1 max-w-xl">
                            Chronological record of all topic submissions,
                            updates, and status changes over time.
                        </p>
                    </div>
                </div>

                {#if groupInfo}
                    <div
                        class="bg-gray-50 border border-gray-100 rounded-xl p-5 min-w-[320px]"
                    >
                        <div class="flex items-center justify-between mb-4">
                            <span
                                class="text-xs font-bold text-gray-500 tracking-widest uppercase"
                            >
                                Group Details
                            </span>
                            <Badge
                                class={`rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase border ${getStatusConfig(groupInfo.status).badgeClass}`}
                            >
                                {groupInfo.status}
                            </Badge>
                        </div>
                        <div
                            class="space-y-3 text-sm text-gray-800 font-medium"
                        >
                            <div class="flex items-center gap-3">
                                <Users class="h-4 w-4 text-gray-400" />
                                {groupInfo.groupName}
                            </div>
                            <div class="flex items-center gap-3">
                                <BookOpen class="h-4 w-4 text-gray-400" />
                                Class: {groupInfo.classCode}
                            </div>
                            <div class="flex items-center gap-3">
                                <User class="h-4 w-4 text-gray-400" />
                                {groupInfo.memberCount} Members
                            </div>
                        </div>
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>

        <!-- TIMELINE -->
        <div class="pb-10 max-w-6xl mx-auto">
            {#each topics as topic, index}
                {@const statusCfg = getStatusConfig(topic.status)}
                {@const isLast = index === topics.length - 1}
                {@const dateInfo = formatDate(topic.submittedAt)}

                <!-- Grid Layout Timeline -->
                <div class="grid grid-cols-[120px_60px_1fr] gap-0">
                    <!-- Left: Date & Time -->
                    <div class="text-right pt-6 pr-4">
                        <div class="text-base font-bold text-gray-900">
                            {dateInfo.date}
                        </div>
                        <div class="text-sm font-medium text-gray-500 mt-1">
                            {dateInfo.time}
                        </div>
                    </div>

                    <!-- Middle: Timeline Line & Dot -->
                    <div class="relative flex justify-center">
                        <div
                            class="absolute w-[2px] bg-gray-200 {isLast
                                ? 'top-0 bottom-auto h-full'
                                : 'inset-y-0'}"
                        ></div>
                        <div
                            class="relative z-10 mt-7 h-4 w-4 rounded-full {statusCfg.dotClass} ring-4 shadow-sm"
                        ></div>
                    </div>

                    <!-- Right: Card Content -->
                    <div class="pb-10">
                        <Card.Root
                            class="border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-orange-300 rounded-2xl overflow-hidden"
                        >
                            <Card.Content class="p-8">
                                <!-- Header: Logo, Title, Badge -->
                                <div class="flex items-start gap-6 mb-6">
                                    {#if topic.logoUrl}
                                        <img
                                            src={topic.logoUrl}
                                            alt="Logo"
                                            class="h-20 w-20 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                                            onerror={(e) =>
                                                ((
                                                    e.currentTarget as HTMLImageElement
                                                ).style.display = "none")}
                                        />
                                    {:else}
                                        <div
                                            class="h-20 w-20 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0"
                                        >
                                            <BookOpen
                                                class="h-8 w-8 text-gray-400"
                                            />
                                        </div>
                                    {/if}

                                    <div class="flex-1 min-w-0">
                                        <div
                                            class="flex items-center flex-wrap gap-3 mb-2"
                                        >
                                            <span
                                                class="text-xs font-bold text-gray-400 tracking-widest uppercase"
                                            >
                                                Version {topic.versionNumber}
                                            </span>
                                            <span class="text-gray-300">•</span>
                                            <span
                                                class="text-xs font-bold text-gray-400 tracking-widest uppercase"
                                            >
                                                ID: {topic.topicId}
                                            </span>
                                            
                                            <!-- TYPE BADGE: Change Request vs Initial -->
                                            {#if topic.isChangeRequest}
                                                <Badge class="ml-2 bg-blue-100 text-blue-700 border-blue-300 gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                                                    <RefreshCwIcon class="w-3 h-3" />
                                                    Change Request
                                                </Badge>
                                            {:else}
                                                <Badge class="ml-2 bg-gray-100 text-gray-600 border-gray-200 gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                                                    Initial Submission
                                                </Badge>
                                            {/if}

                                            <!-- STATUS BADGE -->
                                            <Badge
                                                class={`ml-auto gap-1.5 px-3 py-1 border rounded-full text-xs font-bold tracking-wide uppercase ${statusCfg.badgeClass}`}
                                            >
                                                <svelte:component
                                                    this={statusCfg.icon}
                                                    class="h-3.5 w-3.5"
                                                />
                                                {topic.status}
                                            </Badge>
                                        </div>
                                        <h3
                                            class="text-2xl font-extrabold text-gray-900 leading-tight"
                                        >
                                            {topic.title}
                                        </h3>
                                    </div>
                                </div>

                                <!-- Body: Description & Objectives -->
                                <div
                                    class="grid grid-cols-1 xl:grid-cols-2 gap-6"
                                >
                                    <div>
                                        <h4
                                            class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3"
                                        >
                                            Description
                                        </h4>
                                        <div
                                            class="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[100px]"
                                        >
                                            {topic.description ||
                                                "No description provided."}
                                        </div>
                                    </div>
                                    <div>
                                        <h4
                                            class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3"
                                        >
                                            Objectives
                                        </h4>
                                        <div
                                            class="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[100px]"
                                        >
                                            {topic.objectives ||
                                                "No objectives provided."}
                                        </div>
                                    </div>
                                </div>

                                <!-- Footer: Submitter & Feedback -->
                                <Separator class="my-6 bg-gray-100" />
                                <div
                                    class="flex flex-col xl:flex-row xl:items-start justify-between gap-6"
                                >
                                    <div class="flex items-center gap-4">
                                        <div
                                            class="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold shrink-0"
                                        >
                                            {getInitials(
                                                topic.submittedBy.fullName,
                                            )}
                                        </div>
                                        <div>
                                            <p
                                                class="text-xs text-gray-500 mb-0.5"
                                            >
                                                Submitted by
                                            </p>
                                            <p
                                                class="text-sm font-semibold text-gray-900"
                                            >
                                                {topic.submittedBy.fullName}
                                                <span
                                                    class="ml-1.5 text-xs font-normal text-gray-500 font-mono"
                                                >
                                                    {topic.submittedBy
                                                        .studentCode}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {#if topic.reviewFeedback}
                                        <div
                                            class="xl:w-1/2 bg-red-50/50 border border-red-100 rounded-lg p-4"
                                        >
                                            <p
                                                class="text-xs font-bold text-red-600 uppercase tracking-widest mb-1.5"
                                            >
                                                Review Feedback
                                            </p>
                                            <p
                                                class="text-sm text-red-800 leading-relaxed"
                                            >
                                                {topic.reviewFeedback}
                                            </p>
                                        </div>
                                    {/if}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    </div>
                </div>
            {/each}

            <!-- End of History Node -->
            {#if topics.length > 0}
                <div class="grid grid-cols-[120px_60px_1fr] gap-0">
                    <div></div>
                    <div class="relative flex justify-center pt-2">
                        <div
                            class="h-10 w-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm z-10"
                        >
                            <Flag class="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    <div class="pt-4 pl-4">
                        <span class="text-base font-semibold text-gray-400">
                            End of history
                        </span>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>