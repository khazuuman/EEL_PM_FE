<script lang="ts">
    import type { PageData } from "./$types";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import { Button } from "$lib/components/ui/button";
    import {
        ArrowLeftIcon,
        BookOpenIcon,
        CheckIcon,
        UsersIcon,
        XIcon,
        ClockIcon,
        RefreshCwIcon,
    } from "lucide-svelte";
    import { invalidateAll } from "$app/navigation";
    import ReviewDialog from "../../../../components/ReviewDialog.svelte";

    let { data }: { data: PageData } = $props();
    const topic = $derived(data.topicDetail);

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return "Not reviewed yet";
        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(dateStr));
    }

    const statusColor: Record<string, string> = {
        Pending: "bg-amber-100 text-amber-700 border-amber-200",
        Approved: "bg-green-100 text-green-700 border-green-200",
        Rejected: "bg-red-100 text-red-700 border-red-200",
    };

    let arDialogOpen = $state(false);
    let arAction = $state<"approve" | "reject">("approve");

    const openDialog = (action: "approve" | "reject") => {
        arAction = action;
        arDialogOpen = true;
    };
</script>

<div class="min-h-screen bg-white font-sans">
    <!-- ─── Sticky Top Bar ─────────────────────────────────────────── -->
    {#if !topic}
        <div class="flex min-h-screen items-center justify-center">
            <p class="text-stone-400 text-sm">
                No pending topic change request found.
            </p>
        </div>
    {:else}
        <div
            class="sticky top-0 z-10 flex items-center justify-between gap-3
               border-b border-stone-200 bg-white/95 px-8 py-3
               shadow-sm backdrop-blur-sm"
        >
            <Button
                variant="ghost"
                onclick={() => history.back()}
                class="flex items-center gap-2 rounded-xl px-3 py-2
                   text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
            >
                <ArrowLeftIcon class="h-4 w-4" />
                <span class="text-sm font-semibold">Back</span>
            </Button>

            {#if topic.status === "Pending"}
                <div class="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        class="h-9 px-4 text-sm border-green-200 text-green-700
                           bg-green-50 hover:bg-green-100 cursor-pointer"
                        onclick={() => openDialog("approve")}
                    >
                        <CheckIcon class="h-4 w-4 mr-1.5" />
                        Approve
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        class="h-9 px-4 text-sm border-red-200 text-red-700
                           bg-red-50 hover:bg-red-100 cursor-pointer"
                        onclick={() => openDialog("reject")}
                    >
                        <XIcon class="h-4 w-4 mr-1.5" />
                        Reject
                    </Button>
                </div>
            {/if}
        </div>

        <!-- ─── Page Title Banner ─────────────────────────────────────── -->
        <div class="border-b border-orange-100 bg-orange-50/60 px-8 py-6">
            <div class="flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-4">
                    <div
                        class="flex h-12 w-12 shrink-0 items-center justify-center
                           rounded-xl bg-orange-100 border border-orange-200"
                    >
                        <RefreshCwIcon class="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <p
                            class="text-[10px] font-bold uppercase tracking-widest
                               text-orange-500 leading-none mb-1"
                        >
                            Lecturer Review
                        </p>
                        <h1
                            class="text-2xl font-extrabold tracking-tight text-stone-900"
                        >
                            Topic Change Request
                        </h1>
                        <p class="mt-0.5 text-sm text-stone-500">
                            Group
                            <span class="font-semibold text-stone-700">
                                {topic.group?.groupName ?? "—"}
                            </span>
                            is requesting to change their registered topic.
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Badge
                        class="rounded-full border px-3 py-1 text-xs font-semibold
                           text-stone-500 border-stone-200 bg-white"
                    >
                        v{topic.versionNumber}
                    </Badge>
                    <Badge
                        class={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest
                            ${statusColor[topic.status] ?? "bg-stone-100 text-stone-500 border-stone-200"}`}
                    >
                        {topic.status}
                    </Badge>
                </div>
            </div>
        </div>

        <!-- ─── Content ──────────────────────────────────────────────── -->
        <div class="px-8 py-8 space-y-10">
            <!-- § Proposed New Topic -->
            <section class="space-y-4">
                <h2
                    class="flex items-center gap-2 text-lg font-bold text-stone-900"
                >
                    <BookOpenIcon class="h-5 w-5 text-amber-500" />
                    Proposed New Topic
                </h2>

                <div
                    class="rounded-xl border border-orange-200 bg-orange-50/40 px-6 py-6 space-y-6"
                >
                    <!-- ✅ Logo + Title -->
                    <div class="flex items-center gap-4">
                        {#if topic.logoUrl}
                            <img
                                src={topic.logoUrl}
                                alt="Project logo"
                                class="h-16 w-16 shrink-0 rounded-xl border border-orange-200
                       object-cover shadow-sm"
                            />
                        {:else}
                            <div
                                class="flex h-16 w-16 shrink-0 items-center justify-center
                       rounded-xl border border-orange-200 bg-white text-orange-300"
                            >
                                <BookOpenIcon class="h-8 w-8" />
                            </div>
                        {/if}

                        <div>
                            <p
                                class="mb-1 text-xs font-bold uppercase tracking-widest text-stone-400"
                            >
                                Topic Title
                            </p>
                            <p
                                class="text-2xl font-extrabold text-stone-900 leading-tight"
                            >
                                {topic.title}
                            </p>
                        </div>
                    </div>

                    <Separator class="bg-orange-100" />

                    <!-- Description -->
                    <div>
                        <p
                            class="mb-2 text-xs font-bold uppercase tracking-widest text-stone-400"
                        >
                            Description
                        </p>
                        <p
                            class="text-base leading-relaxed text-stone-800 whitespace-pre-wrap"
                        >
                            {topic.description ?? "No description provided."}
                        </p>
                    </div>

                    <!-- Objectives -->
                    {#if topic.objectives}
                        <Separator class="bg-orange-100" />
                        <div>
                            <p
                                class="mb-2 text-xs font-bold uppercase tracking-widest text-stone-400"
                            >
                                Objectives
                            </p>
                            <p
                                class="text-base leading-relaxed text-stone-800 whitespace-pre-wrap"
                            >
                                {topic.objectives}
                            </p>
                        </div>
                    {/if}
                </div>
            </section>

            <Separator />

            <!-- § Submission Details -->
            <section class="space-y-4">
                <h2
                    class="flex items-center gap-2 text-lg font-bold text-stone-900"
                >
                    <UsersIcon class="h-5 w-5 text-amber-500" />
                    Submission Details
                </h2>

                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <!-- Submitted By -->
                    <div
                        class="rounded-xl border border-stone-200 bg-stone-50/60 px-6 py-5 space-y-4"
                    >
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-stone-400"
                        >
                            Submitted By
                        </p>
                        <div class="flex items-center gap-4">
                            <div
                                class="flex h-12 w-12 shrink-0 items-center justify-center
                                   rounded-full bg-amber-100 font-extrabold text-amber-700 text-xl"
                            >
                                {topic.submittedBy?.fullName?.charAt(0) ?? "?"}
                            </div>
                            <div class="space-y-1">
                                <p class="text-base font-bold text-stone-900">
                                    {topic.submittedBy?.fullName ?? "—"}
                                </p>
                                <p
                                    class="font-mono text-sm font-semibold text-stone-500"
                                >
                                    {topic.submittedBy?.studentCode ?? "—"}
                                </p>
                                <p class="text-sm text-stone-400 break-all">
                                    {topic.submittedBy?.email ?? "—"}
                                </p>
                            </div>
                        </div>
                        <div
                            class="flex items-center gap-2 pt-3 border-t border-stone-100 text-stone-400"
                        >
                            <ClockIcon class="h-4 w-4 shrink-0" />
                            <span class="text-sm"
                                >{formatDate(topic.submittedAt)}</span
                            >
                        </div>
                    </div>

                    <!-- Group Info -->
                    <div
                        class="rounded-xl border border-stone-200 bg-stone-50/60 px-6 py-5 space-y-4"
                    >
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-stone-400"
                        >
                            Group Information
                        </p>
                        <div class="flex items-center gap-4">
                            <div
                                class="flex h-12 w-12 shrink-0 items-center justify-center
                                   rounded-full bg-stone-200 text-stone-600"
                            >
                                <UsersIcon class="h-5 w-5" />
                            </div>
                            <p class="text-xl font-extrabold text-stone-900">
                                {topic.group?.groupName ?? "—"}
                            </p>
                        </div>
                        <div
                            class="grid grid-cols-3 gap-3 pt-3 border-t border-stone-100"
                        >
                            <div>
                                <p class="text-xs text-stone-400 mb-1">Class</p>
                                <p class="text-base font-bold text-stone-900">
                                    {topic.group?.classCode ?? "—"}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-stone-400 mb-1">
                                    Members
                                </p>
                                <p class="text-base font-bold text-stone-900">
                                    {topic.group?.memberCount ?? 0}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-stone-400 mb-1">
                                    Status
                                </p>
                                <Badge
                                    class={`rounded-full border text-xs font-bold
                                        ${statusColor[topic.group?.status] ?? "bg-stone-100 text-stone-500 border-stone-200"}`}
                                >
                                    {topic.group?.status ?? "—"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <ReviewDialog
            bind:open={arDialogOpen}
            target="topic"
            action={arAction}
            targetName={topic.title}
            topicId={topic.topicId}
            onSuccess={async () => {
                await invalidateAll();
            }}
        />
    {/if}
</div>
