<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import {
        ArrowLeftIcon,
        BookOpenIcon,
        UserIcon,
        UsersIcon,
        CalendarIcon,
        FileTextIcon,
        TargetIcon,
        ImageIcon,
        RepeatIcon,
        RefreshCwIcon,
        PencilIcon,
        HistoryIcon,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { formatIfDate } from "$lib/utils/date-format";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const topic = data.currentTopic;

    const statusClass: Record<string, string> = {
        Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Pending: "bg-amber-50 text-amber-700 border-amber-200",
        Rejected: "bg-red-50 text-red-700 border-red-200",
        Draft: "bg-stone-100 text-stone-500 border-stone-200",
    };
</script>

<div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Header -->
    <div class="flex-none px-8 pt-6 pb-5 border-b border-stone-100">
        <div class="flex items-center gap-3">
            <Button
                variant="ghost"
                onclick={() => history.back()}
                class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 px-2 py-1.5 h-auto cursor-pointer"
            >
                <ArrowLeftIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Back</span>
            </Button>
            <span class="text-stone-200">/</span>
            <div class="flex items-center gap-2">
                <div
                    class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center"
                >
                    <BookOpenIcon class="w-4 h-4 text-amber-500" />
                </div>
                <div>
                    <p
                        class="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none"
                    >
                        Topic
                    </p>
                    <h1
                        class="text-lg font-extrabold text-stone-900 leading-tight"
                    >
                        {topic?.title ?? "Topic Detail"}
                    </h1>
                </div>
            </div>
            {#if topic?.status}
                <span
                    class={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusClass[topic.status] ?? "bg-stone-100 text-stone-500 border-stone-200"}`}
                >
                    {topic.status}
                </span>
            {/if}

            <!-- Toolbar -->
            <div class="ml-auto flex items-center gap-2">
                <!-- History — luôn hiện -->
                <Button
                    variant="outline"
                    class="gap-2 h-9 border-stone-200 text-stone-500 hover:bg-stone-50 cursor-pointer"
                    onclick={() => goto("/app/student/topic/history")}
                >
                    <HistoryIcon class="w-4 h-4" />
                    History
                </Button>

                {#if topic?.status === "Pending"}
                    <Button
                        variant="outline"
                        class="gap-2 h-9 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                        onclick={() => goto(`/app/student/topic/${topic.topicId}/update`)}
                    >
                        <PencilIcon class="w-4 h-4" />
                        Update
                    </Button>
                {:else if topic?.status === "Rejected"}
                    <Button
                        class="gap-2 h-9 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                        onclick={() => goto("/app/student/topic/resubmit")}
                    >
                        <RefreshCwIcon class="w-4 h-4" />
                        Resubmit
                    </Button>
                {:else if topic?.status === "Approved"}
                    <Button
                        class="gap-2 h-9 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                        onclick={() => goto("/app/student/topic/change")}
                    >
                        <RepeatIcon class="w-4 h-4" />
                        Change Topic
                    </Button>
                {/if}
            </div>
        </div>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
        <!-- Row 1: Description + Logo -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!-- Description -->
            <div
                class="xl:col-span-2 rounded-xl border border-stone-200 bg-white overflow-hidden"
            >
                <div
                    class="flex items-center gap-2 px-6 py-4 bg-stone-50 border-b border-stone-100"
                >
                    <FileTextIcon class="w-4 h-4 text-stone-400" />
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                        Description
                    </p>
                </div>
                <div class="px-6 py-5">
                    <p
                        class="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap"
                    >
                        {topic?.description ?? "—"}
                    </p>
                </div>
            </div>

            <!-- Logo -->
            <div
                class="rounded-xl border border-stone-200 bg-white overflow-hidden"
            >
                <div
                    class="flex items-center gap-2 px-6 py-4 bg-stone-50 border-b border-stone-100"
                >
                    <ImageIcon class="w-4 h-4 text-stone-400" />
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                        Project Logo
                    </p>
                </div>
                <div class="flex items-center justify-center px-6 py-8">
                    {#if topic?.logoUrl}
                        <img
                            src={topic.logoUrl}
                            alt="Project logo"
                            class="h-36 w-36 rounded-2xl border border-stone-200 object-cover shadow-sm"
                        />
                    {:else}
                        <div
                            class="flex flex-col items-center gap-2 text-stone-300"
                        >
                            <ImageIcon class="w-12 h-12" />
                            <p class="text-xs text-stone-400">
                                No logo uploaded
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Row 2: Objectives -->
        <div
            class="rounded-xl border border-stone-200 bg-white overflow-hidden"
        >
            <div
                class="flex items-center gap-2 px-6 py-4 bg-stone-50 border-b border-stone-100"
            >
                <TargetIcon class="w-4 h-4 text-stone-400" />
                <p
                    class="text-xs font-bold uppercase tracking-widest text-stone-400"
                >
                    Objectives
                </p>
            </div>
            <div class="px-6 py-5">
                {#if topic?.objectives}
                    <ul
                        class="flex flex-col gap-2 pl-5 list-disc marker:text-amber-300"
                    >
                        {#each topic.objectives
                            .split("\n")
                            .filter((o: string) => o.trim()) as obj}
                            <li class="text-sm text-stone-700 leading-relaxed">
                                {obj.replace(/^-\s*/, "")}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="text-sm italic text-stone-400">Not specified</p>
                {/if}
            </div>
        </div>

        <!-- Row 3: Submitted By + Group + Meta -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <!-- Submitted By -->
            <div
                class="rounded-xl border border-stone-200 bg-white overflow-hidden"
            >
                <div
                    class="flex items-center gap-2 px-6 py-4 bg-stone-50 border-b border-stone-100"
                >
                    <UserIcon class="w-4 h-4 text-stone-400" />
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                        Submitted By
                    </p>
                </div>
                <div class="divide-y divide-stone-100">
                    {#each [{ label: "Full Name", value: topic?.submittedBy?.fullName }, { label: "Student Code", value: topic?.submittedBy?.studentCode }, { label: "Email", value: topic?.submittedBy?.email }] as row}
                        <div class="px-6 py-4">
                            <p class="text-xs text-stone-400 mb-0.5">
                                {row.label}
                            </p>
                            <p
                                class="text-sm font-medium text-stone-800 break-all"
                            >
                                {row.value ?? "—"}
                            </p>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Group -->
            <div
                class="rounded-xl border border-stone-200 bg-white overflow-hidden"
            >
                <div
                    class="flex items-center gap-2 px-6 py-4 bg-stone-50 border-b border-stone-100"
                >
                    <UsersIcon class="w-4 h-4 text-stone-400" />
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                        Group
                    </p>
                </div>
                <div class="divide-y divide-stone-100">
                    {#each [{ label: "Group Name", value: topic?.group?.groupName }, { label: "Class Code", value: topic?.group?.classCode }, { label: "Members", value: topic?.group?.memberCount != null ? `${topic.group.memberCount} members` : undefined }] as row}
                        <div class="px-6 py-4">
                            <p class="text-xs text-stone-400 mb-0.5">
                                {row.label}
                            </p>
                            <p class="text-sm font-medium text-stone-800">
                                {row.value ?? "—"}
                            </p>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Meta -->
            <div
                class="rounded-xl border border-stone-200 bg-white overflow-hidden"
            >
                <div
                    class="flex items-center gap-2 px-6 py-4 bg-stone-50 border-b border-stone-100"
                >
                    <CalendarIcon class="w-4 h-4 text-stone-400" />
                    <p
                        class="text-xs font-bold uppercase tracking-widest text-stone-400"
                    >
                        Timeline
                    </p>
                </div>
                <div class="divide-y divide-stone-100">
                    <div class="px-6 py-4">
                        <p class="text-xs text-stone-400 mb-0.5">
                            Submitted At
                        </p>
                        <p class="text-sm font-medium text-stone-800">
                            {formatIfDate(topic?.submittedAt) ?? "—"}
                        </p>
                    </div>
                    <div class="px-6 py-4">
                        <p class="text-xs text-stone-400 mb-0.5">Status</p>
                        {#if topic?.status}
                            <span
                                class={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusClass[topic.status] ?? "bg-stone-100 text-stone-500 border-stone-200"}`}
                            >
                                {topic.status}
                            </span>
                        {:else}
                            <p class="text-sm text-stone-400">—</p>
                        {/if}
                    </div>
                    {#if topic?.status === "Rejected" && topic?.reviewComment}
                        <div class="px-6 py-4 bg-red-50/50">
                            <p
                                class="text-xs font-semibold text-red-500 mb-0.5"
                            >
                                Rejection Reason
                            </p>
                            <p class="text-sm text-red-700 leading-relaxed">
                                {topic.reviewComment}
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
