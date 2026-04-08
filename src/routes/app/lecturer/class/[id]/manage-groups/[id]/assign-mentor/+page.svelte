<script lang="ts">
    import type { PageData, ActionData } from "./$types";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { enhance } from "$app/forms";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import {
        ChevronLeft,
        ChevronRight,
        BookOpen,
        Users,
        Star,
        ArrowLeftIcon,
        Mail,
        Briefcase,
        Phone,
        Loader2,
        UserCheck,
        LayersIcon,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { setIsRootLoading } from "$lib/stores/root-loading";
    import { setActions } from "$lib/stores/actions";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let isDialogOpen = $state(false);
    let selectedMentor = $state<any>(null);
    let isFetchingDetail = $state(false);
    let activeLoadingId = $state<string | null>(null);

    let group = $derived(data.group);
    let topic = $derived(
        data.topic && data.topic.length > 0 ? data.topic[0] : null,
    );
    let mentors = $derived(data.mentors?.data || []);
    let pagination = $derived(
        data.mentors?.pagination || {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 1,
        },
    );

    let assignFormEl: HTMLFormElement | null = $state(null);
    let targetMentorId = $state<number | null>(null);
    let isAssigning = $state(false);

    const handleEnhanceAssignForm: SubmitFunction = () => {
        setIsRootLoading(true);
        isAssigning = true;
        return async ({ result }) => {
            setIsRootLoading(false);
            isAssigning = false;
            if (result.type === "failure") {
                toast.error(result.data?.message ?? "Failed to assign mentor");
            } else if (result.type === "success") {
                toast.success("Mentor assigned successfully!");
                await goto(
                    `/app/lecturer/class/${data.classId}/manage-groups/${group.groupId}`,
                );
            }
        };
    };

    function handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            const url = new URL($page.url);
            url.searchParams.set("page", newPage.toString());
            goto(url.toString(), { keepFocus: true, noScroll: true });
        }
    }

    function getInitials(name: string) {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length >= 2)
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }

    let pageNumbers = $derived.by(() => {
        const pages = [];
        const start = Math.max(1, pagination.page - 1);
        const end = Math.min(pagination.totalPages, pagination.page + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    });
</script>

<!-- Hidden assign form -->
<form
    bind:this={assignFormEl}
    method="POST"
    action="?/assignMentor"
    use:enhance={handleEnhanceAssignForm}
    class="hidden"
    aria-hidden="true"
>
    <input type="hidden" name="groupId" value={group?.groupId} />
    <input type="hidden" name="mentorId" value={targetMentorId} />
</form>

<div class="min-h-screen bg-white pt-5">
    <!-- ── Top Bar ─────────────────────────────────────── -->
    <div
        class="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur-sm px-6 py-3"
    >
        <div class="flex items-center justify-between">
            <button
                type="button"
                onclick={() => goto(`/app/lecturer/class/${data.classId}/manage-groups`)}
                class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
            >
                <ArrowLeftIcon class="h-4 w-4" />
                Back to Group List
            </button>

            {#if group}
                <div class="flex items-center gap-2 text-sm text-zinc-500">
                    <LayersIcon class="h-4 w-4 text-orange-500" />
                    <span class="font-semibold text-zinc-800 text-[16px]"
                        >{group.groupName}</span
                    >
                    <span class="text-zinc-300">·</span>
                    <span class="text-[16px]">Assign Mentor</span>
                </div>
            {/if}

            <div class="w-32"></div>
        </div>
    </div>

    <div class="px-6 py-6 space-y-6">
        <!-- ── ROW 1: Mentor Table — full width ─────────── -->
        <div
            class="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
        >
            <div class="px-6 py-5 border-b border-zinc-100">
                <h1 class="text-xl font-bold text-zinc-900">
                    Available Mentors
                </h1>
                <p class="text-md text-zinc-500 mt-0.5">
                    Select a mentor to assign to group
                    <span class="font-semibold text-zinc-800"
                        >{group?.groupName}</span
                    >.
                </p>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead
                        class="text-[13px] text-zinc-500 uppercase font-bold bg-zinc-50/70 border-b border-zinc-100"
                    >
                        <tr>
                            <th class="px-6 py-3 tracking-wider">Mentor</th>
                            <th class="px-6 py-3 tracking-wider">Code</th>
                            <th class="px-6 py-3 tracking-wider">Email</th>
                            <th class="px-6 py-3 tracking-wider"
                                >Active Groups</th
                            >
                            <th class="px-6 py-3 tracking-wider text-right"
                                >Actions</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100 bg-white">
                        {#if mentors.length === 0}
                            <tr>
                                <td
                                    colspan="5"
                                    class="px-6 py-12 text-center text-zinc-400 text-xl italic"
                                >
                                    No mentors available.
                                </td>
                            </tr>
                        {/if}
                        {#each mentors as mentor}
                            <tr class="hover:bg-zinc-50/60 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="h-9 w-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[14px] font-bold shrink-0"
                                        >
                                            {getInitials(mentor.fullName)}
                                        </div>
                                        <div>
                                            <span
                                                class="font-semibold text-[16px] text-zinc-900 block leading-tight"
                                            >
                                                {mentor.fullName}
                                            </span>
                                            {#if mentor.currentPosition || mentor.currentCompany}
                                                <span
                                                    class="text-[14px] text-zinc-400 mt-0.5"
                                                >
                                                    {mentor.currentPosition} · {mentor.currentCompany}
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <Badge
                                        variant="secondary"
                                        class="bg-zinc-100 text-zinc-600 font-mono font-normal text-[14px] hover:bg-zinc-100"
                                    >
                                        {mentor.mentorCode}
                                    </Badge>
                                </td>
                                <td class="px-6 py-4 text-zinc-500 text-[14px]"
                                    >{mentor.email}</td
                                >
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-1.5">
                                        <Users
                                            class="h-3.5 w-3.5 text-zinc-400"
                                        />
                                        <span class="text-zinc-600 font-medium text-[14px]"
                                            >{mentor.activeGroupCount ??
                                                0}</span
                                        >
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div
                                        class="flex items-center justify-end gap-2"
                                    >
                                        <!-- View Detail form -->
                                        <form
                                            method="POST"
                                            action="?/getMentorDetail"
                                            use:enhance={() => {
                                                isFetchingDetail = true;
                                                activeLoadingId =
                                                    mentor.mentorId;
                                                return async ({ result }) => {
                                                    isFetchingDetail = false;
                                                    activeLoadingId = null;
                                                    if (
                                                        result.type ===
                                                        "success"
                                                    ) {
                                                        selectedMentor =
                                                            result.data
                                                                ?.mentorDetails;
                                                        isDialogOpen = true;
                                                    } else {
                                                        toast.error(
                                                            "Failed to load mentor details",
                                                        );
                                                    }
                                                };
                                            }}
                                        >
                                            <input
                                                type="hidden"
                                                name="mentorId"
                                                value={mentor.mentorId}
                                            />
                                            <Button
                                                type="submit"
                                                variant="ghost"
                                                disabled={isFetchingDetail &&
                                                    activeLoadingId ===
                                                        mentor.mentorId}
                                                class="h-8 px-3 text-[14px] text-zinc-500 hover:text-zinc-900 cursor-pointer"
                                            >
                                                {#if isFetchingDetail && activeLoadingId === mentor.mentorId}
                                                    <Loader2
                                                        class="h-3.5 w-3.5 mr-1.5 animate-spin"
                                                    />
                                                    Loading...
                                                {:else}
                                                    View Detail
                                                {/if}
                                            </Button>
                                        </form>

                                        <Button
                                            disabled={isAssigning &&
                                                targetMentorId ===
                                                    mentor.mentorId}
                                            class="h-8 px-4 text-[14px] bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm cursor-pointer"
                                            onclick={() => {
                                                targetMentorId =
                                                    mentor.mentorId;
                                                setActions({
                                                    active: true,
                                                    description: `Are you sure you want to assign ${mentor.fullName} to this group?`,
                                                    cb: () =>
                                                        assignFormEl?.requestSubmit(),
                                                });
                                            }}
                                        >
                                            {#if isAssigning && targetMentorId === mentor.mentorId}
                                                <Loader2
                                                    class="h-3.5 w-3.5 mr-1.5 animate-spin"
                                                />
                                                Assigning...
                                            {:else}
                                                Assign
                                            {/if}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            {#if pagination.totalPages > 0}
                <div
                    class="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/40"
                >
                    <span class="text-[14px] text-zinc-500">
                        Page <span class="font-semibold text-zinc-700"
                            >{pagination.page}</span
                        >
                        of {pagination.totalPages}
                        <span class="text-zinc-400 ml-1"
                            >({pagination.totalItems} mentors)</span
                        >
                    </span>
                    <div class="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            class="h-7 w-7 rounded-md"
                            disabled={pagination.page <= 1}
                            onclick={() =>
                                handlePageChange(pagination.page - 1)}
                        >
                            <ChevronLeft class="h-3.5 w-3.5" />
                        </Button>
                        {#each pageNumbers as pageNum}
                            {#if pageNum === pagination.page}
                                <Button
                                    variant="outline"
                                    class="h-8 w-8 rounded-md p-0 text-[14px] bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 font-semibold cursor-default"
                                    >{pageNum}</Button
                                >
                            {:else}
                                <Button
                                    variant="ghost"
                                    class="h-7 w-7 rounded-md p-0 text-xs text-zinc-500 cursor-pointer"
                                    onclick={() => handlePageChange(pageNum)}
                                    >{pageNum}</Button
                                >
                            {/if}
                        {/each}
                        <Button
                            variant="outline"
                            size="icon"
                            class="h-7 w-7 rounded-md"
                            disabled={pagination.page >= pagination.totalPages}
                            onclick={() =>
                                handlePageChange(pagination.page + 1)}
                        >
                            <ChevronRight class="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            {/if}
        </div>

        <!-- ── ROW 2: Topic + Group — 2 cột ─────────────── -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <!-- Topic Card -->
            <div
                class="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
            >
                <div
                    class="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between"
                >
                    <span
                        class="text-[16px] font-bold text-zinc-400 uppercase tracking-wider"
                        >Topic</span
                    >
                    {#if topic}
                        <Badge
                            variant="outline"
                            class="bg-orange-50 text-orange-600 border-orange-200 text-[10px] gap-1"
                        >
                            <div
                                class="h-1.5 w-1.5 rounded-full bg-orange-500"
                            ></div>
                            {topic.status}
                        </Badge>
                    {/if}
                </div>
                <div class="px-5 py-4">
                    {#if topic}
                        <div class="space-y-4">
                            <div class="flex items-center gap-3">
                                {#if topic.logoUrl}
                                    <img
                                        src={topic.logoUrl}
                                        alt="Logo"
                                        class="h-12 w-12 rounded-lg border border-zinc-200 object-cover shadow-sm shrink-0"
                                        onerror={(e) =>
                                            ((
                                                e.currentTarget as HTMLImageElement
                                            ).style.display = "none")}
                                    />
                                {:else}
                                    <div
                                        class="h-15 w-15 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0"
                                    >
                                        <BookOpen
                                            class="h-8 w-8 text-zinc-400"
                                        />
                                    </div>
                                {/if}
                                <h3
                                    class="text-[13px] font-bold text-zinc-900 leading-tight"
                                >
                                    {topic.title}
                                </h3>
                            </div>
                            <Separator />
                            <div>
                                <p
                                    class="text-[14px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5"
                                >
                                    Description
                                </p>
                                <p
                                    class="text-[13px] text-zinc-600 leading-relaxed bg-zinc-50 border border-zinc-100 rounded-lg p-3"
                                >
                                    {topic.description}
                                </p>
                            </div>
                            <div>
                                <p
                                    class="text-[14px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5"
                                >
                                    Objectives
                                </p>
                                <p
                                    class="text-[13px] text-zinc-600 leading-relaxed bg-zinc-50 border border-zinc-100 rounded-lg p-3"
                                >
                                    {topic.objectives}
                                </p>
                            </div>
                        </div>
                    {:else}
                        <div
                            class="flex flex-col items-center justify-center gap-2 py-10 text-center"
                        >
                            <div
                                class="h-15 w-15 rounded-full bg-zinc-100 flex items-center justify-center mb-1"
                            >
                                <BookOpen class="h-8 w-8 text-zinc-400" />
                            </div>
                            <p class="text-[14px] font-medium text-zinc-500">
                                No topic assigned
                            </p>
                            <p class="text-[14px] text-zinc-400">
                                This group has not been assigned a topic yet.
                            </p>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Group Card -->
            {#if group}
                <div
                    class="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
                >
                    <div
                        class="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between"
                    >
                        <span
                            class="text-[16px] font-bold text-zinc-400 uppercase tracking-wider"
                            >Group</span
                        >
                        <Badge
                            variant="outline"
                            class="bg-green-50 text-green-700 border-green-200 text-[14px]"
                        >
                            {group.status}
                        </Badge>
                    </div>
                    <div class="px-5 py-4">
                        <div class="mb-4">
                            <h2 class="text-[18px] font-bold text-zinc-900">
                                {group.groupName}
                            </h2>
                            <div
                                class="flex items-center gap-3 text-[14px] text-zinc-500 mt-1"
                            >
                                <span class="flex items-center gap-1">
                                    <BookOpen class="h-3.5 w-3.5" />
                                    {group.classCode}
                                </span>
                                <span class="text-zinc-300">·</span>
                                <span class="flex items-center gap-1">
                                    <Users class="h-3.5 w-3.5" />
                                    {group.members?.length || 0} members
                                </span>
                            </div>
                        </div>

                        <div class="space-y-2">
                            {#each group.members as member}
                                <div
                                    class="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-50 border border-zinc-100"
                                >
                                    <div
                                        class="flex items-center gap-2.5 min-w-0"
                                    >
                                        <div
                                            class="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[14px] font-bold shrink-0"
                                        >
                                            {getInitials(member.fullName)}
                                        </div>
                                        <div class="min-w-0">
                                            <span
                                                class="text-[14px] font-semibold text-zinc-800 truncate block"
                                                >{member.fullName}</span
                                            >
                                            <span
                                                class="text-[13px] text-zinc-400 font-mono"
                                                >{member.studentCode}</span
                                            >
                                        </div>
                                    </div>
                                    {#if member.isLeader}
                                        <Badge
                                            variant="outline"
                                            class="bg-orange-50 text-orange-600 border-orange-200 text-[14px] px-1.5 py-0 gap-1 shrink-0"
                                        >
                                            <Star
                                                class="h-3 w-3 fill-orange-500"
                                            /> Leader
                                        </Badge>
                                    {:else}
                                        <span
                                            class="text-[14px] text-zinc-400 shrink-0"
                                            >Member</span
                                        >
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- ── Mentor Detail Dialog ──────────────────────────── -->
<Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content class="sm:max-w-[520px] bg-white">
        {#if selectedMentor}
            <Dialog.Header>
                <div class="flex items-center gap-4">
                    <div
                        class="h-14 w-14 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-lg font-bold shrink-0"
                    >
                        {getInitials(selectedMentor.fullName)}
                    </div>
                    <div>
                        <Dialog.Title class="text-xl font-bold text-zinc-900">
                            {selectedMentor.fullName}
                        </Dialog.Title>
                        <Dialog.Description
                            class="flex items-center gap-2 mt-1"
                        >
                            <Badge
                                variant="secondary"
                                class="bg-zinc-100 text-zinc-600 font-mono text-[14px] font-normal"
                            >
                                {selectedMentor.mentorCode}
                            </Badge>
                            {#if selectedMentor.isActive}
                                <span
                                    class="flex items-center gap-1 text-[14px] text-green-600 font-semibold"
                                >
                                    <span
                                        class="h-1.5 w-1.5 rounded-full bg-green-500"
                                    ></span> Active
                                </span>
                            {/if}
                        </Dialog.Description>
                    </div>
                </div>
            </Dialog.Header>

            <div class="space-y-3 py-3">
                <!-- Contact -->
                <div
                    class="rounded-lg bg-zinc-50 border border-zinc-100 p-4 space-y-2.5"
                >
                    <p
                        class="text-[14px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                        Contact
                    </p>
                    <div class="flex items-center gap-2.5 text-zinc-700">
                        <Mail class="h-4 w-4 text-zinc-400 shrink-0" />
                        <span class="text-[14px]">{selectedMentor.email}</span>
                    </div>
                    {#if selectedMentor.phoneNumber}
                        <div class="flex items-center gap-2.5 text-zinc-700">
                            <Phone class="h-4 w-4 text-zinc-400 shrink-0" />
                            <span class="text-[14px]"
                                >{selectedMentor.phoneNumber}</span
                            >
                        </div>
                    {/if}
                </div>

                <!-- Professional -->
                <div
                    class="rounded-lg bg-zinc-50 border border-zinc-100 p-4 space-y-3"
                >
                    <p
                        class="text-[14px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                        Professional
                    </p>
                    <div class="flex items-start gap-2.5">
                        <Briefcase
                            class="h-4 w-4 text-zinc-400 mt-0.5 shrink-0"
                        />
                        <div>
                            <p class="text-[14px] font-semibold text-zinc-800">
                                {selectedMentor.currentPosition || "N/A"}
                            </p>
                            <p class="text-[14px] text-zinc-500">
                                at {selectedMentor.currentCompany || "N/A"}
                            </p>
                        </div>
                    </div>
                    <div
                        class="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200"
                    >
                        <div>
                            <p class="text-[14px] text-zinc-400 mb-0.5">
                                Field of Work
                            </p>
                            <p class="text-[13px] font-semibold text-zinc-800">
                                {selectedMentor.fieldOfWork || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p class="text-[14px] text-zinc-400 mb-0.5">
                                Experience
                            </p>
                            <p class="text-[13px] font-semibold text-zinc-800">
                                {selectedMentor.yearsOfExperience
                                    ? `${selectedMentor.yearsOfExperience} years`
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Assigned Groups -->
                <div
                    class="rounded-lg bg-zinc-50 border border-zinc-100 p-4 space-y-2.5"
                >
                    <p
                        class="text-[14px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"
                    >
                        <Users class="h-4 w-4" />
                        Mentoring ({selectedMentor.assignedGroups?.length || 0})
                    </p>
                    {#if selectedMentor.assignedGroups?.length > 0}
                        <div class="space-y-2">
                            {#each selectedMentor.assignedGroups as ag}
                                <div
                                    class="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-zinc-100"
                                >
                                    <div>
                                        <p
                                            class="text-[14px] font-semibold text-zinc-900"
                                        >
                                            {ag.groupName}
                                        </p>
                                        <p
                                            class="text-[14px] text-zinc-500 flex items-center gap-1 mt-0.5"
                                        >
                                            <Star
                                                class="h-2.5 w-2.5 fill-orange-500 text-orange-500"
                                            />
                                            {ag.leaderName}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        class="text-[12px] text-zinc-500 font-normal"
                                        >#{ag.groupId}</Badge
                                    >
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-[14px] text-zinc-400 italic">
                            Not mentoring any groups.
                        </p>
                    {/if}
                </div>

                <!-- Biography -->
                {#if selectedMentor.biography}
                    <div
                        class="rounded-lg bg-zinc-50 border border-zinc-100 p-4"
                    >
                        <p
                            class="text-[14px] font-bold text-zinc-400 uppercase tracking-widest mb-2"
                        >
                            Biography
                        </p>
                        <p class="text-[13px] text-zinc-600 leading-relaxed">
                            {selectedMentor.biography}
                        </p>
                    </div>
                {/if}
            </div>

            <Dialog.Footer>
                <Button
                    variant="outline"
                    onclick={() => (isDialogOpen = false)}
                    class="text-zinc-600 text-sm"
                >
                    Close
                </Button>
                <Button
                    class="bg-orange-500 hover:bg-orange-600 text-white shadow-sm text-sm cursor-pointer"
                    onclick={() => {
                        targetMentorId = selectedMentor.mentorId;
                        setActions({
                            active: true,
                            description: `Are you sure you want to assign ${selectedMentor.fullName} to this group?`,
                            cb: () => assignFormEl?.requestSubmit(),
                        });
                    }}
                >
                    <UserCheck class="h-4 w-4 mr-1.5" />
                    Assign Mentor
                </Button>
            </Dialog.Footer>
        {/if}
    </Dialog.Content>
</Dialog.Root>
