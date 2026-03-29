<script lang="ts">
    import type { PageData } from "./$types";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import * as Card from "$lib/components/ui/card";
    import { ArrowLeftIcon } from "lucide-svelte";

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

<a
    class="mt-20 ml-10 flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
    href="/app/lecturer/class/{data.classId}/topic-list"
>
    <ArrowLeftIcon /> Back to Topics
</a>

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
            {#each [{ label: "Title", value: topic.title }, { label: "Description", value: topic.description }, { label: "Version", value: `v${topic.versionNumber}` }, { label: "Submitted At", value: formatDate(topic.submittedAt) }] as field, i}
                <div class="flex items-center gap-4 px-6 py-4">
                    <span class="w-40 shrink-0 text-sm text-zinc-500"
                        >{field.label}</span
                    >
                    <span class="text-sm font-medium text-zinc-900"
                        >{field.value ?? "—"}</span
                    >
                </div>
                {#if i < 3}
                    <Separator />
                {/if}
            {/each}

            <!-- Status row riêng vì dùng Badge -->
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
                {#if i < 2}
                    <Separator />
                {/if}
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
                <span class="text-sm font-medium text-zinc-900">
                    {topic.group?.memberCount ?? 0} members
                </span>
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
