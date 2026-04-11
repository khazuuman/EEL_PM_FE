<script lang="ts">
    import type { PageData } from "./$types";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import { Button } from "$lib/components/ui/button";
    import {
        ArrowLeftIcon,
        BookOpenIcon,
        CheckIcon,
        UserIcon,
        UsersIcon,
        XIcon,
    } from "lucide-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import ReviewDialog from "../../../../components/ReviewDialog.svelte";

    let { data }: { data: PageData } = $props();
    const topic = data.topicDetail;

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
    <div
        class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-8 py-3 shadow-sm backdrop-blur-sm"
    >
        <Button
            variant="ghost"
            onclick={() => history.back()}
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Back</span>
        </Button>

        <div class="flex items-center gap-2">
            <Badge
                class={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${statusColor[topic.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}
            >
                {topic.status}
            </Badge>

            {#if topic.status === "Pending"}
                <Button
                    variant="outline"
                    size="sm"
                    class="h-9 px-4 text-sm border-green-200 text-green-700 bg-green-50 hover:bg-green-100 cursor-pointer"
                    onclick={() => openDialog("approve")}
                >
                    <CheckIcon class="h-4 w-4 mr-1.5" />
                    Approve
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    class="h-9 px-4 text-sm border-red-200 text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer"
                    onclick={() => openDialog("reject")}
                >
                    <XIcon class="h-4 w-4 mr-1.5" />
                    Reject
                </Button>
            {/if}
        </div>
    </div>

    <!-- ─── Overview Banner ───────────────────────────────────────── -->
    <div class="border-b border-gray-100 bg-gray-50/60 px-8 py-6">
        <div class="flex items-start gap-5">
            {#if topic.logoUrl}
                <img
                    src={topic.logoUrl}
                    alt="Project logo"
                    class="h-16 w-16 shrink-0 rounded-xl border border-gray-200 object-cover shadow-sm"
                />
            {/if}
            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                    <h1
                        class="text-3xl font-extrabold tracking-tight text-gray-900"
                    >
                        {topic.title}
                    </h1>
                    <Badge
                        class="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-500"
                    >
                        v{topic.versionNumber}
                    </Badge>
                </div>
                <p class="mt-1.5 text-base text-gray-500">
                    Submitted {formatDate(topic.submittedAt)}
                </p>
            </div>
        </div>
    </div>

    <!-- ─── Content ──────────────────────────────────────────────── -->
    <div class="px-8 py-8 space-y-10">
        <!-- § Description & Objectives -->
        <section class="space-y-4">
            <h2 class="flex items-center gap-2 text-lg font-bold text-gray-900">
                <BookOpenIcon class="h-5 w-5 text-amber-500" />
                Topic Content
            </h2>

            <div class="space-y-4">
                <div
                    class="rounded-xl border border-gray-200 bg-gray-50/60 px-6 py-5"
                >
                    <p
                        class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500"
                    >
                        Description
                    </p>
                    <p
                        class="text-base leading-relaxed text-gray-700 whitespace-pre-wrap"
                    >
                        {topic.description ?? "No description provided."}
                    </p>
                </div>

                {#if topic.objectives}
                    <div
                        class="rounded-xl border border-gray-200 bg-gray-50/60 px-6 py-5"
                    >
                        <p
                            class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500"
                        >
                            Objectives
                        </p>
                        <p
                            class="text-base leading-relaxed text-gray-700 whitespace-pre-wrap"
                        >
                            {topic.objectives}
                        </p>
                    </div>
                {/if}
            </div>
        </section>

        <Separator />

        <!-- § Group & Submitter -->
        <section class="space-y-4">
            <h2 class="flex items-center gap-2 text-lg font-bold text-gray-900">
                <UsersIcon class="h-5 w-5 text-amber-500" />
                Group & Submitter
            </h2>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <!-- Submitted By -->
                <div
                    class="rounded-xl border border-gray-200 bg-gray-50/60 px-6 py-5 space-y-4"
                >
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-gray-500"
                    >
                        Submitted By
                    </p>
                    <div class="flex items-center gap-3">
                        <div
                            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-lg"
                        >
                            {topic.submittedBy?.fullName?.charAt(0) ?? "?"}
                        </div>
                        <div class="space-y-0.5">
                            <p class="text-base font-semibold text-gray-900">
                                {topic.submittedBy?.fullName ?? "—"}
                            </p>
                            <p class="font-mono text-sm text-gray-500">
                                {topic.submittedBy?.studentCode ?? "—"}
                            </p>
                            <p class="text-sm text-gray-500 break-all">
                                {topic.submittedBy?.email ?? "—"}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Group Info -->
                <div
                    class="rounded-xl border border-gray-200 bg-gray-50/60 px-6 py-5 space-y-4"
                >
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-gray-500"
                    >
                        Group Information
                    </p>
                    <p class="text-xl font-bold text-gray-900">
                        {topic.group?.groupName ?? "—"}
                    </p>
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <p class="text-sm text-gray-400 mb-0.5">Class</p>
                            <p class="text-base font-semibold text-gray-900">
                                {topic.group?.classCode ?? "—"}
                            </p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-400 mb-0.5">Members</p>
                            <p class="text-base font-semibold text-gray-900">
                                {topic.group?.memberCount ?? 0}
                            </p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-400 mb-0.5">Status</p>
                            <Badge
                                class={`rounded-full border text-[11px] font-semibold ${statusColor[topic.group?.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}
                            >
                                {topic.group?.status ?? "—"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <Separator />

        <!-- § Review Information -->
        <section class="space-y-4">
            <h2 class="flex items-center gap-2 text-lg font-bold text-gray-900">
                <UserIcon class="h-5 w-5 text-amber-500" />
                Review Information
            </h2>

            <div
                class="rounded-xl border border-gray-200 bg-gray-50/60 px-6 py-5 space-y-5"
            >
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <p class="mb-1 text-sm text-gray-400">Reviewed By</p>
                        <p class="text-base font-semibold text-gray-900">
                            {topic.reviewedBy?.fullName ?? "—"}
                        </p>
                        {#if topic.reviewedBy?.email}
                            <p class="text-sm text-gray-500 mt-0.5 break-all">
                                {topic.reviewedBy.email}
                            </p>
                        {/if}
                    </div>
                    <div>
                        <p class="mb-1 text-sm text-gray-400">Reviewed At</p>
                        <p
                            class={`text-base font-medium ${topic.reviewedAt ? "text-gray-900" : "italic text-gray-400"}`}
                        >
                            {formatDate(topic.reviewedAt)}
                        </p>
                    </div>
                </div>

                <div>
                    <p class="mb-2 text-sm text-gray-400">Feedback</p>
                    <div
                        class="rounded-xl border border-gray-100 bg-white px-5 py-4"
                    >
                        <p
                            class="text-base leading-relaxed whitespace-pre-wrap {topic.reviewFeedback
                                ? 'text-gray-800'
                                : 'italic text-gray-400'}"
                        >
                            {topic.reviewFeedback ??
                                "No feedback provided yet."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
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
