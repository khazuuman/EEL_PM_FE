<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import {
        ArrowLeftIcon,
        BookOpenIcon,
        BriefcaseIcon,
        CalendarIcon,
        CrownIcon,
        GraduationCapIcon,
        LayersIcon,
        MailIcon,
        PencilIcon,
        PhoneIcon,
        TrashIcon,
        UserIcon,
        UsersIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import { page } from "$app/state";
    import Button from "$lib/components/ui/button/button.svelte";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import { setIsRootLoading } from "$lib/stores/root-loading";
    import { enhance } from "$app/forms";
    import { setActions } from "$lib/stores/actions";

    let { data }: { data: PageData } = $props();
    const g = $derived(data.groupDetails as any);
    const classId = $derived(page.url.pathname.match(/\/class\/(\d+)/)?.[1]);
    const members = $derived(g.members ?? []);
    const pageUrl = $derived(page.url.pathname);
    const mentor = $derived(g.mentor ?? null);

    const statusColor: Record<string, string> = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Rejected: "bg-red-100 text-red-700 border-red-200",
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Inactive: "bg-stone-100 text-stone-500 border-stone-200",
    };

    const majorStats = $derived(
        members.reduce((acc: Record<string, number>, member: any) => {
            const major = member.majorCode ?? "Unknown";
            acc[major] = (acc[major] ?? 0) + 1;
            return acc;
        }, {}),
    );
    const totalMajors = $derived(Object.keys(majorStats).length);

    let deleteFormEl: HTMLFormElement | null = $state(null);
    let isSubmitting = $state(false);

    const handleEnhanceDeleteForm: SubmitFunction = () => {
        setIsRootLoading(true);
        isSubmitting = true;
        return async ({ result }) => {
            setIsRootLoading(false);
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error(result.data?.message ?? "Failed to delete group");
            } else if (result.type === "redirect") {
                toast.success("Deleted group successfully!");
                await goto(result.location);
            }
        };
    };
</script>

<!-- Delete form (hidden) -->
<form
    bind:this={deleteFormEl}
    method="POST"
    action="{pageUrl}?/delete"
    use:enhance={handleEnhanceDeleteForm}
    class="hidden"
    aria-hidden="true"
></form>

