<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import {
        ArrowLeftIcon,
        BookOpenIcon,
        CalendarIcon,
        CheckCircle2Icon,
        CheckSquareIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
        ClipboardListIcon,
        ClockIcon,
        CrownIcon,
        EyeIcon,
        GraduationCapIcon,
        HistoryIcon,
        LayersIcon,
        TrophyIcon,
        UsersIcon,
        XCircleIcon,
        AlertCircleIcon,
        MailIcon,
        PhoneIcon,
        BriefcaseIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import Button from "$lib/components/ui/button/button.svelte";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import StudentDetailsDialog from "../../../lecturer/class/[classId]/components/StudentDetailsDialog.svelte";
    import * as Table from "$lib/components/ui/table/index";

    let { data }: { data: PageData } = $props();
    const g = $derived(data.groupDetails as any);
    const members = $derived(g.members ?? []);
    const mentor = $derived(data.groupDetails?.mentor as any);

    const statusColor: Record<string, string> = {
        Approved: "bg-green-100 text-green-700 border-green-200",
        Rejected: "bg-red-100 text-red-700 border-red-200",
        Pending: "bg-amber-100 text-amber-700 border-amber-200",
        Inactive: "bg-gray-100 text-gray-500 border-gray-200",
        Active: "bg-green-100 text-green-700 border-green-200",
        Draft: "bg-stone-100 text-stone-500 border-stone-200",
        Completed: "bg-blue-100 text-blue-700 border-blue-200",
    };

    const topicStatusColor: Record<string, string> = {
        Approved: "bg-green-100 text-green-700 border-green-200",
        Pending: "bg-amber-100 text-amber-700 border-amber-200",
        Rejected: "bg-red-100 text-red-700 border-red-200",
    };

    const typeClass: Record<string, string> = {
        Checkpoint: "bg-amber-100 text-amber-700 border-amber-200",
        Outcome: "bg-purple-100 text-purple-700 border-purple-200",
        Other: "bg-sky-100 text-sky-700 border-sky-200",
    };

    const majorStats = $derived(
        members.reduce((acc: Record<string, number>, member: any) => {
            const major = member.majorCode ?? "Unknown";
            acc[major] = (acc[major] ?? 0) + 1;
            return acc;
        }, {}),
    );
    const totalMajors = $derived(Object.keys(majorStats).length);

    // Student detail dialog
    let studentDetailOpen = $state(false);
    let selectedStudent = $state<any>(null);
    let isFetchingStudent = $state(false);

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

    function formatDate(val: string | undefined): string {
        if (!val) return "—";
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${dd}/${mm}/${yyyy} ${HH}:${min}`;
    }

    function goToPage(paramKey: string, p: number) {
        const url = new URL(window.location.href);
        url.searchParams.set(paramKey, String(p));
        goto(url.toString());
    }
</script>

<div class="min-h-screen bg-white font-sans">
    <!-- ─── Sticky Top Bar ─────────────────────────────────────────── -->
    <div
        class="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white/95 px-8 py-3 shadow-sm backdrop-blur-sm"
    >
        <Button
            variant="ghost"
            onclick={() => history.back()}
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            <span class="text-sm font-semibold">Back</span>
        </Button>
    </div>

    <!-- ─── Overview Banner ───────────────────────────────────────── -->
    <div class="border-b border-gray-100 bg-gray-50/60 px-8 py-6">
        <div class="flex items-start justify-between gap-6 flex-wrap">
            <div class="flex items-center gap-5">
                <span
                    class="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 shrink-0"
                >
                    <LayersIcon class="h-7 w-7 text-amber-600" />
                </span>
                <div>
                    <div class="flex items-center gap-3">
                        <h1
                            class="text-3xl font-extrabold text-gray-900 tracking-tight"
                        >
                            {g.groupName}
                        </h1>
                        <Badge
                            class={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest border ${statusColor[g.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}
                        >
                            {g.status}
                        </Badge>
                    </div>
                    <p class="text-sm text-gray-400 mt-1">
                        {g.groupDescription || "No description provided."}
                    </p>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
                >
                    <BookOpenIcon class="h-4 w-4 text-amber-500" />
                    <span class="font-medium">{g.classCode}</span>
                </div>
                <div
                    class="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
                >
                    <CalendarIcon class="h-4 w-4 text-amber-500" />
                    <span class="font-medium">{g.semesterCode}</span>
                </div>
                <div
                    class="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
                >
                    <UsersIcon class="h-4 w-4 text-amber-500" />
                    <span class="font-medium">{members.length} members</span>
                </div>
                <div
                    class="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
                >
                    <GraduationCapIcon class="h-4 w-4 text-amber-500" />
                    <span class="font-medium">{totalMajors} majors</span>
                </div>
            </div>
        </div>
    </div>

    <!-- ─── Content ──────────────────────────────────────────────── -->
    <div class="px-8 py-8 space-y-10">
        <!-- § Members -->
        <section class="space-y-4">
            <h2
                class="flex items-center gap-2 text-base font-bold text-gray-800"
            >
                <UsersIcon class="h-5 w-5 text-amber-500" />
                Group Members
                <span
                    class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700"
                >
                    {members.length}
                </span>
            </h2>

            {#if members.length > 0}
                <div class="rounded-xl border border-gray-200 overflow-hidden">
                    <table class="w-full text-sm text-left">
                        <thead
                            class="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-400"
                        >
                            <tr>
                                <th class="px-6 py-3.5 font-semibold w-12">#</th
                                >
                                <th class="px-6 py-3.5 font-semibold">Name</th>
                                <th class="px-6 py-3.5 font-semibold"
                                    >Student Code</th
                                >
                                <th class="px-6 py-3.5 font-semibold">Major</th>
                                <th class="px-6 py-3.5 font-semibold text-right"
                                    >Action</th
                                >
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            {#each members as member, i}
                                <tr
                                    class="hover:bg-gray-50/60 transition-colors"
                                >
                                    <td
                                        class="px-6 py-4 text-gray-400 tabular-nums text-sm"
                                        >{i + 1}</td
                                    >
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 font-bold text-amber-700 text-sm border border-amber-100"
                                            >
                                                {member.fullName?.charAt(0) ??
                                                    "?"}
                                            </div>
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <span
                                                    class="font-semibold text-gray-900"
                                                    >{member.fullName}</span
                                                >
                                                {#if member.isLeader}
                                                    <span
                                                        class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-700"
                                                    >
                                                        <CrownIcon
                                                            class="h-3 w-3"
                                                        />
                                                        Leader
                                                    </span>
                                                {/if}
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        class="px-6 py-4 font-mono text-sm text-gray-500"
                                        >{member.studentCode}</td
                                    >
                                    <td class="px-6 py-4 text-gray-600 text-sm"
                                        >{member.majorName}</td
                                    >
                                    <td class="px-6 py-4 text-right">
                                        <form
                                            method="POST"
                                            action="?/getStudentDetail"
                                            use:enhance={handleStudentDetailEnhance}
                                        >
                                            <input
                                                type="hidden"
                                                name="stuId"
                                                value={member.studentId}
                                            />
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
                </div>
            {:else}
                <div
                    class="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm italic text-gray-400"
                >
                    No members found.
                </div>
            {/if}
        </section>

        <Separator />

        <!-- § Topic -->
        <section class="space-y-4">
            <h2
                class="flex items-center gap-2 text-base font-bold text-gray-800"
            >
                <GraduationCapIcon class="h-5 w-5 text-amber-500" />
                Topic
            </h2>

            {#if g.topic}
                <div
                    class="flex items-start justify-between gap-6 rounded-xl border border-gray-200 bg-gray-50/60 px-6 py-5"
                >
                    <div class="min-w-0 flex-1 space-y-2">
                        <div class="flex items-start gap-3 flex-wrap">
                            <p
                                class="text-lg font-bold text-gray-900 leading-snug"
                            >
                                {g.topic.title}
                            </p>
                            {#if g.topic.status}
                                <Badge
                                    class={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide border ${topicStatusColor[g.topic.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}
                                >
                                    {g.topic.status}
                                </Badge>
                            {/if}
                        </div>
                        {#if g.topic.description}
                            <p
                                class="text-sm text-gray-500 line-clamp-2 max-w-2xl"
                            >
                                {g.topic.description}
                            </p>
                        {/if}
                    </div>

                    <!-- <div class="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            class="h-9 px-4 text-sm text-violet-700 border-violet-200 bg-violet-50 hover:bg-violet-100 cursor-pointer"
                            onclick={() =>
                                goto(
                                    `/app/mentor/groups/${g.groupId}/topic/history`,
                                )}
                        >
                            <HistoryIcon class="h-4 w-4 mr-1.5" />
                            Topic History
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            class="h-9 px-4 text-sm text-gray-700 border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                            href="/app/mentor/groups/{g.groupId}/topic/{g.topic
                                .id}"
                        >
                            <EyeIcon class="h-4 w-4 mr-1.5" />
                            View Detail
                        </Button>
                    </div> -->
                </div>
            {:else}
                <div
                    class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-sm italic text-gray-400"
                >
                    No topic assigned yet.
                </div>
            {/if}
        </section>
        <!-- § Mentor -->
        <section class="space-y-4">
            <div class="flex items-center justify-between">
                <h2
                    class="flex items-center gap-2 text-base font-bold text-gray-800"
                >
                    <BriefcaseIcon class="h-5 w-5 text-amber-500" />
                    Assigned Mentor
                </h2>
            </div>
            {#if mentor}
                <div
                    class="rounded-xl border border-gray-200 bg-gray-50/60 px-6 py-5"
                >
                    <!-- Mentor header -->
                    <div class="flex items-center gap-4 mb-5">
                        <div
                            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-lg"
                        >
                            {mentor.fullName?.charAt(0) ?? "M"}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-lg font-bold text-gray-900"
                                    >{mentor.fullName}</span
                                >
                                <Badge
                                    class="bg-gray-100 border-gray-200 text-gray-500 font-mono text-xs px-2 py-0.5 shadow-none"
                                >
                                    {mentor.mentorCode}
                                </Badge>
                            </div>
                            {#if mentor.currentPosition || mentor.currentCompany}
                                <p class="text-sm text-gray-500 mt-0.5">
                                    {mentor.currentPosition || "Mentor"} · {mentor.currentCompany ||
                                        "N/A"}
                                </p>
                            {/if}
                        </div>
                    </div>

                    <!-- Mentor details grid -->
                    <div
                        class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-600 lg:grid-cols-4"
                    >
                        <div class="flex items-center gap-2">
                            <MailIcon class="h-4 w-4 text-gray-400 shrink-0" />
                            <span class="truncate">{mentor.email}</span>
                        </div>
                        {#if mentor.phoneNumber}
                            <div class="flex items-center gap-2">
                                <PhoneIcon
                                    class="h-4 w-4 text-gray-400 shrink-0"
                                />
                                <span>{mentor.phoneNumber}</span>
                            </div>
                        {/if}
                        <div class="flex items-center gap-2">
                            <BookOpenIcon
                                class="h-4 w-4 text-gray-400 shrink-0"
                            />
                            <span>{mentor.fieldOfWork || "General"}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <CalendarIcon
                                class="h-4 w-4 text-gray-400 shrink-0"
                            />
                            <span
                                >{mentor.yearsOfExperience
                                    ? `${mentor.yearsOfExperience} yrs exp.`
                                    : "N/A"}</span
                            >
                        </div>
                    </div>
                </div>
            {:else}
                <div
                    class="flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8"
                >
                    <span class="text-sm italic text-gray-400"
                        >No mentor assigned yet.</span
                    >
                </div>
            {/if}
        </section>
    </div>
</div>

<StudentDetailsDialog bind:open={studentDetailOpen} student={selectedStudent} />
