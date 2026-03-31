<script lang="ts">
    import type { PageData } from "./$types";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import * as Card from "$lib/components/ui/card";
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

    // Dialog state
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
                return "bg-orange-500 text-white hover:bg-orange-500";
            case "Approved":
                return "bg-green-600 text-white hover:bg-green-600";
            case "Rejected":
                return "bg-red-500 text-white hover:bg-red-500";
            default:
                return "bg-zinc-200 text-zinc-800 hover:bg-zinc-200";
        }
    }
</script>

<!-- Back + Action buttons -->
<div
    class="mt-20 mx-4 mb-5 flex items-center justify-between max-w-3xl mx-auto px-4"
>
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200"
        href="/app/lecturer/class/{data.classId}/topic-registration"
    >
        <ArrowLeftIcon /> Back to List
    </a>

    <div class="flex items-center gap-2">
        {#if topic.status !== "Approved"}
            <Button
                variant="outline"
                class="gap-1.5 border-green-300 text-green-600 hover:bg-green-50 cursor-pointer"
                onclick={() => openReviewDialog("Approved")}
            >
                <ThumbsUp class="h-4 w-4" />
                Approve
            </Button>
        {/if}
        {#if topic.status !== "Rejected"}
            <Button
                variant="outline"
                class="gap-1.5 border-red-300 text-red-500 hover:bg-red-50 cursor-pointer"
                onclick={() => openReviewDialog("Rejected")}
            >
                <ThumbsDown class="h-4 w-4" />
                Reject
            </Button>
        {/if}
    </div>
</div>

<div class="mx-auto max-w-3xl px-4 pb-8">
    <h1 class="mb-6 text-3xl font-bold tracking-tight text-zinc-900">
        Topic Detail
    </h1>

    <!-- Topic Information -->
    <Card.Root class="mb-5 rounded-xl border border-zinc-200 shadow-sm">
        <Card.Header class="pb-2">
            <p
                class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
            >
                Topic Information
            </p>
        </Card.Header>
        <Separator />
        <Card.Content class="p-0">
            <!-- Logo -->
            {#if topic.logoUrl}
                <div class="flex items-center gap-4 px-6 py-4">
                    <span class="w-40 shrink-0 text-sm text-zinc-500">Logo</span
                    >
                    <img
                        src={topic.logoUrl}
                        alt="Project logo"
                        class="h-16 w-16 rounded-lg border border-zinc-200 object-cover"
                        onerror={(e) => {
                            (e.currentTarget as HTMLImageElement).closest(
                                "div",
                            )!.style.display = "none";
                        }}
                    />
                </div>
                <Separator />
            {/if}
            {#each [{ label: "Title", value: topic.title }, { label: "Description", value: topic.description }, { label: "Version", value: `v${topic.versionNumber}` }, { label: "Submitted At", value: formatDate(topic.submittedAt) }] as field, i}
                <div class="flex items-center gap-4 px-6 py-4">
                    <span class="w-40 shrink-0 text-sm text-zinc-500"
                        >{field.label}</span
                    >
                    <span class="text-sm font-medium text-zinc-900"
                        >{field.value ?? "—"}</span
                    >
                </div>
                {#if i < 3}<Separator />{/if}
            {/each}

            <Separator />
            <div class="flex items-center gap-4 px-6 py-4">
                <span class="w-40 shrink-0 text-sm text-zinc-500">Status</span>
                <Badge
                    class={`rounded-full text-xs font-semibold ${getStatusVariant(topic.status)}`}
                >
                    {topic.status}
                </Badge>
            </div>

            {#if topic.objectives}
                <Separator />
                <div class="flex items-start gap-4 px-6 py-4">
                    <span class="w-40 shrink-0 text-sm text-zinc-500"
                        >Objectives</span
                    >
                    <span class="text-sm text-zinc-900">{topic.objectives}</span
                    >
                </div>
            {/if}
        </Card.Content>
    </Card.Root>

    <!-- Submitted By -->
    <Card.Root class="mb-5 rounded-xl border border-zinc-200 shadow-sm">
        <Card.Header class="pb-2">
            <p
                class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
            >
                Submitted By
            </p>
        </Card.Header>
        <Separator />
        <Card.Content class="p-0">
            {#each [{ label: "Full Name", value: topic.submittedBy?.fullName }, { label: "Student Code", value: topic.submittedBy?.studentCode }, { label: "Email", value: topic.submittedBy?.email }] as field, i}
                <div class="flex items-center gap-4 px-6 py-4">
                    <span class="w-40 shrink-0 text-sm text-zinc-500"
                        >{field.label}</span
                    >
                    <span class="text-sm font-medium text-zinc-900"
                        >{field.value ?? "—"}</span
                    >
                </div>
                {#if i < 2}<Separator />{/if}
            {/each}
        </Card.Content>
    </Card.Root>

    <!-- Group Information -->
    <Card.Root class="mb-5 rounded-xl border border-zinc-200 shadow-sm">
        <Card.Header class="pb-2">
            <p
                class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
            >
                Group Information
            </p>
        </Card.Header>
        <Separator />
        <Card.Content class="p-0">
            <div class="flex items-center gap-4 px-6 py-4">
                <span class="w-40 shrink-0 text-sm text-zinc-500"
                    >Group Name</span
                >
                <span class="text-sm font-medium text-zinc-900"
                    >{topic.group?.groupName ?? "—"}</span
                >
            </div>
            <Separator />
            <div class="flex items-center gap-4 px-6 py-4">
                <span class="w-40 shrink-0 text-sm text-zinc-500"
                    >Class Code</span
                >
                <span class="text-sm font-medium text-zinc-900"
                    >{topic.group?.classCode ?? "—"}</span
                >
            </div>
            <Separator />
            <div class="flex items-center gap-4 px-6 py-4">
                <span class="w-40 shrink-0 text-sm text-zinc-500"
                    >Group Status</span
                >
                <Badge
                    class="rounded-full bg-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-200"
                >
                    {topic.group?.status ?? "—"}
                </Badge>
            </div>
            <Separator />
            <div class="flex items-center gap-4 px-6 py-4">
                <span class="w-40 shrink-0 text-sm text-zinc-500">Members</span>
                <span class="text-sm font-medium text-zinc-900"
                    >{topic.group?.memberCount ?? 0} members</span
                >
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Review Information -->
    <Card.Root class="rounded-xl border border-zinc-200 shadow-sm">
        <Card.Header class="pb-2">
            <p
                class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
            >
                Review Information
            </p>
        </Card.Header>
        <Separator />
        <Card.Content class="p-0">
            <div class="flex items-center gap-4 px-6 py-4">
                <span class="w-40 shrink-0 text-sm text-zinc-500"
                    >Reviewed By</span
                >
                <div>
                    <p class="text-sm font-medium text-zinc-900">
                        {topic.reviewedBy?.fullName ?? "—"}
                    </p>
                    {#if topic.reviewedBy?.email}
                        <p class="text-xs text-zinc-400">
                            {topic.reviewedBy.email}
                        </p>
                    {/if}
                </div>
            </div>
            <Separator />
            <div class="flex items-center gap-4 px-6 py-4">
                <span class="w-40 shrink-0 text-sm text-zinc-500"
                    >Reviewed At</span
                >
                <span
                    class="text-sm {topic.reviewedAt
                        ? 'text-zinc-900'
                        : 'italic text-zinc-400'}"
                >
                    {formatDate(topic.reviewedAt)}
                </span>
            </div>
            <Separator />
            <div class="flex items-start gap-4 px-6 py-4">
                <span class="w-40 shrink-0 text-sm text-zinc-500">Feedback</span
                >
                <span
                    class="text-sm {topic.reviewFeedback
                        ? 'text-zinc-900'
                        : 'italic text-zinc-400'}"
                >
                    {topic.reviewFeedback ?? "No feedback provided"}
                </span>
            </div>
        </Card.Content>
    </Card.Root>
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
            class="flex flex-col gap-4 pt-1"
        >
            <input type="hidden" name="topicId" value={topic.topicId} />
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
