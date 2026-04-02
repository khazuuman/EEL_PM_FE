<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import * as Dialog from "$lib/components/ui/dialog";
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
        UsersIcon,
        UserIcon,
        EyeIcon,
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
    import Avatar from "$lib/components/ui/avatar/avatar.svelte";

    let { data }: { data: PageData } = $props();
    const g = $derived(data.groupDetails as any);
    const classId = $derived(page.url.pathname.match(/\/class\/(\d+)/)?.[1]);
    const members = $derived(g.members ?? []);
    const pageUrl = $derived(page.url.pathname);
    const mentor = $derived(g.mentor ?? null);

    const statusColor: Record<string, string> = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Rejected: "bg-red-100 text-red-700 border-red-200",
        Pending: "bg-amber-100 text-amber-700 border-amber-200",
        Inactive: "bg-gray-100 text-gray-500 border-gray-200",
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

    // Dialog state for student detail
    let studentDetailOpen = $state(false);
    let selectedStudent = $state<any>(null);
    let isFetchingStudent = $state(false);

    // Xử lý enhance khi bấm View Detail (gọi action getStudentDetail)
    const handleStudentDetailEnhance: SubmitFunction = () => {
        isFetchingStudent = true;
        return async ({ result }) => {
            isFetchingStudent = false;
            if (result.type === "success" && result.data?.students) {
                selectedStudent = result.data.students;
                studentDetailOpen = true;
            } else {
                toast.error("Failed to load student details");
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

<div class="min-h-screen bg-white pt-16 font-sans">
    <!-- ─── Sticky Top Bar ─────────────────────────────────────────────── -->
    <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm">
        <Button
            variant="ghost"
            onclick={() =>
                goto(`/app/lecturer/class/${classId}/manage-groups`)}
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            <span class="text-sm font-semibold">Back to Groups</span>
        </Button>

        <div class="flex items-center gap-2">
            <Button
                variant="outline"
                class="flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer"
                href="{pageUrl}/update"
            >
                <PencilIcon class="h-4 w-4" />
                Update
            </Button>
            <Button
                variant="outline"
                disabled={isSubmitting}
                class="flex items-center gap-2 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-sm cursor-pointer"
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

    <!-- ─── Main Content ──────────────────────────────────────────── -->
    <div class="mx-auto max-w-[1600px] px-6 py-8 space-y-8">
        <!-- Group Header Banner -->
        <div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div class="flex items-center justify-between gap-6 flex-wrap">
                <div class="flex items-center gap-5">
                    <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 shrink-0">
                        <LayersIcon class="h-8 w-8 text-amber-600" />
                    </span>
                    <div>
                        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {g.groupName}
                        </h1>
                        {#if g.groupDescription}
                            <p class="mt-1 text-base text-gray-500 max-w-xl leading-relaxed">
                                {g.groupDescription}
                            </p>
                        {:else}
                            <p class="mt-1 text-sm italic text-gray-400">
                                No description provided.
                            </p>
                        {/if}
                    </div>
                </div>

                <!-- Meta chips -->
                <div class="flex flex-col items-end gap-3">
                    <Badge
                        class={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest border ${
                            statusColor[g.status] ?? "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                    >
                        {g.status}
                    </Badge>
                    <div class="flex items-center gap-3 flex-wrap justify-end">
                        <div class="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-sm text-gray-600">
                            <BookOpenIcon class="h-4 w-4 text-amber-500" />
                            <span class="font-semibold">{g.classCode}</span>
                        </div>
                        <div class="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-sm text-gray-600">
                            <CalendarIcon class="h-4 w-4 text-amber-500" />
                            <span class="font-semibold">{g.semesterCode}</span>
                        </div>
                        <div class="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-sm text-gray-600">
                            <UsersIcon class="h-4 w-4 text-amber-500" />
                            <span class="font-semibold">{members.length} members</span>
                        </div>
                        <div class="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-sm text-gray-600">
                            <GraduationCapIcon class="h-4 w-4 text-amber-500" />
                            <span class="font-semibold">{totalMajors} majors</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ─── Two-column grid ───────────────────────────────────── -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
            <!-- LEFT COLUMN: Topic + Mentor (Takes 4 cols on XL) -->
            <div class="space-y-6 xl:col-span-4">
                <!-- Topic card -->
                <div class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                        <h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500">
                            <GraduationCapIcon class="h-4 w-4 text-amber-500" />
                            Topic
                        </h2>
                    </div>
                    <div class="px-6 py-5">
                        {#if g.topic}
                            <p class="text-base font-semibold text-gray-900 leading-relaxed">
                                {g.topic.title}
                            </p>
                        {:else}
                            <div class="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5">
                                <span class="text-sm italic text-gray-400">No topic assigned yet.</span>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Mentor card -->
                <div class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                        <h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500">
                            <BriefcaseIcon class="h-4 w-4 text-amber-500" />
                            Assigned Mentor
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            class="h-7 text-xs bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
                            href="{pageUrl}/assign-mentor"
                        >
                            {mentor ? "Change" : "Assign"}
                        </Button>
                    </div>

                    <div class="px-6 py-5">
                        {#if mentor}
                            <div class="flex items-center gap-4 mb-4">
                                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-lg">
                                    {mentor.fullName?.charAt(0) ?? "M"}
                                </div>
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2">
                                        <h3 class="text-lg font-bold text-gray-900 truncate">
                                            {mentor.fullName}
                                        </h3>
                                        <Badge class="bg-gray-100 border-gray-200 text-gray-600 font-mono text-[10px] px-1.5 py-0 uppercase shadow-none">
                                            {mentor.mentorCode}
                                        </Badge>
                                    </div>
                                    {#if mentor.currentPosition || mentor.currentCompany}
                                        <p class="text-sm text-gray-500 mt-0.5 truncate">
                                            {mentor.currentPosition || "Mentor"}
                                            · {mentor.currentCompany || "N/A"}
                                        </p>
                                    {/if}
                                </div>
                            </div>
                            <Separator class="bg-gray-100 my-4" />
                            <div class="space-y-3 text-sm text-gray-600">
                                <div class="flex items-center gap-2.5">
                                    <MailIcon class="h-4 w-4 text-gray-400 shrink-0" />
                                    <span class="truncate">{mentor.email}</span>
                                </div>
                                {#if mentor.phoneNumber}
                                    <div class="flex items-center gap-2.5">
                                        <PhoneIcon class="h-4 w-4 text-gray-400 shrink-0" />
                                        <span>{mentor.phoneNumber}</span>
                                    </div>
                                {/if}
                                <div class="flex items-center gap-2.5">
                                    <BookOpenIcon class="h-4 w-4 text-gray-400 shrink-0" />
                                    <span>{mentor.fieldOfWork || "General"}</span>
                                </div>
                                <div class="flex items-center gap-2.5">
                                    <CalendarIcon class="h-4 w-4 text-gray-400 shrink-0" />
                                    <span>
                                        {mentor.yearsOfExperience ? `${mentor.yearsOfExperience} yrs exp.` : "N/A"}
                                    </span>
                                </div>
                            </div>
                        {:else}
                            <div class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8">
                                <span class="text-sm text-gray-500 text-center">No mentor assigned yet.</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    class="text-gray-700 bg-white text-xs border-gray-200 shadow-sm cursor-pointer"
                                    href="{pageUrl}/assign-mentor"
                                >
                                    Find a Mentor
                                </Button>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: Members Table (Takes 8 cols on XL) -->
            <div class="xl:col-span-8">
                <div class="rounded-2xl border border-gray-200 bg-white shadow-sm h-full overflow-hidden">
                    <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                        <h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500">
                            <UsersIcon class="h-4 w-4 text-amber-500" />
                            Group Members
                            <span class="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                                {members.length}
                            </span>
                        </h2>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm whitespace-nowrap">
                            <thead class="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th class="px-6 py-4 font-semibold">Student Name</th>
                                    <th class="px-6 py-4 font-semibold">Code</th>
                                    <th class="px-6 py-4 font-semibold">Major</th>
                                    <th class="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                {#each members as member}
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 font-bold text-amber-700 border border-amber-100">
                                                    {member.fullName?.charAt(0) ?? "?"}
                                                </div>
                                                <div>
                                                    <div class="flex items-center gap-2">
                                                        <span class="font-bold text-gray-900 text-base">{member.fullName}</span>
                                                        {#if member.isLeader}
                                                            <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                                                                <CrownIcon class="h-3 w-3" />
                                                                Leader
                                                            </span>
                                                        {/if}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-gray-500 font-mono">
                                            {member.studentCode}
                                        </td>
                                        <td class="px-6 py-4 text-gray-600">
                                            {member.majorName}
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <form
                                                method="POST"
                                                action="?/getStudentDetail"
                                                use:enhance={handleStudentDetailEnhance}
                                            >
                                                <input type="hidden" name="stuId" value={member.studentId} />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    disabled={isFetchingStudent}
                                                    class="h-8 gap-1.5 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                                                >
                                                    <EyeIcon class="h-3.5 w-3.5" />
                                                    View
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                        {#if members.length === 0}
                            <div class="py-12 text-center text-gray-400 text-sm">
                                No members found.
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ─── Student Detail Dialog ────────────────────────────────────────── -->
<Dialog.Root bind:open={studentDetailOpen}>
    <Dialog.Content class="sm:max-w-lg bg-white p-0 overflow-hidden rounded-2xl shadow-lg border-gray-200">
        <!-- Header -->
        <div class="bg-gray-50/60 border-b border-gray-100 px-6 py-4 flex items-center gap-4">
            <div class="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <UserIcon class="h-6 w-6" />
            </div>
            <div>
                <Dialog.Title class="text-xl font-bold text-gray-900 tracking-tight">Student Details</Dialog.Title>
                <Dialog.Description class="text-xs text-gray-500 mt-0.5">
                    Comprehensive profile information.
                </Dialog.Description>
            </div>
        </div>

        {#if selectedStudent}
            <div class="px-6 py-6 space-y-6">
                <!-- Avatar & Name -->
                <div class="flex items-center gap-5">
                    <div class="h-16 w-16 shrink-0 rounded-full bg-amber-50 flex items-center justify-center border-2 border-amber-100 text-amber-700 font-extrabold text-2xl shadow-sm">
                        {selectedStudent.fullName?.charAt(0) ?? "?"}
                    </div>
                    <div>
                        <h3 class="text-2xl font-extrabold text-gray-900 leading-tight">
                            {selectedStudent.fullName}
                        </h3>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                {selectedStudent.studentCode}
                            </span>
                            {#if selectedStudent.gender}
                                <span class="text-xs text-gray-400">•</span>
                                <span class="text-sm text-gray-500">{selectedStudent.gender}</span>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-colors hover:bg-gray-50 hover:border-gray-200">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <MailIcon class="h-3 w-3" /> Email
                        </p>
                        <p class="text-sm font-semibold text-gray-900 break-all">
                            {selectedStudent.email ?? "—"}
                        </p>
                    </div>

                    <div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-colors hover:bg-gray-50 hover:border-gray-200">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <BookOpenIcon class="h-3 w-3" /> Class
                        </p>
                        <p class="text-sm font-semibold text-gray-900">
                            {selectedStudent.className ?? "—"}
                        </p>
                    </div>

                    <div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-colors hover:bg-gray-50 hover:border-gray-200">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <GraduationCapIcon class="h-3 w-3" /> Major
                        </p>
                        <p class="text-sm font-semibold text-gray-900">
                            {selectedStudent.majorName ?? "—"}
                        </p>
                    </div>

                    <div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-colors hover:bg-gray-50 hover:border-gray-200">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <PhoneIcon class="h-3 w-3" /> Phone
                        </p>
                        <p class="text-sm font-semibold text-gray-900">
                            {selectedStudent.phoneNumber ?? "—"}
                        </p>
                    </div>

                    <div class="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-colors hover:bg-gray-50 hover:border-gray-200 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Campus</p>
                            <p class="text-sm font-semibold text-gray-900">{selectedStudent.campusName ?? "—"}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Enrollment</p>
                            <p class="text-sm font-semibold text-gray-900">{selectedStudent.enrollmentYear ?? "—"}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-100 bg-gray-50/60 px-6 py-4 flex justify-end">
                <Button
                    variant="outline"
                    class="bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer shadow-sm px-6 font-semibold"
                    onclick={() => (studentDetailOpen = false)}
                >
                    Close
                </Button>
            </div>
        {:else}
            <div class="p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500"></div>
                <p class="text-sm font-medium">Fetching details...</p>
            </div>
        {/if}
    </Dialog.Content>
</Dialog.Root>