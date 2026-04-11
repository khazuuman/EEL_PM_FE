<script lang="ts">
    import type { PageData } from "./$types";
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
        RefreshCwIcon,
        ArrowLeftIcon,
    } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    let { data }: { data: PageData } = $props();

    let topics = $derived(
        data.topics?.sort(
            (a: any, b: any) =>
                new Date(b.submittedAt).getTime() -
                new Date(a.submittedAt).getTime(),
        ) || [],
    );

    let groupInfo = $derived(topics.length > 0 ? topics[0].group : null);

    function formatDate(iso: string) {
        const d = new Date(iso);
        return {
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            time: d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
        };
    }

    function getInitials(name: string) {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
    }

    const statusConfig: Record<string, { badge: string; dot: string; icon: any }> = {
        Approved: { badge: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", icon: CheckCircle2 },
        Rejected: { badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", icon: XCircle },
        Pending:  { badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400", icon: History },
    };

    function getCfg(status: string) {
        return statusConfig[status] ?? statusConfig["Pending"];
    }
</script>

<div class="min-h-screen bg-white font-sans">
    <!-- ─── Sticky Top Bar ─────────────────────────────────────────── -->
    <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-8 py-3 shadow-sm backdrop-blur-sm">
        <Button
            variant="ghost"
            onclick={() => history.back()}
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Back</span>
        </Button>
    </div>

    <!-- ─── Overview Banner ───────────────────────────────────────── -->
    <div class="border-b border-gray-100 bg-gray-50/60 px-8 py-6">
        <div class="flex items-start justify-between gap-6 flex-wrap">
            <div class="flex items-center gap-4">
                <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 shrink-0">
                    <History class="h-6 w-6 text-orange-600" />
                </span>
                <div>
                    <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">
                        Topic Change History
                    </h1>
                    <p class="text-base text-gray-500 mt-0.5">
                        Chronological record of all topic submissions and status changes.
                    </p>
                </div>
            </div>

            {#if groupInfo}
                <div class="flex flex-wrap items-center gap-2">
                    <div class="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-600">
                        <Users class="h-4 w-4 text-orange-400" />
                        <span class="font-medium">{groupInfo.groupName}</span>
                    </div>
                    <div class="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-600">
                        <BookOpen class="h-4 w-4 text-orange-400" />
                        <span class="font-medium">{groupInfo.classCode}</span>
                    </div>
                    <div class="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-600">
                        <User class="h-4 w-4 text-orange-400" />
                        <span class="font-medium">{groupInfo.memberCount} members</span>
                    </div>
                    <Badge class={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${getCfg(groupInfo.status).badge}`}>
                        {groupInfo.status}
                    </Badge>
                </div>
            {/if}
        </div>
    </div>

    <!-- ─── Timeline ──────────────────────────────────────────────── -->
    <div class="px-8 py-10">
        {#if topics.length === 0}
            <div class="flex flex-col items-center justify-center py-24 text-center">
                <div class="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <History class="h-8 w-8 text-gray-300" />
                </div>
                <h3 class="text-lg font-bold text-gray-600 mb-2">No topic history yet</h3>
                <p class="text-sm text-gray-400 max-w-xs leading-relaxed">
                    This group hasn't submitted any topics yet.
                </p>
            </div>
        {:else}
            <div class="relative">
                <!-- Vertical line -->
                <div class="absolute left-[168px] top-0 bottom-0 w-px bg-gray-200"></div>

                {#each topics as topic, index}
                    {@const cfg = getCfg(topic.status)}
                    {@const dt = formatDate(topic.submittedAt)}
                    {@const isLatest = index === 0}

                    <div class="relative flex gap-0 mb-8">
                        <!-- Left: timestamp -->
                        <div class="w-[152px] shrink-0 text-right pr-5 pt-5">
                            <p class="text-sm font-bold text-gray-900">{dt.date}</p>
                            <p class="text-xs text-gray-400 mt-0.5">{dt.time}</p>
                        </div>

                        <!-- Dot -->
                        <div class="relative w-9 shrink-0 flex justify-center pt-5">
                            <div class="h-4 w-4 rounded-full {cfg.dot} ring-4 ring-white shadow-sm z-10 relative"></div>
                        </div>

                        <!-- Card -->
                        <div class="flex-1 pl-4">
                            <div class="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-orange-200 hover:shadow-sm transition-all">

                                <!-- Card Header -->
                                <div class="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                                    <div class="flex items-start gap-4 min-w-0 flex-1">
                                        {#if topic.logoUrl}
                                            <img
                                                src={topic.logoUrl}
                                                alt="Logo"
                                                class="h-12 w-12 rounded-xl object-cover border border-gray-200 shrink-0"
                                                onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                                            />
                                        {:else}
                                            <div class="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                                <BookOpen class="h-5 w-5 text-gray-400" />
                                            </div>
                                        {/if}

                                        <div class="min-w-0">
                                            <div class="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    v{topic.versionNumber}
                                                </span>
                                                <span class="text-gray-300">·</span>
                                                <span class="text-xs text-gray-400">#{topic.topicId}</span>

                                                {#if topic.isChangeRequest}
                                                    <Badge class="bg-blue-100 text-blue-700 border-blue-200 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase gap-1">
                                                        <RefreshCwIcon class="w-3 h-3" />
                                                        Change Request
                                                    </Badge>
                                                {:else}
                                                    <Badge class="bg-gray-100 text-gray-500 border-gray-200 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                                                        Initial
                                                    </Badge>
                                                {/if}

                                                {#if isLatest}
                                                    <Badge class="bg-orange-100 text-orange-600 border-orange-200 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                                                        Latest
                                                    </Badge>
                                                {/if}
                                            </div>

                                            <h3 class="text-xl font-extrabold text-gray-900 leading-snug">
                                                {topic.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <Badge class={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide gap-1.5 ${cfg.badge}`}>
                                        <svelte:component this={cfg.icon} class="h-3.5 w-3.5" />
                                        {topic.status}
                                    </Badge>
                                </div>

                                <!-- Card Body -->
                                <div class="px-6 py-5 space-y-5">
                                    <!-- Description + Objectives -->
                                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        <div>
                                            <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                Description
                                            </p>
                                            <p class="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                                                {topic.description || "No description provided."}
                                            </p>
                                        </div>
                                        <div>
                                            <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                Objectives
                                            </p>
                                            <p class="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                                                {topic.objectives || "No objectives provided."}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator class="bg-gray-100" />

                                    <!-- Footer: submitter + feedback -->
                                    <div class="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                                        <!-- Submitted by -->
                                        <div class="flex items-center gap-3">
                                            <div class="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold shrink-0">
                                                {getInitials(topic.submittedBy?.fullName ?? "")}
                                            </div>
                                            <div>
                                                <p class="text-xs text-gray-400 mb-0.5">Submitted by</p>
                                                <p class="text-base font-semibold text-gray-900">
                                                    {topic.submittedBy?.fullName}
                                                    <span class="ml-1.5 text-sm font-normal text-gray-400 font-mono">
                                                        {topic.submittedBy?.studentCode}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <!-- Feedback -->
                                        {#if topic.reviewFeedback}
                                            <div class="xl:max-w-lg bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                                                <p class="text-xs font-bold text-red-500 uppercase tracking-widest mb-1.5">
                                                    Review Feedback
                                                </p>
                                                <p class="text-base text-red-800 leading-relaxed">
                                                    {topic.reviewFeedback}
                                                </p>
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}

                <!-- End of history -->
                <div class="relative flex gap-0">
                    <div class="w-[152px] shrink-0"></div>
                    <div class="w-9 shrink-0 flex justify-center">
                        <div class="h-9 w-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                            <Flag class="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    <div class="pl-4 pt-2">
                        <span class="text-base font-semibold text-gray-400">End of history</span>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>