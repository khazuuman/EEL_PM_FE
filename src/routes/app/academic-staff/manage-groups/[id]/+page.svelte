<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import {
    ArrowLeftIcon,
        BookOpenIcon,
        BuildingIcon,
        CalendarIcon,
        CrownIcon,
        GraduationCapIcon,
        LayersIcon,
        UserIcon,
        UsersIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const g = $derived(data.groupDetails as any);
    const leader = $derived(g.members?.find((m: any) => m.isLeader));
    const members = $derived(g.members ?? []);

    const statusColor: Record<string, string> = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Rejected: "bg-red-100 text-red-700 border-red-200",
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Inactive: "bg-stone-100 text-stone-500 border-stone-200",
    };
</script>

<div class="min-h-screen pt-25 bg-stone-50 px-6 py-10">
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app/academic-staff/manage-groups"><ArrowLeftIcon />Back to Groups</a
    >
    <div class="mx-auto max-w-4xl space-y-6">
        <!-- Header card -->
        <div
            class="rounded-xl border border-stone-200 bg-white px-8 py-6 shadow-sm"
        >
            <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-4">
                    <span
                        class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100"
                    >
                        <LayersIcon class="h-6 w-6 text-amber-600" />
                    </span>
                    <div>
                        <h1 class="text-2xl font-extrabold text-stone-900">
                            {g.groupName}
                        </h1>
                        {#if g.groupDescription}
                            <p class="mt-0.5 text-sm text-stone-500">
                                {g.groupDescription}
                            </p>
                        {:else}
                            <p class="mt-0.5 text-sm italic text-stone-400">
                                No description
                            </p>
                        {/if}
                    </div>
                </div>
                <span
                    class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold {statusColor[
                        g.status
                    ] ?? 'bg-stone-100 text-stone-500'}"
                >
                    {g.status}
                </span>
            </div>

            <Separator class="my-5" />

            <!-- Meta info -->
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div class="flex items-center gap-2 text-sm text-stone-600">
                    <BuildingIcon class="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                        <p class="text-xs text-stone-400">Campus</p>
                        <p class="font-medium text-stone-800">{g.campusCode}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 text-sm text-stone-600">
                    <BookOpenIcon class="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                        <p class="text-xs text-stone-400">Class</p>
                        <p class="font-medium text-stone-800">{g.classCode}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 text-sm text-stone-600">
                    <CalendarIcon class="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                        <p class="text-xs text-stone-400">Semester</p>
                        <p class="font-medium text-stone-800">
                            {g.semesterCode}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2 text-sm text-stone-600">
                    <UsersIcon class="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                        <p class="text-xs text-stone-400">Members</p>
                        <p class="font-medium text-stone-800">
                            {members.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Topic card -->
        <div
            class="rounded-xl border border-stone-200 bg-white px-8 py-6 shadow-sm"
        >
            <h2
                class="mb-4 flex items-center gap-2 font-semibold text-stone-800"
            >
                <GraduationCapIcon class="h-5 w-5 text-amber-500" />
                Topic
            </h2>
            {#if g.topic}
                <p class="text-sm text-stone-700">{g.topic}</p>
            {:else}
                <div
                    class="flex items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-5"
                >
                    <span class="text-sm italic text-stone-400"
                        >No topic assigned yet.</span
                    >
                </div>
            {/if}
        </div>

        <!-- Members card -->
        <div
            class="rounded-xl border border-stone-200 bg-white px-8 py-6 shadow-sm"
        >
            <h2
                class="mb-5 flex items-center gap-2 font-semibold text-stone-800"
            >
                <UsersIcon class="h-5 w-5 text-amber-500" />
                Members
                <span
                    class="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700"
                >
                    {members.length}
                </span>
            </h2>

            <div class="space-y-3">
                {#each members as member}
                    <div
                        class="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 transition hover:border-amber-200 hover:bg-amber-50/40"
                    >
                        <div class="flex items-center gap-3">
                            <!-- Avatar placeholder -->
                            <span
                                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-sm"
                            >
                                {member.fullName?.charAt(0) ?? "?"}
                            </span>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="font-medium text-stone-900"
                                        >{member.fullName}</span
                                    >
                                    {#if member.isLeader}
                                        <span
                                            class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200"
                                        >
                                            <CrownIcon class="h-3 w-3" /> Leader
                                        </span>
                                    {/if}
                                </div>
                                <div
                                    class="mt-0.5 flex items-center gap-2 text-xs text-stone-500"
                                >
                                    <span class="font-mono"
                                        >{member.studentCode}</span
                                    >
                                    <span class="text-stone-300">•</span>
                                    <span>{member.majorCode}</span>
                                </div>
                            </div>
                        </div>

                        <UserIcon class="h-4 w-4 text-stone-300" />
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
