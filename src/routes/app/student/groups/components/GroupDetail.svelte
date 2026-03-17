<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog/index.js';
    import { Badge } from '$lib/components/ui/badge';
    import { UsersIcon, BookOpenIcon, HashIcon } from 'lucide-svelte';

    type Member = {
        studentId: number;
        studentCode: string;
        fullName: string;
        avatarUrl: string | null;
        campusName: string;
        majorCode: string;
        majorName: string;
        classCode: string;
        isLeader: boolean;
    };

    type GroupDetail = {
        groupId: number;
        groupName: string;
        groupDescription: string;
        status: string;
        members: Member[];
        topic: { id: number; title: string } | null;
    };

    type Props = {
        open: boolean;
        onOpenChange: (v: boolean) => void;
        group: GroupDetail | null;
    };

    let { open, onOpenChange, group }: Props = $props();

    const statusClass: Record<string, string> = {
        Draft:     'bg-stone-100 text-stone-600',
        Pending:   'bg-stone-100 text-stone-600',
        Approved:  'bg-green-100 text-green-700',
        Active:    'bg-green-100 text-green-700',
        Rejected:  'bg-red-100 text-red-600',
        Completed: 'bg-blue-100 text-blue-700'
    };

    let sortedMembers = $derived(
        [...(group?.members ?? [])].sort((a, b) => {
            if (a.isLeader === b.isLeader) return 0;
            return a.isLeader ? -1 : 1;
        })
    );

    function getInitials(name: string) {
        return name
            .split(' ')
            .slice(-2)
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    }
</script>

<Dialog.Root {open} {onOpenChange}>
    <Dialog.Content class="max-w-2xl p-0 overflow-hidden rounded-2xl">
        <!-- Header -->
        <div class="bg-black px-6 pt-6 pb-5">
            <div class="flex items-start justify-between gap-4">
                <div class="flex flex-col gap-1">
                    <p class="text-xs font-medium text-orange-400 uppercase tracking-widest">
                        Group Detail
                    </p>
                    <h2 class="text-2xl font-bold text-white">
                        {group?.groupName ?? '—'}
                    </h2>
                </div>
                <Badge
                    class="{statusClass[group?.status ?? ''] ??
                        'bg-stone-100 text-stone-600'} mt-1 px-3 py-1 text-xs font-semibold"
                >
                    {group?.status ?? '—'}
                </Badge>
            </div>

            <!-- Stats row -->
            <div class="mt-4 flex gap-3">
                <div class="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                    <UsersIcon class="h-4 w-4 text-orange-400" />
                    <span class="text-sm text-white/70">Members</span>
                    <span class="text-sm font-bold text-white">{group?.members?.length ?? 0}</span>
                </div>
                {#if group?.topic}
                    <div class="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                        <BookOpenIcon class="h-4 w-4 text-orange-400" />
                        <span class="text-sm text-white/70">Topic</span>
                        <span class="text-sm font-bold text-white">{group.topic.title}</span>
                    </div>
                {/if}
                <div class="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                    <HashIcon class="h-4 w-4 text-orange-400" />
                    <span class="text-sm text-white/70">ID</span>
                    <span class="text-sm font-bold text-white">{group?.groupId}</span>
                </div>
            </div>
        </div>

        <!-- Body -->
        <div class="flex flex-col gap-5 px-6 py-5 bg-white max-h-[60vh] overflow-y-auto">
            <!-- Description -->
            {#if group?.groupDescription}
                <div class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                    <p class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
                        Description
                    </p>
                    <p class="text-sm text-stone-700">{group.groupDescription}</p>
                </div>
            {/if}

            <!-- Members -->
            <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                    Members
                </p>
                <div class="flex flex-col gap-2">
                    {#each sortedMembers as member}
                        <div
                            class="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors
                                {member.isLeader
                                ? 'border-orange-200 bg-orange-50'
                                : 'border-stone-100 bg-white hover:bg-stone-50'}"
                        >
                            <div class="flex items-center gap-3">
                                <!-- Avatar -->
                                <div
                                    class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full
                                        {member.isLeader ? 'bg-orange-400' : 'bg-stone-200'}"
                                >
                                    {#if member.avatarUrl}
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.fullName}
                                            class="h-full w-full object-cover"
                                        />
                                    {:else}
                                        <span
                                            class="text-sm font-bold
                                                {member.isLeader ? 'text-white' : 'text-stone-500'}"
                                        >
                                            {getInitials(member.fullName)}
                                        </span>
                                    {/if}
                                </div>

                                <!-- Info -->
                                <div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-semibold text-stone-900">
                                            {member.fullName}
                                        </span>
                                        {#if member.isLeader}
                                            <span
                                                class="rounded-full bg-orange-400 px-2 py-0.5 text-[11px] font-bold text-white"
                                            >
                                                Leader
                                            </span>
                                        {/if}
                                    </div>
                                    <span class="text-xs text-stone-400">{member.studentCode}</span>
                                </div>
                            </div>

                            <!-- Right badges -->
                            <div class="flex flex-col items-end gap-1">
                                <span
                                    class="rounded-md bg-stone-100 px-3 py-0.5 text-xs font-medium text-stone-700"
                                >
                                    {member.majorCode}
                                </span>
                                {#if member.classCode}
                                    <span class="text-xs text-stone-400">{member.classCode}</span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>
