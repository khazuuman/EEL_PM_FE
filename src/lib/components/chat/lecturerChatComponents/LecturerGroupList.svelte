<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import Users from "@lucide/svelte/icons/users";
    import MessageCircle from "@lucide/svelte/icons/message-circle";

    let {
        groups,
        unreadByGroup = $bindable({}),
        onSelect,
    }: {
        groups: {
            id: number;
            name: string;
            memberCount: number;
            leaderName: string;
            status: string;
        }[];
        unreadByGroup?: Record<string, number>;
        onSelect: (groupId: string) => void;
    } = $props();
</script>

<div class="flex h-full flex-col overflow-hidden bg-background">
    <!-- Header -->
    <div class="shrink-0 border-b px-4 py-3">
        <div class="flex items-center gap-2">
            <MessageCircle size={16} class="text-amber-500" />
            <span class="text-sm font-semibold text-foreground"
                >Group Chats</span
            >
            <span
                class="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
            >
                {groups.length}
            </span>
        </div>
    </div>

    <!-- Group list -->
    <div class="flex-1 overflow-y-auto">
        {#if groups.length === 0}
            <div
                class="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
            >
                <Users size={28} class="opacity-30" />
                <span>No groups found</span>
            </div>
        {:else}
            {#each groups as group}
                <button
                    class="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    onclick={() => onSelect(String(group.id))}
                >
                    <!-- Avatar circle with initials -->
                    <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700"
                    >
                        {group.name.charAt(0)}
                    </div>

                    <div class="min-w-0 flex-1">
                        <p
                            class="truncate text-sm text-foreground"
                            class:font-semibold={(unreadByGroup[
                                String(group.id)
                            ] ?? 0) > 0}
                            class:font-medium={(unreadByGroup[
                                String(group.id)
                            ] ?? 0) === 0}
                        >
                            {group.name}
                        </p>
                        <p class="truncate text-[11px] text-muted-foreground">
                            Leader: {group.leaderName} &middot; {group.memberCount}
                            members
                        </p>
                    </div>

                    <div class="flex shrink-0 flex-col items-end gap-1">
                        <!-- Unread badge -->
                        {#if (unreadByGroup[String(group.id)] ?? 0) > 0}
                            <span
                                class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
                            >
                                {(unreadByGroup[String(group.id)] ?? 0) > 99
                                    ? "99+"
                                    : unreadByGroup[String(group.id)]}
                            </span>
                        {:else}
                            <!-- Status badge -->
                            <span
                                class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                class:bg-green-100={group.status === "Approved"}
                                class:text-green-700={group.status ===
                                    "Approved"}
                                class:bg-amber-100={group.status !== "Approved"}
                                class:text-amber-700={group.status !==
                                    "Approved"}
                            >
                                {group.status}
                            </span>
                        {/if}
                    </div>
                </button>
            {/each}
        {/if}
    </div>
</div>
