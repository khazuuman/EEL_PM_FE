<script lang="ts">
    import type { PageData } from "./$types";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Label } from "$lib/components/ui/label";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import {
        BookOpen,
        Clock,
        CheckCircle2,
        XCircle,
        Users,
        Layers,
        ArrowLeftIcon,
        ThumbsUp,
        ThumbsDown,
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

    // Dialog state
    type ReviewAction = "Approved" | "Rejected";
    let dialogOpen = $state(false);
    let reviewAction = $state<ReviewAction>("Approved");
    let reviewFeedback = $state("");
    let selectedTopicId = $state<number | null>(null);

    function openReviewDialog(topicId: number, action: ReviewAction) {
        selectedTopicId = topicId;
        reviewAction = action;
        reviewFeedback = "";
        dialogOpen = true;
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
</script>

<div class="min-h-screen bg-white pt-5 font-sans">
    <!-- ── Sticky Top Bar ──────────────────────────────────────── -->
    <div class="sticky top-0 z-10 px-6 py-3 flex items-center">
        <Button
            variant="ghost"
            onclick={() => goto(`/app/lecturer/class/${data.classId}`)}
            class="flex items-center gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-3 py-2 transition-all cursor-pointer"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            <span class="text-sm font-semibold">Home</span>
        </Button>
    </div>

    <!-- ── Main Content ────────────────────────────────────────── -->
    <div class="px-6 py-6 space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-2xl font-extrabold text-gray-900">Topic Review</h1>
            <p class="mt-1 text-sm text-gray-500">
                Review and approve or reject student project topic submissions.
            </p>
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

        <!-- Topic Cards Grid -->
        {#if topics.length === 0}
            <div
                class="col-span-full flex flex-col items-center justify-center py-24 text-gray-400 gap-3"
            >
                <BookOpen class="w-14 h-14 text-gray-300" />
                <p class="text-lg font-semibold text-gray-500">
                    No topics found
                </p>
                <p class="text-sm text-gray-400">
                    There are no topics pending review.
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
                            <!-- Logo & Title -->
                            <div class="flex items-start gap-3">
                                {#if topic.logoUrl}
                                    <img
                                        src={topic.logoUrl}
                                        alt="Project logo"
                                        class="h-12 w-12 shrink-0 rounded-lg object-cover border border-gray-200"
                                        onerror={(e) =>
                                            ((
                                                e.currentTarget as HTMLImageElement
                                            ).style.display = "none")}
                                    />
                                {/if}
                                <div class="flex-1 min-w-0">
                                    <div
                                        class="flex items-start justify-between gap-2"
                                    >
                                        <h3
                                            class="text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-orange-600 line-clamp-2"
                                        >
                                            {topic.title}
                                        </h3>
                                        <span
                                            class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide {statusColors[
                                                topic.status
                                            ] ??
                                                'border-gray-200 bg-gray-50 text-gray-500'}"
                                        >
                                            {topic.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Meta -->
                            <div class="flex flex-col gap-1.5 mt-2">
                                <div
                                    class="flex items-center gap-2 text-sm text-gray-600"
                                >
                                    <Layers
                                        class="h-4 w-4 shrink-0 text-orange-500"
                                    />
                                    <span class="font-semibold text-gray-800"
                                        >{topic.group?.classCode}</span
                                    >
                                    <span
                                        class="block h-1 w-1 rounded-full bg-gray-300 shrink-0"
                                    ></span>
                                    <span class="truncate"
                                        >{topic.group?.groupName}</span
                                    >
                                </div>

                                <div
                                    class="flex items-center gap-2 text-sm text-gray-600"
                                >
                                    <Users
                                        class="h-4 w-4 shrink-0 text-gray-400"
                                    />
                                    <span
                                        >{topic.group?.memberCount} Members</span
                                    >
                                </div>
                            </div>

                            {#if topic.description}
                                <p
                                    class="line-clamp-2 text-sm text-gray-500 mt-1"
                                >
                                    {topic.description}
                                </p>
                            {/if}
                        </div>

                        <!-- Card Footer -->
                        <div
                            class="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4"
                        >
                            <!-- Submitter Info -->
                            <div
                                class="flex items-center justify-between gap-2 text-xs text-gray-500"
                            >
                                <div class="truncate">
                                    <span class="font-semibold text-gray-700"
                                        >{topic.submittedBy?.fullName}</span
                                    >
                                    ({topic.submittedBy?.studentCode})
                                </div>
                                <span class="shrink-0 text-gray-400"
                                    >{formatDate(topic.submittedAt)}</span
                                >
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    class="flex-1 h-8 cursor-pointer gap-1.5 border-gray-300 px-2.5 text-xs text-gray-600 hover:bg-white hover:text-gray-900 bg-white"
                                    onclick={() =>
                                        goto(
                                            `/app/lecturer/class/${data.classId}/topic-registration/${topic.topicId}`,
                                        )}
                                >
                                    <BookOpen class="h-3.5 w-3.5" />
                                    Detail
                                </Button>

                                {#if topic.status !== "Approved"}
                                    <Button
                                        variant="outline"
                                        class="flex-1 h-8 cursor-pointer gap-1.5 border-green-200 px-2.5 text-xs text-green-700 hover:bg-green-50 hover:border-green-300 bg-white"
                                        onclick={() =>
                                            openReviewDialog(
                                                topic.topicId,
                                                "Approved",
                                            )}
                                    >
                                        <ThumbsUp class="h-3.5 w-3.5" />
                                        Approve
                                    </Button>
                                {/if}

                                {#if topic.status !== "Rejected"}
                                    <Button
                                        variant="outline"
                                        class="flex-1 h-8 cursor-pointer gap-1.5 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-300 bg-white"
                                        onclick={() =>
                                            openReviewDialog(
                                                topic.topicId,
                                                "Rejected",
                                            )}
                                    >
                                        <ThumbsDown class="h-3.5 w-3.5" />
                                        Reject
                                    </Button>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
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
                        await update();
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
            <input type="hidden" name="topicId" value={selectedTopicId} />
            <input type="hidden" name="status" value={reviewAction} />

            <div class="flex flex-col gap-2">
                <Label
                    for="reviewFeedback"
                    class="text-sm font-medium text-gray-900"
                >
                    Feedback
                    {#if reviewAction === "Approved"}
                        <span class="ml-1 font-normal text-gray-400"
                            >(Optional)</span
                        >
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
                    class="min-h-[100px] resize-y border-gray-200 focus-visible:ring-orange-500 bg-white"
                />
                {#if reviewAction === "Rejected"}
                    <p class="text-xs text-red-500">
                        * Feedback is required when rejecting a topic.
                    </p>
                {/if}
            </div>

            <Dialog.Footer class="gap-2 sm:gap-2 mt-2">
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
