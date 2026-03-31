<script lang="ts">
    import type { PageData } from "./$types";
    import * as Card from "$lib/components/ui/card";
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
        Pending: "border-orange-400 text-orange-500 bg-orange-50",
        Approved: "border-green-400 text-green-600 bg-green-50",
        Rejected: "border-red-400 text-red-500 bg-red-50",
    };

    console.log("logo: ", data.topics.logoUrl);
</script>

<div class="min-h-screen bg-gray-50 p-6 pt-20 font-sans">
    <a
        class="mb-5 flex w-fit items-center gap-2 rounded-2xl px-2 py-1 text-xl transition-all duration-200 hover:bg-amber-200"
        href="/app/lecturer/class/{data.classId}"
    >
        <ArrowLeftIcon /> Back to Dashboard
    </a>

    <div class="mx-auto max-w-7xl space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Topic Review</h1>
            <p class="mt-1 text-sm text-gray-500">
                Review and approve or reject student project topic submissions.
            </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {#each statCards as stat, i}
                <Card.Root class="border border-gray-100 bg-white shadow-sm">
                    <Card.Content class="flex items-center gap-4 p-3">
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

        <!-- Topic Cards -->
        {#if topics.length === 0}
            <div class="py-20 text-center text-gray-400">No topics found.</div>
        {:else}
            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {#each topics as topic (topic.topicId)}
                    <Card.Root
                        class="group flex flex-col justify-between border border-gray-100 bg-white p-0 shadow-sm transition-all hover:border-orange-400 hover:shadow-md"
                    >
                        <Card.Content class="flex flex-col gap-3 p-5">
                            <!-- Logo -->
                            {#if topic.logoUrl}
                                <img
                                    src={topic.logoUrl}
                                    alt="Project logo"
                                    class="h-12 w-12 rounded-lg object-cover border border-zinc-200"
                                />
                            {/if}

                            <div class="flex items-start justify-between gap-2">
                                <h3
                                    class="text-[18px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-orange-500"
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
                                    class="block h-1 w-1 rounded-full bg-gray-700"
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
                            class="flex items-center justify-between gap-2 border-t border-gray-100 bg-stone-100 px-5 py-3"
                        >
                            <span class="text-xs text-gray-400">
                                <span class="font-semibold text-gray-600"
                                    >{topic.submittedBy?.fullName}</span
                                >
                                ({topic.submittedBy?.studentCode})
                                <br />{formatDate(topic.submittedAt)}
                            </span>

                            <div class="flex shrink-0 items-center gap-1.5">
                                <!-- View Detail -->
                                <Button
                                    variant="outline"
                                    class="h-8 cursor-pointer gap-1 border-zinc-300 px-2.5 text-xs text-zinc-500 hover:bg-zinc-50"
                                    onclick={() =>
                                        goto(
                                            `/app/lecturer/class/${data.classId}/topic-registration/${topic.topicId}`,
                                        )}
                                >
                                    <BookOpen class="h-3.5 w-3.5" />
                                    Detail
                                </Button>

                                <!-- Approve -->
                                {#if topic.status !== "Approved"}
                                    <Button
                                        variant="outline"
                                        class="h-8 cursor-pointer gap-1 border-green-300 px-2.5 text-xs text-green-600 hover:bg-green-50"
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

                                <!-- Reject -->
                                {#if topic.status !== "Rejected"}
                                    <Button
                                        variant="outline"
                                        class="h-8 cursor-pointer gap-1 border-red-300 px-2.5 text-xs text-red-500 hover:bg-red-50"
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
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Review Dialog -->
<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2">
                {#if reviewAction === "Approved"}
                    <ThumbsUp class="h-5 w-5 text-green-500" />
                    <span>Approve Topic</span>
                {:else}
                    <ThumbsDown class="h-5 w-5 text-red-500" />
                    <span>Reject Topic</span>
                {/if}
            </Dialog.Title>
            <Dialog.Description>
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
            class="flex flex-col gap-4 pt-1"
        >
            <input type="hidden" name="topicId" value={selectedTopicId} />
            <input type="hidden" name="status" value={reviewAction} />

            <div class="flex flex-col gap-1.5">
                <Label
                    for="reviewFeedback"
                    class="text-sm font-medium text-zinc-900"
                >
                    Feedback
                    {#if reviewAction === "Approved"}
                        <span class="ml-1 font-normal text-zinc-400"
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
                    class="min-h-[100px] resize-y border-zinc-200 focus-visible:ring-orange-500"
                />
                {#if reviewAction === "Rejected"}
                    <p class="text-xs text-zinc-400">
                        Feedback is required when rejecting a topic.
                    </p>
                {/if}
            </div>

            <Dialog.Footer class="gap-2 sm:gap-2">
                <Dialog.Close>
                    <Button
                        type="button"
                        variant="outline"
                        class="border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    >
                        Cancel
                    </Button>
                </Dialog.Close>

                {#if reviewAction === "Approved"}
                    <Button
                        type="submit"
                        class="bg-green-600 text-white hover:bg-green-700"
                    >
                        <ThumbsUp class="mr-1.5 h-4 w-4" />
                        Confirm Approve
                    </Button>
                {:else}
                    <Button
                        type="submit"
                        class="bg-red-500 text-white hover:bg-red-600"
                    >
                        <ThumbsDown class="mr-1.5 h-4 w-4" />
                        Confirm Reject
                    </Button>
                {/if}
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
