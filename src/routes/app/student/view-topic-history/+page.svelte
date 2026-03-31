<script lang="ts">
    import type { PageData } from "./$types";
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import { Avatar } from "$lib/components/ui/avatar";
    import {
        History,
        Users,
        User,
        Mail,
        Flag,
        CheckCircle2,
        XCircle,
        BookOpen,
    } from "lucide-svelte";
    import { ArrowLeft } from "phosphor-svelte";
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

    // Lấy chữ cái đầu của tên (Ví dụ: Lê Đức Ích -> LÍ)
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
                    badgeClass:
                        "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
                    dotClass: "bg-green-500",
                    icon: CheckCircle2,
                    iconClass: "text-green-600",
                };
            case "Rejected":
                return {
                    badgeClass:
                        "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
                    dotClass: "bg-red-500",
                    icon: XCircle,
                    iconClass: "text-red-500",
                };
            default:
                return {
                    badgeClass:
                        "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
                    dotClass: "bg-orange-400",
                    icon: History,
                    iconClass: "text-orange-500",
                };
        }
    }
</script>

<div class="mx-auto max-w-5xl min-h-screen bg-gray-50/50 p-6 font-sans pt-20">
    <div class="mb-6">
        <Button 
            variant="ghost" 
            class="gap-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 -ml-4"
            href="/app" 
        >
            <ArrowLeft class="h-4 w-4" />
            Back to Dashboard
        </Button>
    </div>
    <!-- HEADER -->
    <Card.Root class="mb-10 border-zinc-200 shadow-sm">
        <Card.Content
            class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6"
        >
            <div class="flex items-start gap-4">
                <div class="p-2.5 bg-orange-50 text-orange-500 rounded-lg">
                    <History class="h-6 w-6" />
                </div>
                <div>
                    <h1 class="text-xl font-bold text-zinc-900">
                        Topic Change History
                    </h1>
                    <p class="text-sm text-zinc-500 mt-1">
                        Chronological record of topic submissions and status
                        updates.
                    </p>
                </div>
            </div>

            {#if groupInfo}
                <div
                    class="bg-zinc-50/80 border border-zinc-100 rounded-xl p-4 min-w-[280px]"
                >
                    <div class="flex items-center justify-between mb-3">
                        <span
                            class="text-xs font-bold text-zinc-500 tracking-wider"
                            >GROUP DETAILS</span
                        >
                        <Badge
                            variant="outline"
                            class={getStatusConfig(groupInfo.status).badgeClass}
                        >
                            {groupInfo.status}
                        </Badge>
                    </div>
                    <div class="space-y-2 text-sm text-zinc-700 font-medium">
                        <div class="flex items-center gap-2.5">
                            <Users class="h-4 w-4 text-zinc-400" />
                            {groupInfo.groupName}
                        </div>
                        <div class="flex items-center gap-2.5">
                            <BookOpen class="h-4 w-4 text-zinc-400" />
                            Class: {groupInfo.classCode}
                        </div>
                        <div class="flex items-center gap-2.5">
                            <User class="h-4 w-4 text-zinc-400" />
                            {groupInfo.memberCount} Members
                        </div>
                    </div>
                </div>
            {/if}
        </Card.Content>
    </Card.Root>

    <!-- TIMELINE -->
    <div class="pb-10">
        {#each topics as topic, index}
            {@const statusCfg = getStatusConfig(topic.status)}
            {@const isLast = index === topics.length - 1}
            {@const dateInfo = formatDate(topic.submittedAt)}

            <!-- Grid Layout cho Timeline: Cột trái (Thời gian) - Cột giữa (Line + Dot) - Cột phải (Card) -->
            <div class="grid grid-cols-[100px_48px_1fr] gap-0">
                <!-- Cột trái: Ngày giờ -->
                <div class="text-right pt-5 pr-2">
                    <div class="text-sm font-bold text-zinc-900">
                        {dateInfo.date}
                    </div>
                    <div class="text-xs text-zinc-500 mt-0.5">
                        {dateInfo.time}
                    </div>
                </div>

                <!-- Cột giữa: Trục thời gian & Dấu chấm -->
                <div class="relative flex justify-center">
                    <!-- Trục dọc -->
                    <div
                        class="absolute w-px bg-zinc-200 {isLast
                            ? 'top-0 bottom-auto h-full'
                            : 'inset-y-0'}"
                    ></div>

                    <!-- Dấu chấm tròn (Dot) -->
                    <div
                        class="relative z-10 mt-6 h-3.5 w-3.5 rounded-full {statusCfg.dotClass} ring-4 ring-gray-50 shadow-sm"
                    ></div>
                </div>

                <!-- Cột phải: Nội dung Card -->
                <div class="pb-8">
                    <Card.Root
                        class="border-zinc-200 shadow-sm transition-all hover:shadow-md hover:border-zinc-300"
                    >
                        <Card.Content class="p-6">
                            <!-- Card Header: Logo & Title -->
                            <div class="flex items-start gap-5 mb-6">
                                {#if topic.logoUrl}
                                    <img
                                        src={topic.logoUrl}
                                        alt="Logo"
                                        class="h-16 w-16 rounded-xl object-cover border border-zinc-200 shadow-sm shrink-0"
                                        onerror={(e) =>
                                            ((
                                                e.currentTarget as HTMLImageElement
                                            ).style.display = "none")}
                                    />
                                {:else}
                                    <div
                                        class="h-16 w-16 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0"
                                    >
                                        <BookOpen
                                            class="h-6 w-6 text-zinc-400"
                                        />
                                    </div>
                                {/if}

                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-3 mb-2">
                                        <span
                                            class="text-xs font-semibold text-zinc-400 tracking-wider"
                                            >ID: {topic.topicId}</span
                                        >
                                        <Badge
                                            variant="outline"
                                            class="gap-1 px-2 py-0 h-6 {statusCfg.badgeClass}"
                                        >
                                            <svelte:component
                                                this={statusCfg.icon}
                                                class="h-3 w-3"
                                            />
                                            {topic.status}
                                        </Badge>
                                    </div>
                                    <h3
                                        class="text-xl font-bold text-zinc-900 leading-tight"
                                    >
                                        {topic.title}
                                    </h3>
                                </div>
                            </div>

                            <!-- Card Body: Description & Objectives -->
                            <div class="space-y-4">
                                <div>
                                    <h4
                                        class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2"
                                    >
                                        Description
                                    </h4>
                                    <div
                                        class="bg-zinc-50/50 border border-zinc-100 rounded-lg p-4 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap"
                                    >
                                        {topic.description ||
                                            "No description provided."}
                                    </div>
                                </div>

                                <div>
                                    <h4
                                        class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2"
                                    >
                                        Objectives
                                    </h4>
                                    <div
                                        class="bg-zinc-50/50 border border-zinc-100 rounded-lg p-4 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap"
                                    >
                                        {topic.objectives ||
                                            "No objectives provided."}
                                    </div>
                                </div>
                            </div>

                            <!-- Card Footer: Submitter Info -->
                            <Separator class="my-5" />
                            <div
                                class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div class="flex items-center gap-3">
                                    <div
                                        class="h-9 w-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold shrink-0"
                                    >
                                        {getInitials(
                                            topic.submittedBy.fullName,
                                        )}
                                    </div>
                                    <div>
                                        <p class="text-xs text-zinc-500">
                                            Submitted by
                                        </p>
                                        <p
                                            class="text-sm font-semibold text-zinc-900"
                                        >
                                            {topic.submittedBy.fullName}
                                            <span
                                                class="ml-1 text-xs font-normal text-zinc-500"
                                                >{topic.submittedBy
                                                    .studentCode}</span
                                            >
                                        </p>
                                    </div>
                                </div>
                                <div
                                    class="flex items-center gap-1.5 text-sm text-zinc-600 sm:ml-auto bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100"
                                >
                                    <Mail class="h-3.5 w-3.5" />
                                    {topic.submittedBy.email}
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                </div>
            </div>
        {/each}

        <!-- End of History Node -->
        {#if topics.length > 0}
            <div class="grid grid-cols-[100px_48px_1fr] gap-0">
                <div></div>
                <!-- Empty left column -->
                <div class="relative flex justify-center pt-2">
                    <div
                        class="h-8 w-8 rounded-full bg-white border-2 border-zinc-100 flex items-center justify-center shadow-sm z-10"
                    >
                        <Flag class="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                </div>
                <div class="pt-3">
                    <span class="text-sm font-medium text-zinc-500 ml-2"
                        >End of history</span
                    >
                </div>
            </div>
        {/if}
    </div>
</div>
