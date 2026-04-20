<script lang="ts">
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import Badge from '$lib/components/ui/badge/badge.svelte';
    import Button from '$lib/components/ui/button/button.svelte';
    import {
        ArrowLeftIcon,
        BookOpenIcon,
        UsersIcon,
        UserIcon,
        GraduationCapIcon,
        CalendarIcon,
        CheckCircleIcon,
        ClockIcon,
        TargetIcon,
        BuildingIcon,
        MailIcon,
        BadgeIcon,
        GitBranchIcon,
    } from 'lucide-svelte';

    let { data }: { data: PageData } = $props();
    const topic = data.courseDetails;

    function formatDate(val: string | undefined) {
        if (!val) return '—';
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${HH}:${min}`;
    }

    const statusMap: Record<string, string> = {
        Approved:  'bg-green-100 text-green-700 border-green-200',
        Pending:   'bg-amber-100 text-amber-700 border-amber-200',
        Rejected:  'bg-red-100 text-red-600 border-red-200',
        Reviewing: 'bg-blue-100 text-blue-700 border-blue-200',
    };
</script>

<div class="bg-white w-full px-10 pt-6 pb-12 min-h-screen">

    <!-- Back -->
    <div class="flex items-center h-10 mb-2">
        <Button variant="ghost" onclick={() => history.back()}
            class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 cursor-pointer -ml-3">
            <ArrowLeftIcon class="w-4 h-4" /> Back
        </Button>
    </div>

    <!-- Page Header -->
    <div class="flex items-start gap-4 mb-8">
        {#if topic.logoUrl}
            <img
                src={topic.logoUrl}
                alt={topic.title}
                class="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
            />
        {:else}
            <div class="w-14 h-14 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                <BookOpenIcon class="w-7 h-7 text-violet-400" />
            </div>
        {/if}
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
                <p class="text-[11px] font-semibold text-violet-500 uppercase tracking-widest leading-none">
                    Topic #{topic.topicId}
                </p>
                {#if topic.isChangeRequest}
                    <span class="text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200 rounded-full px-2 py-0.5">
                        Change Request
                    </span>
                {/if}
            </div>
            <h1 class="text-2xl font-extrabold text-stone-900 leading-tight mb-2">{topic.title}</h1>
            <div class="flex items-center gap-2 flex-wrap">
                <Badge class="text-xs font-semibold border pointer-events-none {statusMap[topic.status] ?? 'bg-stone-100 text-stone-500 border-stone-200'}">
                    {topic.status}
                </Badge>
                <span class="text-xs text-stone-400">v{topic.versionNumber}</span>
                <span class="text-stone-200">•</span>
                <span class="text-xs text-stone-400 flex items-center gap-1">
                    <CalendarIcon class="w-3 h-3" />
                    Submitted {formatDate(topic.submittedAt)}
                </span>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-6">

        <!-- Description -->
        <section class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <BookOpenIcon class="w-3.5 h-3.5 text-violet-500" />
                </div>
                <h2 class="text-sm font-extrabold text-stone-900">Description</h2>
            </div>
            <div class="rounded-xl border border-stone-200 bg-stone-50 px-5 py-4">
                <p class="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{topic.description}</p>
            </div>
        </section>

        <!-- Objectives -->
        {#if topic.objectives}
        <section class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                    <TargetIcon class="w-3.5 h-3.5 text-green-500" />
                </div>
                <h2 class="text-sm font-extrabold text-stone-900">Objectives</h2>
            </div>
            <div class="rounded-xl border border-stone-200 bg-stone-50 px-5 py-4">
                <p class="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{topic.objectives}</p>
            </div>
        </section>
        {/if}

        <!-- 2 col: Group + Submitter -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Group Info -->
            <section class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                        <UsersIcon class="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <h2 class="text-sm font-extrabold text-stone-900">Group</h2>
                </div>
                <div class="rounded-xl border border-stone-200 bg-white px-5 py-4 flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-stone-400 font-medium">Group Name</span>
                        <span class="text-sm font-semibold text-stone-800">{topic.group?.groupName ?? '—'}</span>
                    </div>
                    <div class="border-t border-stone-100"></div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-stone-400 font-medium">Class Code</span>
                        <span class="text-sm font-semibold text-stone-800">{topic.group?.classCode ?? '—'}</span>
                    </div>
                    <div class="border-t border-stone-100"></div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-stone-400 font-medium">Status</span>
                        <Badge class="text-xs font-semibold border pointer-events-none {statusMap[topic.group?.status] ?? 'bg-stone-100 text-stone-500 border-stone-200'}">
                            {topic.group?.status ?? '—'}
                        </Badge>
                    </div>
                    <div class="border-t border-stone-100"></div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-stone-400 font-medium">Members</span>
                        <span class="text-sm font-semibold text-stone-800">{topic.group?.memberCount ?? 0} members</span>
                    </div>
                </div>
            </section>

            <!-- Submitted By -->
            <section class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <GraduationCapIcon class="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <h2 class="text-sm font-extrabold text-stone-900">Submitted By</h2>
                </div>
                <div class="rounded-xl border border-stone-200 bg-white px-5 py-4 flex flex-col gap-3">
                    <div class="flex items-center gap-3 mb-1">
                        <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <UserIcon class="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-stone-900">{topic.submittedBy?.fullName ?? '—'}</p>
                            <p class="text-xs text-stone-400">{topic.submittedBy?.studentCode ?? ''}</p>
                        </div>
                    </div>
                    <div class="border-t border-stone-100"></div>
                    <div class="flex items-center gap-2">
                        <MailIcon class="w-3.5 h-3.5 text-stone-300 shrink-0" />
                        <span class="text-sm text-stone-500">{topic.submittedBy?.email ?? '—'}</span>
                    </div>
                    <div class="border-t border-stone-100"></div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-stone-400 font-medium">Submitted At</span>
                        <span class="text-xs text-stone-600 font-medium">{formatDate(topic.submittedAt)}</span>
                    </div>
                </div>
            </section>
        </div>

        <!-- 2 col: Reviewer + Mentor -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Reviewed By -->
            <section class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                        <CheckCircleIcon class="w-3.5 h-3.5 text-green-500" />
                    </div>
                    <h2 class="text-sm font-extrabold text-stone-900">Reviewed By</h2>
                </div>
                <div class="rounded-xl border border-stone-200 bg-white px-5 py-4 flex flex-col gap-3">
                    {#if topic.reviewedBy}
                        <div class="flex items-center gap-3 mb-1">
                            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <UserIcon class="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-stone-900">{topic.reviewedBy.fullName}</p>
                                <p class="text-xs text-stone-400">Lecturer</p>
                            </div>
                        </div>
                        <div class="border-t border-stone-100"></div>
                        <div class="flex items-center gap-2">
                            <MailIcon class="w-3.5 h-3.5 text-stone-300 shrink-0" />
                            <span class="text-sm text-stone-500">{topic.reviewedBy.email}</span>
                        </div>
                        <div class="border-t border-stone-100"></div>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-stone-400 font-medium">Reviewed At</span>
                            <span class="text-xs text-stone-600 font-medium">{formatDate(topic.reviewedAt)}</span>
                        </div>
                        {#if topic.reviewFeedback}
                            <div class="border-t border-stone-100"></div>
                            <div>
                                <p class="text-xs text-stone-400 font-medium mb-1">Feedback</p>
                                <p class="text-sm text-stone-600">{topic.reviewFeedback}</p>
                            </div>
                        {/if}
                    {:else}
                        <p class="text-sm text-stone-400 py-4 text-center">Not reviewed yet</p>
                    {/if}
                </div>
            </section>

            <!-- Mentor -->
            <section class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                        <BadgeIcon class="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <h2 class="text-sm font-extrabold text-stone-900">Mentor</h2>
                </div>
                <div class="rounded-xl border border-stone-200 bg-white px-5 py-4 flex flex-col gap-3">
                    {#if topic.mentor}
                        <div class="flex items-center gap-3 mb-1">
                            <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                <UserIcon class="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-stone-900">{topic.mentor.fullName}</p>
                                <p class="text-xs text-stone-400">{topic.mentor.mentorCode}</p>
                            </div>
                        </div>
                        <div class="border-t border-stone-100"></div>
                        <div class="flex items-center gap-2">
                            <MailIcon class="w-3.5 h-3.5 text-stone-300 shrink-0" />
                            <span class="text-sm text-stone-500">{topic.mentor.email}</span>
                        </div>
                        {#if topic.mentor.currentPosition || topic.mentor.currentCompany}
                            <div class="border-t border-stone-100"></div>
                            <div class="flex items-center gap-2">
                                <BuildingIcon class="w-3.5 h-3.5 text-stone-300 shrink-0" />
                                <span class="text-sm text-stone-500">
                                    {[topic.mentor.currentPosition, topic.mentor.currentCompany].filter(Boolean).join(' @ ')}
                                </span>
                            </div>
                        {/if}
                        {#if topic.mentor.fieldOfWork}
                            <div class="border-t border-stone-100"></div>
                            <div class="flex items-center gap-2">
                                <GitBranchIcon class="w-3.5 h-3.5 text-stone-300 shrink-0" />
                                <span class="text-sm text-stone-500">{topic.mentor.fieldOfWork}</span>
                            </div>
                        {/if}
                    {:else}
                        <p class="text-sm text-stone-400 py-4 text-center">No mentor assigned</p>
                    {/if}
                </div>
            </section>
        </div>

    </div>
</div>