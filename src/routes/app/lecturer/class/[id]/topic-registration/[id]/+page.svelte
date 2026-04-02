<script lang="ts">
    import type { PageData } from "./$types";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Label } from "$lib/components/ui/label";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import { ArrowLeftIcon, ThumbsUp, ThumbsDown } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let { data }: { data: PageData } = $props();

    const topic = $derived(data.topicDetail);

    type ReviewAction = "Approved" | "Rejected";
    let dialogOpen = $state(false);
    let reviewAction = $state<ReviewAction>("Approved");
    let reviewFeedback = $state("");

    function openReviewDialog(action: ReviewAction) {
        reviewAction = action;
        reviewFeedback = "";
        dialogOpen = true;
    }

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

    function getStatusVariant(status: string) {
        switch (status) {
            case "Pending":
                return "bg-orange-50 text-orange-600 border-orange-200";
            case "Approved":
                return "bg-green-50 text-green-700 border-green-200";
            case "Rejected":
                return "bg-red-50 text-red-600 border-red-200";
            default:
                return "bg-gray-50 text-gray-600 border-gray-200";
        }
    }
</script>

<div class="min-h-screen bg-white pt-16 font-sans">
    <!-- ── Sticky Top Bar ───────────────────────────────────────── -->
    <div
        class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm"
    >
        <Button
            variant="ghost"
            onclick={() =>
                goto(`/app/lecturer/class/${data.classId}/topic-registration`)}
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Back to List</span>
        </Button>

        <div class="flex items-center gap-2">
            {#if topic.status !== "Approved"}
                <Button
                    variant="outline"
                    class="h-9 gap-1.5 border-green-200 bg-white px-3 text-green-700 hover:border-green-300 hover:bg-green-50 cursor-pointer"
                    onclick={() => openReviewDialog("Approved")}
                >
                    <ThumbsUp class="h-4 w-4" />
                    <span class="hidden sm:inline">Approve</span>
                </Button>
            {/if}

            {#if topic.status !== "Rejected"}
                <Button
                    variant="outline"
                    class="h-9 gap-1.5 border-red-200 bg-white px-3 text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer"
                    onclick={() => openReviewDialog("Rejected")}
                >
                    <ThumbsDown class="h-4 w-4" />
                    <span class="hidden sm:inline">Reject</span>
                </Button>
            {/if}
        </div>
    </div>

    <!-- ── Main Content ─────────────────────────────────────────── -->
    <div class="px-6 py-8 space-y-6">
        <!-- Page Header -->
        <div
            class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between"
        >
            <div>
                <h1
                    class="text-3xl font-extrabold tracking-tight text-gray-900"
                >
                    Topic Detail
                </h1>
                <p class="mt-1 text-sm text-gray-500">
                    Detailed information and review status of the submitted
                    topic.
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <Badge
                    class={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusVariant(topic.status)}`}
                >
                    {topic.status}
                </Badge>
                <Badge
                    class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600"
                >
                    Version {topic.versionNumber}
                </Badge>
            </div>
        </div>

        <!-- Hero / Summary -->
        <div
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
            <div class="grid grid-cols-1 gap-0 xl:grid-cols-[1.3fr_420px]">
                <!-- Left -->
                <div class="p-6 xl:p-8">
                    <div class="flex items-start gap-4">
                        {#if topic.logoUrl}
                            <img
                                src={topic.logoUrl}
                                alt="Project logo"
                                class="h-16 w-16 shrink-0 rounded-xl border border-gray-200 object-cover"
                                onerror={(e) => {
                                    (
                                        e.currentTarget as HTMLImageElement
                                    ).style.display = "none";
                                }}
                            />
                        {/if}

                        <div class="min-w-0 flex-1">
                            <h2
                                class="text-2xl font-bold leading-tight text-gray-900"
                            >
                                {topic.title}
                            </h2>
                            <p class="mt-2 text-sm text-gray-500">
                                Submitted at {formatDate(topic.submittedAt)}
                            </p>
                        </div>
                    </div>

                    <div class="mt-6">
                        <p
                            class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400"
                        >
                            Description
                        </p>
                        <div
                            class="rounded-xl border border-gray-100 bg-gray-50 p-4"
                        >
                            <p class="text-sm leading-relaxed text-gray-700">
                                {topic.description ?? "—"}
                            </p>
                        </div>
                    </div>

                    {#if topic.objectives}
                        <div class="mt-5">
                            <p
                                class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400"
                            >
                                Objectives
                            </p>
                            <div
                                class="rounded-xl border border-gray-100 bg-gray-50 p-4"
                            >
                                <p
                                    class="text-sm leading-relaxed text-gray-700"
                                >
                                    {topic.objectives}
                                </p>
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Right -->
                <div
                    class="border-t border-gray-100 bg-gray-50/70 p-6 xl:border-l xl:border-t-0 xl:p-8"
                >
                    <p
                        class="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400"
                    >
                        Overview
                    </p>

                    <div class="grid grid-cols-2 gap-4">
                        <div
                            class="rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <p class="text-xs text-gray-400">Group</p>
                            <p class="mt-1 text-sm font-semibold text-gray-900">
                                {topic.group?.groupName ?? "—"}
                            </p>
                        </div>

                        <div
                            class="rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <p class="text-xs text-gray-400">Class Code</p>
                            <p class="mt-1 text-sm font-semibold text-gray-900">
                                {topic.group?.classCode ?? "—"}
                            </p>
                        </div>

                        <div
                            class="rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <p class="text-xs text-gray-400">Members</p>
                            <p class="mt-1 text-sm font-semibold text-gray-900">
                                {topic.group?.memberCount ?? 0}
                            </p>
                        </div>

                        <div
                            class="rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <p class="text-xs text-gray-400">Group Status</p>
                            <p class="mt-1 text-sm font-semibold text-gray-900">
                                {topic.group?.status ?? "—"}
                            </p>
                        </div>
                    </div>

                    <div
                        class="mt-4 rounded-xl border border-gray-200 bg-white p-4"
                    >
                        <p class="text-xs text-gray-400">Submitted By</p>
                        <p class="mt-1 text-sm font-semibold text-gray-900">
                            {topic.submittedBy?.fullName ?? "—"}
                        </p>
                        <p class="mt-1 text-xs text-gray-500">
                            {topic.submittedBy?.studentCode ?? "—"}
                        </p>
                        <p class="mt-1 text-xs text-gray-500 break-all">
                            {topic.submittedBy?.email ?? "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detail Blocks -->
        <div class="grid grid-cols-1 gap-6 2xl:grid-cols-12">
            <!-- Topic Information -->
            <div
                class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-5"
            >
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-gray-400"
                    >
                        Topic Information
                    </p>
                </div>

                <div class="p-0">
                    {#each [{ label: "Title", value: topic.title }, { label: "Description", value: topic.description }, { label: "Version", value: `v${topic.versionNumber}` }, { label: "Submitted At", value: formatDate(topic.submittedAt) }] as field, i}
                        <div
                            class="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[160px_1fr]"
                        >
                            <span class="text-sm font-medium text-gray-500">
                                {field.label}
                            </span>
                            <span
                                class="text-sm font-medium leading-relaxed text-gray-900"
                            >
                                {field.value ?? "—"}
                            </span>
                        </div>
                        {#if i < 3}<Separator class="bg-gray-100" />{/if}
                    {/each}

                    <Separator class="bg-gray-100" />

                    <div
                        class="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[160px_1fr]"
                    >
                        <span class="text-sm font-medium text-gray-500">
                            Status
                        </span>
                        <div>
                            <Badge
                                class={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${getStatusVariant(topic.status)}`}
                            >
                                {topic.status}
                            </Badge>
                        </div>
                    </div>

                    {#if topic.objectives}
                        <Separator class="bg-gray-100" />
                        <div
                            class="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[160px_1fr]"
                        >
                            <span class="text-sm font-medium text-gray-500">
                                Objectives
                            </span>
                            <span class="text-sm leading-relaxed text-gray-900">
                                {topic.objectives}
                            </span>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Submitted By -->
            <div
                class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-3"
            >
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-gray-400"
                    >
                        Submitted By
                    </p>
                </div>

                <div class="space-y-4 px-6 py-5">
                    <div>
                        <p class="mb-1 text-xs text-gray-400">Full Name</p>
                        <p class="text-sm font-semibold text-gray-900">
                            {topic.submittedBy?.fullName ?? "—"}
                        </p>
                    </div>

                    <div>
                        <p class="mb-1 text-xs text-gray-400">Student Code</p>
                        <p class="font-mono text-sm font-medium text-gray-900">
                            {topic.submittedBy?.studentCode ?? "—"}
                        </p>
                    </div>

                    <div>
                        <p class="mb-1 text-xs text-gray-400">Email</p>
                        <p class="break-all text-sm font-medium text-gray-900">
                            {topic.submittedBy?.email ?? "—"}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Group Information -->
            <div
                class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-4"
            >
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-gray-400"
                    >
                        Group Information
                    </p>
                </div>

                <div class="space-y-4 px-6 py-5">
                    <div>
                        <p class="mb-1 text-xs text-gray-400">Group Name</p>
                        <p class="text-sm font-semibold text-gray-900">
                            {topic.group?.groupName ?? "—"}
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="mb-1 text-xs text-gray-400">Class Code</p>
                            <p class="text-sm font-medium text-gray-900">
                                {topic.group?.classCode ?? "—"}
                            </p>
                        </div>

                        <div>
                            <p class="mb-1 text-xs text-gray-400">Members</p>
                            <p class="text-sm font-medium text-gray-900">
                                {topic.group?.memberCount ?? 0}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p class="mb-1 text-xs text-gray-400">Group Status</p>
                        <Badge
                            class="rounded-full border border-gray-200 bg-gray-100 text-[11px] font-semibold text-gray-600 shadow-none"
                        >
                            {topic.group?.status ?? "—"}
                        </Badge>
                    </div>
                </div>
            </div>

            <!-- Review Information -->
            <div
                class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-12"
            >
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-gray-400"
                    >
                        Review Information
                    </p>
                </div>

                <div
                    class="grid grid-cols-1 gap-6 px-6 py-5 xl:grid-cols-[260px_260px_1fr]"
                >
                    <div>
                        <p class="mb-1 text-xs text-gray-400">Reviewed By</p>
                        <p class="text-sm font-semibold text-gray-900">
                            {topic.reviewedBy?.fullName ?? "—"}
                        </p>
                        {#if topic.reviewedBy?.email}
                            <p class="mt-1 text-xs text-gray-500 break-all">
                                {topic.reviewedBy.email}
                            </p>
                        {/if}
                    </div>

                    <div>
                        <p class="mb-1 text-xs text-gray-400">Reviewed At</p>
                        <p
                            class={`text-sm ${
                                topic.reviewedAt
                                    ? "text-gray-900"
                                    : "italic text-gray-400"
                            }`}
                        >
                            {formatDate(topic.reviewedAt)}
                        </p>
                    </div>

                    <div>
                        <p class="mb-1 text-xs text-gray-400">Feedback</p>
                        <div
                            class="rounded-xl border border-gray-100 bg-gray-50 p-4"
                        >
                            <p
                                class={`text-sm leading-relaxed ${
                                    topic.reviewFeedback
                                        ? "text-gray-900"
                                        : "italic text-gray-400"
                                }`}
                            >
                                {topic.reviewFeedback ?? "No feedback provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Review Dialog -->
<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="sm:max-w-md bg-white">
        <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2">
                {#if reviewAction === "Approved"}
                    <ThumbsUp class="h-5 w-5 text-green-600" />
                    <span class="text-gray-900">Approve Topic</span>
                {:else}
                    <ThumbsDown class="h-5 w-5 text-red-600" />
                    <span class="text-gray-900">Reject Topic</span>
                {/if}
            </Dialog.Title>
            <Dialog.Description class="text-gray-500">
                {#if reviewAction === "Approved"}
                    You are about to approve this topic. You may leave optional
                    feedback for the student.
                {:else}
                    You are about to reject this topic. Please provide feedback
                    so the student knows what to improve.
                {/if}
            </Dialog.Description>
        </Dialog.Header>

        <form
            method="POST"
            action="?/reviewTopic"
            use:enhance={() => {
                const toastId = toast.loading(
                    reviewAction === "Approved"
                        ? "Approving topic..."
                        : "Rejecting topic...",
                );
                return async ({ result, update }) => {
                    if (result.type === "success") {
                        toast.success(
                            reviewAction === "Approved"
                                ? "Topic approved successfully!"
                                : "Topic rejected.",
                            { id: toastId },
                        );
                        dialogOpen = false;
                        await goto(
                            `/app/lecturer/class/${data.classId}/topic-registration`,
                        );
                    } else {
                        const msg =
                            result.type === "failure"
                                ? ((result.data?.message as string) ??
                                  "Action failed")
                                : "An unexpected error occurred";
                        toast.error(msg, { id: toastId });
                        await update();
                    }
                };
            }}
            class="flex flex-col gap-4 pt-2"
        >
            <input type="hidden" name="topicId" value={topic.topicId} />
            <input type="hidden" name="status" value={reviewAction} />

            <div class="flex flex-col gap-2">
                <Label
                    for="reviewFeedback"
                    class="text-sm font-medium text-gray-900"
                >
                    Feedback
                    {#if reviewAction === "Approved"}
                        <span class="ml-1 font-normal text-gray-400">
                            (Optional)
                        </span>
                    {/if}
                </Label>

                <Textarea
                    id="reviewFeedback"
                    name="reviewFeedback"
                    bind:value={reviewFeedback}
                    placeholder={reviewAction === "Approved"
                        ? "Any comments for the student..."
                        : "Explain why this topic is being rejected..."}
                    required={reviewAction === "Rejected"}
                    class="min-h-[100px] resize-y border-gray-200 bg-white focus-visible:ring-orange-500"
                />

                {#if reviewAction === "Rejected"}
                    <p class="text-xs text-red-500">
                        * Feedback is required when rejecting a topic.
                    </p>
                {/if}
            </div>

            <Dialog.Footer class="mt-2 gap-2 sm:gap-2">
                <Dialog.Close>
                    <Button
                        type="button"
                        variant="outline"
                        class="border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </Button>
                </Dialog.Close>

                {#if reviewAction === "Approved"}
                    <Button
                        type="submit"
                        class="bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-sm"
                    >
                        <ThumbsUp class="mr-1.5 h-4 w-4" />
                        Confirm Approve
                    </Button>
                {:else}
                    <Button
                        type="submit"
                        class="bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-sm"
                    >
                        <ThumbsDown class="mr-1.5 h-4 w-4" />
                        Confirm Reject
                    </Button>
                {/if}
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
