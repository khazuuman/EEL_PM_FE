<!-- /app/admin/mentor/[id]/+page.svelte -->
<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import { goto } from "$app/navigation";
    import {
        ArrowLeftIcon,
        BuildingIcon,
        BriefcaseIcon,
        PhoneIcon,
        MailIcon,
        UserIcon,
        BrainIcon,
        ClockIcon,
        CheckCircle2Icon,
        XCircleIcon,
        UsersIcon,
        HashIcon,
        BookOpenIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const mentor = $derived(data.mentor);

    function getInitials(name: string) {
        if (!name) return "MT";
        const parts = name.trim().split(" ");
        if (parts.length >= 2)
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }
</script>

<div class="min-h-screen bg-white pt-5 font-sans">
    <!-- ── Sticky Top Bar ──────────────────────────────────────────── -->
    <div
        class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm"
    >
        <Button
            variant="ghost"
            onclick={() => goto("/app/academic-staff/manage-mentors")}
            class="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Back</span>
        </Button>

        <!-- <Button
            onclick={() => goto(`/app/admin/mentor/${mentor.mentorId}/edit`)}
            class="cursor-pointer bg-orange-600 px-5 text-white shadow-sm hover:bg-orange-700"
        >
            Edit Mentor
        </Button> -->
    </div>

    <!-- ── Main Content ──────────────────────────────────────────────── -->
    <div class="mx-auto max-w-[1600px] space-y-6 px-6 py-8">
        <!-- ── Profile Header Card ────────────────────────────────── -->
        <div
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
            <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                <p
                    class="text-xs font-bold uppercase tracking-widest text-gray-400"
                >
                    Mentor Profile
                </p>
            </div>
            <div
                class="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center"
            >
                <!-- Avatar -->
                <div
                    class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-2xl font-extrabold text-orange-600 shadow-sm"
                >
                    {getInitials(mentor.fullName)}
                </div>

                <!-- Name & Meta -->
                <div class="flex flex-1 flex-col gap-2">
                    <div class="flex flex-wrap items-center gap-3">
                        <h1
                            class="text-2xl font-extrabold tracking-tight text-gray-900"
                        >
                            {mentor.fullName}
                        </h1>
                        <span
                            class="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide
                            {mentor.isActive
                                ? 'border-green-200 bg-green-100 text-green-700'
                                : 'border-red-200 bg-red-100 text-red-600'}"
                        >
                            {#if mentor.isActive}
                                <CheckCircle2Icon class="h-3 w-3" />Active
                            {:else}
                                <XCircleIcon class="h-3 w-3" />Inactive
                            {/if}
                        </span>
                    </div>
                    <div
                        class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500"
                    >
                        <span class="flex items-center gap-1.5">
                            <HashIcon class="h-3.5 w-3.5 text-gray-400" />
                            {mentor.mentorCode}
                        </span>
                        <span class="flex items-center gap-1.5">
                            <BriefcaseIcon class="h-3.5 w-3.5 text-gray-400" />
                            {mentor.currentPosition}
                        </span>
                        <span class="flex items-center gap-1.5">
                            <BuildingIcon class="h-3.5 w-3.5 text-gray-400" />
                            {mentor.currentCompany}
                        </span>
                        <span class="flex items-center gap-1.5">
                            <ClockIcon class="h-3.5 w-3.5 text-gray-400" />
                            {mentor.yearsOfExperience} years of experience
                        </span>
                    </div>
                </div>

                <!-- Active Groups Badge -->
                <div
                    class="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-gray-200 px-6 py-4 text-center shadow-sm"
                >
                    <p class="text-3xl font-extrabold text-orange-600">
                        {mentor.activeGroupCount}
                    </p>
                    <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Active Groups
                    </p>
                </div>
            </div>
        </div>

        <!-- ── 2-col Grid ──────────────────────────────────────────── -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <!-- LEFT: Contact + Professional Info -->
            <div class="flex flex-col gap-6 xl:col-span-8">

                <!-- Contact Information -->
                <div
                    class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                    <div
                        class="border-b border-gray-100 bg-gray-50/60 px-6 py-4"
                    >
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-gray-400"
                        >
                            Contact Information
                        </p>
                    </div>
                    <div class="divide-y divide-gray-100">
                        {#each [
                            { label: "Full Name", value: mentor.fullName, icon: UserIcon },
                            { label: "Email", value: mentor.email, icon: MailIcon },
                            { label: "Phone Number", value: mentor.phoneNumber, icon: PhoneIcon },
                        ] as row}
                            <div
                                class="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-[200px_1fr]"
                            >
                                <span
                                    class="flex items-center gap-2 text-sm font-medium text-gray-500"
                                >
                                    <svelte:component
                                        this={row.icon}
                                        class="h-4 w-4 text-gray-400"
                                    />
                                    {row.label}
                                </span>
                                <span
                                    class="break-all text-sm font-medium text-gray-900"
                                >
                                    {row.value ?? "—"}
                                </span>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Professional Background -->
                <div
                    class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                    <div
                        class="border-b border-gray-100 bg-gray-50/60 px-6 py-4"
                    >
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-gray-400"
                        >
                            Professional Background
                        </p>
                    </div>
                    <div class="divide-y divide-gray-100">
                        {#each [
                            { label: "Current Company", value: mentor.currentCompany, icon: BuildingIcon },
                            { label: "Current Position", value: mentor.currentPosition, icon: BriefcaseIcon },
                            { label: "Field of Work", value: mentor.fieldOfWork, icon: BrainIcon },
                            { label: "Years of Experience", value: mentor.yearsOfExperience != null ? `${mentor.yearsOfExperience} years` : null, icon: ClockIcon },
                        ] as row}
                            <div
                                class="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-[200px_1fr]"
                            >
                                <span
                                    class="flex items-center gap-2 text-sm font-medium text-gray-500"
                                >
                                    <svelte:component
                                        this={row.icon}
                                        class="h-4 w-4 text-gray-400"
                                    />
                                    {row.label}
                                </span>
                                <span
                                    class="text-sm font-medium text-gray-900"
                                >
                                    {row.value ?? "—"}
                                </span>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Biography -->
                <div
                    class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                    <div
                        class="border-b border-gray-100 bg-gray-50/60 px-6 py-4"
                    >
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-gray-400"
                        >
                            Biography
                        </p>
                    </div>
                    <div class="px-6 py-5">
                        {#if mentor.biography}
                            <p
                                class="whitespace-pre-wrap text-sm leading-relaxed text-gray-700"
                            >
                                {mentor.biography}
                            </p>
                        {:else}
                            <p class="text-sm italic text-gray-400">
                                No biography provided.
                            </p>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- RIGHT: Assigned Groups -->
            <div class="xl:col-span-4">
                <div
                    class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                    <div
                        class="border-b border-gray-100 bg-gray-50/60 px-6 py-4 flex items-center justify-between"
                    >
                        <p
                            class="text-xs font-bold uppercase tracking-widest text-gray-400"
                        >
                            Assigned Groups
                        </p>
                        <span
                            class="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700"
                        >
                            {mentor.assignedGroups?.length ?? 0}
                        </span>
                    </div>

                    {#if mentor.assignedGroups && mentor.assignedGroups.length > 0}
                        <div class="flex flex-col divide-y divide-gray-100">
                            {#each mentor.assignedGroups as group}
                                <div class="flex items-center gap-4 px-6 py-4">
                                    <div
                                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600"
                                    >
                                        <UsersIcon class="h-4 w-4" />
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="truncate text-sm font-semibold text-gray-900"
                                        >
                                            {group.groupName ?? group.name ?? "—"}
                                        </p>
                                        <p class="text-xs text-gray-500 mt-0.5">
                                            {group.classCode ?? ""}
                                        </p>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div
                            class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
                        >
                            <div
                                class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100"
                            >
                                <BookOpenIcon class="h-6 w-6 text-gray-400" />
                            </div>
                            <p class="text-sm font-semibold text-gray-500">
                                No groups assigned
                            </p>
                            <p class="text-xs text-gray-400">
                                This mentor has not been assigned to any group
                                yet.
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>