<div class="min-h-screen bg-white pt-16">
    <!-- ─── Top Bar ─────────────────────────────────────────────── -->
    <div class="border-b border-stone-200 bg-white px-6 py-3 shadow-sm">
        <div class="flex items-center justify-between">
            <Button
                variant="ghost"
                onclick={() =>
                    goto(`/app/lecturer/class/${classId}/manage-groups`)}
                class="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-3 py-2 transition-all cursor-pointer"
            >
                <ArrowLeftIcon class="w-4 h-4" />
                <span class="text-sm font-semibold">Back to Groups</span>
            </Button>

            <div class="flex items-center gap-2">
                <Button
                    variant="outline"
                    class="flex items-center gap-2 border-stone-300 text-stone-700 hover:bg-stone-100"
                    href="{pageUrl}/update"
                >
                    <PencilIcon class="h-4 w-4" />
                    Update
                </Button>
                <Button
                    variant="destructive"
                    disabled={isSubmitting}
                    class="flex items-center gap-2"
                    onclick={() =>
                        setActions({
                            active: true,
                            description:
                                "This action cannot be undone. This will permanently delete this group from our servers.",
                            cb: () => deleteFormEl?.requestSubmit(),
                        })}
                >
                    <TrashIcon class="h-4 w-4" />
                    Delete
                </Button>
            </div>
        </div>
    </div>

    <!-- ─── Main Content ──────────────────────────────────────────── -->
    <div class="px-6 py-6">
        <!-- Group Header Banner -->
        <div
            class="mb-6 rounded-xl border border-stone-200 bg-white px-8 py-5 shadow-sm"
        >
            <div class="flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-4">
                    <span
                        class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 shrink-0"
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

                <!-- Meta chips + status -->
                <div class="flex items-center gap-3 flex-wrap">
                    <div
                        class="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs text-stone-600"
                    >
                        <BookOpenIcon class="h-3.5 w-3.5 text-amber-500" />
                        <span class="font-medium">{g.classCode}</span>
                    </div>
                    <div
                        class="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs text-stone-600"
                    >
                        <CalendarIcon class="h-3.5 w-3.5 text-amber-500" />
                        <span class="font-medium">{g.semesterCode}</span>
                    </div>
                    <div
                        class="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs text-stone-600"
                    >
                        <UsersIcon class="h-3.5 w-3.5 text-amber-500" />
                        <span class="font-medium">{members.length} members</span
                        >
                    </div>
                    <div
                        class="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs text-stone-600"
                    >
                        <GraduationCapIcon class="h-3.5 w-3.5 text-amber-500" />
                        <span class="font-medium">{totalMajors} majors</span>
                    </div>
                    <span
                        class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold {statusColor[
                            g.status
                        ] ?? 'bg-stone-100 text-stone-500'}"
                    >
                        {g.status}
                    </span>
                </div>
            </div>
        </div>

        <!-- ─── Two-column grid ───────────────────────────────────── -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- LEFT COLUMN: Topic + Mentor -->
            <div class="space-y-6 lg:col-span-1">
                <!-- Topic card -->
                <div
                    class="rounded-xl border border-stone-200 bg-white px-6 py-5 shadow-sm"
                >
                    <h2
                        class="mb-3 flex items-center gap-2 font-semibold text-stone-800"
                    >
                        <GraduationCapIcon class="h-5 w-5 text-amber-500" />
                        Topic
                    </h2>
                    {#if g.topic}
                        <p class="text-sm text-stone-700 leading-relaxed">
                            {g.topic.title}
                        </p>
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

                <!-- Mentor card -->
                <div
                    class="rounded-xl border border-stone-200 bg-white px-6 py-5 shadow-sm"
                >
                    <div class="flex items-center justify-between mb-4">
                        <h2
                            class="flex items-center gap-2 font-semibold text-stone-800"
                        >
                            <BriefcaseIcon class="h-5 w-5 text-amber-500" />
                            Assigned Mentor
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            class="h-7 text-xs text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            href="{pageUrl}/assign-mentor"
                        >
                            {mentor ? "Change" : "Assign"}
                        </Button>
                    </div>

                    {#if mentor}
                        <div class="space-y-3">
                            <!-- Avatar + Name -->
                            <div class="flex items-center gap-3">
                                <div
                                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-base"
                                >
                                    {mentor.fullName?.charAt(0) ?? "M"}
                                </div>
                                <div class="min-w-0">
                                    <div
                                        class="flex items-center gap-2 flex-wrap"
                                    >
                                        <h3
                                            class="font-bold text-stone-900 truncate"
                                        >
                                            {mentor.fullName}
                                        </h3>
                                        <Badge
                                            variant="secondary"
                                            class="bg-stone-200 text-stone-600 font-mono text-[10px] px-1.5 py-0"
                                        >
                                            {mentor.mentorCode}
                                        </Badge>
                                    </div>
                                    {#if mentor.currentPosition || mentor.currentCompany}
                                        <p
                                            class="text-xs text-stone-500 mt-0.5"
                                        >
                                            {mentor.currentPosition || "Mentor"}
                                            · {mentor.currentCompany || "N/A"}
                                        </p>
                                    {/if}
                                </div>
                            </div>

                            <Separator />

                            <!-- Contact info -->
                            <div class="space-y-2 text-sm text-stone-600">
                                <div class="flex items-center gap-2 truncate">
                                    <MailIcon
                                        class="h-3.5 w-3.5 text-stone-400 shrink-0"
                                    />
                                    <span class="truncate text-xs"
                                        >{mentor.email}</span
                                    >
                                </div>
                                {#if mentor.phoneNumber}
                                    <div class="flex items-center gap-2">
                                        <PhoneIcon
                                            class="h-3.5 w-3.5 text-stone-400 shrink-0"
                                        />
                                        <span class="text-xs"
                                            >{mentor.phoneNumber}</span
                                        >
                                    </div>
                                {/if}
                                <div class="flex items-center gap-2">
                                    <BookOpenIcon
                                        class="h-3.5 w-3.5 text-stone-400 shrink-0"
                                    />
                                    <span class="text-xs"
                                        >{mentor.fieldOfWork || "General"}</span
                                    >
                                </div>
                                <div class="flex items-center gap-2">
                                    <CalendarIcon
                                        class="h-3.5 w-3.5 text-stone-400 shrink-0"
                                    />
                                    <span class="text-xs">
                                        {mentor.yearsOfExperience
                                            ? `${mentor.yearsOfExperience} yrs exp.`
                                            : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div
                            class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 py-7"
                        >
                            <span class="text-sm text-stone-500 text-center"
                                >No mentor assigned yet.</span
                            >
                            <Button
                                variant="outline"
                                size="sm"
                                class="mt-1 text-stone-600 bg-white text-xs"
                                href="{pageUrl}/assign-mentor"
                            >
                                Find a Mentor
                            </Button>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- RIGHT COLUMN: Members -->
            <div class="lg:col-span-2">
                <div
                    class="rounded-xl border border-stone-200 bg-white px-6 py-5 shadow-sm h-full"
                >
                    <h2
                        class="mb-4 flex items-center gap-2 font-semibold text-stone-800"
                    >
                        <UsersIcon class="h-5 w-5 text-amber-500" />
                        Members
                        <span
                            class="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700"
                        >
                            {members.length}
                        </span>
                    </h2>

                    <!-- Members grid: 2 cols on large screens -->
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {#each members as member}
                            <div
                                class="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 transition hover:border-amber-200 hover:bg-amber-50/40"
                            >
                                <div class="flex items-center gap-3 min-w-0">
                                    <span
                                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-sm"
                                    >
                                        {member.fullName?.charAt(0) ?? "?"}
                                    </span>
                                    <div class="min-w-0">
                                        <div
                                            class="flex items-center gap-2 flex-wrap"
                                        >
                                            <span
                                                class="font-medium text-stone-900 truncate text-sm"
                                            >
                                                {member.fullName}
                                            </span>
                                            {#if member.isLeader}
                                                <span
                                                    class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200 shrink-0"
                                                >
                                                    <CrownIcon
                                                        class="h-2.5 w-2.5"
                                                    /> Leader
                                                </span>
                                            {/if}
                                        </div>
                                        <div
                                            class="mt-0.5 flex items-center gap-2 text-xs text-stone-500"
                                        >
                                            <span class="font-mono"
                                                >{member.studentCode}</span
                                            >
                                            <span class="text-stone-300">•</span
                                            >
                                            <span>{member.majorName}</span>
                                        </div>
                                    </div>
                                </div>
                                <UserIcon
                                    class="h-4 w-4 text-stone-300 shrink-0"
                                />
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
