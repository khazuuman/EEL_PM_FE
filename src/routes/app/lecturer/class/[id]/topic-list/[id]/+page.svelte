<script lang="ts">
    import type { PageData } from "./$types";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import { Button } from "$lib/components/ui/button";
    import { ArrowLeftIcon } from "lucide-svelte";
    import { goto } from "$app/navigation";

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
    <!-- Top bar -->
    <div
        class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm"
    >
        <Button
            variant="ghost"
            onclick={() => goto(`/app/lecturer/class/${data.classId}/topic-list`)}
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Back to Topics</span>
        </Button>

        <div class="flex items-center gap-2">
            <Badge
                class={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusVariant(topic.status)}`}
            >
                {topic.status}
            </Badge>
        </div>
    </div>

    <!-- Main -->
    <div class="px-6 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">
                    Topic Detail
                </h1>
                <p class="mt-1 text-sm text-gray-500">
                    View submitted topic information, group details, and review result.
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <Badge class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                    Version {topic.versionNumber}
                </Badge>
                {#if topic.group?.classCode}
                    <Badge class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {topic.group.classCode}
                    </Badge>
                {/if}
            </div>
        </div>

        <!-- Summary block -->
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div class="grid grid-cols-1 xl:grid-cols-[1.3fr_420px]">
                <!-- Left -->
                <div class="p-6 xl:p-8">
                    <div class="flex items-start gap-4">
                        {#if topic.logoUrl}
                            <img
                                src={topic.logoUrl}
                                alt="Project logo"
                                class="h-16 w-16 shrink-0 rounded-xl border border-gray-200 object-cover"
                            />
                        {/if}

                        <div class="min-w-0 flex-1">
                            <h2 class="text-2xl font-bold leading-tight text-gray-900">
                                {topic.title}
                            </h2>
                            <p class="mt-2 text-sm text-gray-500">
                                Submitted at {formatDate(topic.submittedAt)}
                            </p>
                        </div>
                    </div>

                    <div class="mt-6">
                        <p class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                            Description
                        </p>
                        <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p class="text-sm leading-relaxed text-gray-700">
                                {topic.description ?? "—"}
                            </p>
                        </div>
                    </div>

                    {#if topic.objectives}
                        <div class="mt-5">
                            <p class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                                Objectives
                            </p>
                            <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <p class="text-sm leading-relaxed text-gray-700">
                                    {topic.objectives}
                                </p>
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Right -->
                <div class="border-t border-gray-100 bg-gray-50/70 p-6 xl:border-l xl:border-t-0 xl:p-8">
                    <p class="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                        Overview
                    </p>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="rounded-xl border border-gray-200 bg-white p-4">
                            <p class="text-xs text-gray-400">Group</p>
                            <p class="mt-1 text-sm font-semibold text-gray-900">
                                {topic.group?.groupName ?? "—"}
                            </p>
                        </div>

                        <div class="rounded-xl border border-gray-200 bg-white p-4">
                            <p class="text-xs text-gray-400">Class Code</p>
                            <p class="mt-1 text-sm font-semibold text-gray-900">
                                {topic.group?.classCode ?? "—"}
                            </p>
                        </div>

                        <div class="rounded-xl border border-gray-200 bg-white p-4">
                            <p class="text-xs text-gray-400">Members</p>
                            <p class="mt-1 text-sm font-semibold text-gray-900">
                                {topic.group?.memberCount ?? 0}
                            </p>
                        </div>

                        <div class="rounded-xl border border-gray-200 bg-white p-4">
                            <p class="text-xs text-gray-400">Reviewed At</p>
                            <p class="mt-1 text-sm font-semibold text-gray-900">
                                {formatDate(topic.reviewedAt)}
                            </p>
                        </div>
                    </div>

                    <div class="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                        <p class="text-xs text-gray-400">Submitted By</p>
                        <p class="mt-1 text-sm font-semibold text-gray-900">
                            {topic.submittedBy?.fullName ?? "—"}
                        </p>
                        <p class="mt-1 text-xs text-gray-500">
                            {topic.submittedBy?.studentCode ?? "—"}
                        </p>
                        <p class="mt-1 break-all text-xs text-gray-500">
                            {topic.submittedBy?.email ?? "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detail grid -->
        <div class="grid grid-cols-1 gap-6 2xl:grid-cols-12">
            <!-- Topic information -->
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-5">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Topic Information
                    </p>
                </div>

                <div class="p-0">
                    {#each [
                        { label: "Title", value: topic.title },
                        { label: "Description", value: topic.description },
                        { label: "Version", value: `v${topic.versionNumber}` },
                        { label: "Submitted At", value: formatDate(topic.submittedAt) }
                    ] as field, i}
                        <div class="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[160px_1fr]">
                            <span class="text-sm font-medium text-gray-500">
                                {field.label}
                            </span>
                            <span class="text-sm font-medium leading-relaxed text-gray-900">
                                {field.value ?? "—"}
                            </span>
                        </div>
                        {#if i < 3}
                            <Separator class="bg-gray-100" />
                        {/if}
                    {/each}

                    <Separator class="bg-gray-100" />

                    <div class="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[160px_1fr]">
                        <span class="text-sm font-medium text-gray-500">Status</span>
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
                        <div class="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[160px_1fr]">
                            <span class="text-sm font-medium text-gray-500">Objectives</span>
                            <span class="text-sm leading-relaxed text-gray-900">
                                {topic.objectives}
                            </span>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Project logo -->
            {#if topic.logoUrl}
                <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-3">
                    <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                        <p class="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Project Logo
                        </p>
                    </div>

                    <div class="flex flex-col items-center gap-4 px-6 py-6">
                        <img
                            src={topic.logoUrl}
                            alt="Project logo"
                            class="h-28 w-28 rounded-2xl border border-gray-200 object-cover shadow-sm"
                        />
                        <p class="break-all text-center text-xs text-gray-400">
                            {topic.logoUrl}
                        </p>
                    </div>
                </div>
            {/if}

            <!-- Submitted by -->
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-4">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-gray-400">
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

            <!-- Group information -->
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-5">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-gray-400">
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
                                {topic.group?.memberCount ?? 0} members
                            </p>
                        </div>
                    </div>

                    <div>
                        <p class="mb-1 text-xs text-gray-400">Group Status</p>
                        <Badge class="rounded-full border border-gray-200 bg-gray-100 text-[11px] font-semibold text-gray-600 shadow-none">
                            {topic.group?.status ?? "—"}
                        </Badge>
                    </div>
                </div>
            </div>

            <!-- Review information -->
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm 2xl:col-span-7">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Review Information
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-6 px-6 py-5 xl:grid-cols-[240px_220px_1fr]">
                    <div>
                        <p class="mb-1 text-xs text-gray-400">Reviewed By</p>
                        <p class="text-sm font-semibold text-gray-900">
                            {topic.reviewedBy?.fullName ?? "—"}
                        </p>
                        {#if topic.reviewedBy?.email}
                            <p class="mt-1 break-all text-xs text-gray-500">
                                {topic.reviewedBy.email}
                            </p>
                        {/if}
                    </div>

                    <div>
                        <p class="mb-1 text-xs text-gray-400">Reviewed At</p>
                        <p class={`text-sm ${topic.reviewedAt ? "text-gray-900" : "italic text-gray-400"}`}>
                            {formatDate(topic.reviewedAt)}
                        </p>
                    </div>

                    <div>
                        <p class="mb-1 text-xs text-gray-400">Feedback</p>
                        <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p class={`text-sm leading-relaxed ${topic.reviewFeedback ? "text-gray-900" : "italic text-gray-400"}`}>
                                {topic.reviewFeedback ?? "No feedback provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>