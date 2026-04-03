<script lang="ts">
    import { fly, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import ChatBox from "$lib/components/chat/ChatBox.svelte";
    import LecturerGroupList from "./LecturerGroupList.svelte";
    import MessageCircle from "@lucide/svelte/icons/message-circle";
    import X from "@lucide/svelte/icons/x";
    import ArrowLeft from "@lucide/svelte/icons/arrow-left";

    let {
        groups,
        token,
        userId,
        user,
    }: {
        groups: {
            id: number;
            name: string;
            memberCount: number;
            leaderName: string;
            status: string;
        }[];
        token: string;
        userId: string;
        user: any;
    } = $props();

    let isOpen = $state(false);
    // null = showing group list; string = chatting in that groupId
    let activeGroupId = $state<string | null>(null);

    // Track unread per groupId: { "12": 3, "15": 1, ... }
    let unreadByGroup = $state<Record<string, number>>({});

    const totalUnread = $derived(
        Object.values(unreadByGroup).reduce((sum, n) => sum + n, 0)
    );

    function toggle() {
        isOpen = !isOpen;
        if (!isOpen) {
            activeGroupId = null;
        }
    }

    function selectGroup(groupId: string) {
        activeGroupId = groupId;
        // Reset unread của group này khi mở
        unreadByGroup = { ...unreadByGroup, [groupId]: 0 };
    }

    function backToList() {
        activeGroupId = null;
    }

    function getUnread(groupId: string) {
        return unreadByGroup[groupId] ?? 0;
    }

    function setUnread(groupId: string, val: number) {
        // Chỉ tăng unread khi widget đóng hoặc đang xem group khác
        if (!isOpen || activeGroupId !== groupId) {
            unreadByGroup = { ...unreadByGroup, [groupId]: val };
        }
    }

    const activeGroupName = $derived(
        activeGroupId
            ? (groups.find((g) => String(g.id) === activeGroupId)?.name ?? "")
            : ""
    );
</script>

<div class="chat-widget">
    {#if isOpen}
        <div
            class="chat-box-wrapper"
            role="dialog"
            aria-label="Lecturer group chat"
            transition:fly={{ y: 16, duration: 220, easing: cubicOut }}
        >
            {#if activeGroupId}
                <!-- ChatBox của group được chọn -->
                <div class="flex h-full flex-col overflow-hidden">
                    <!-- Back header -->
                    <div
                        class="flex shrink-0 items-center gap-2 border-b bg-background px-3 py-2"
                    >
                        <button
                            class="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            onclick={backToList}
                            aria-label="Back to group list"
                        >
                            <ArrowLeft size={15} />
                        </button>
                        <span class="truncate text-sm font-semibold text-foreground">
                            {activeGroupName}
                        </span>
                    </div>

                    <!-- key block đảm bảo ChatBox re-mount hoàn toàn khi đổi group -->
                    <div class="min-h-0 flex-1 overflow-hidden">
                        {#key activeGroupId}
                            <ChatBox
                                groupId={activeGroupId}
                                {token}
                                {userId}
                                {user}
                                bind:unreadCount={unreadByGroup[activeGroupId]}
                            />
                        {/key}
                    </div>
                </div>
            {:else}
                <!-- Group list panel -->
                <LecturerGroupList {groups} {unreadByGroup} onSelect={selectGroup} />
            {/if}
        </div>
    {/if}

    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                onclick={toggle}
                size="icon"
                class="chat-toggle-btn relative h-13 w-13 rounded-full shadow-lg"
                aria-label={isOpen ? "Đóng chat" : "Mở chat"}
            >
                {#if isOpen}
                    <div transition:scale={{ duration: 150 }}>
                        <X size={20} />
                    </div>
                {:else}
                    <div transition:scale={{ duration: 150 }}>
                        <MessageCircle size={22} />
                    </div>
                {/if}

                {#if totalUnread > 0 && !isOpen}
                    <Badge
                        variant="destructive"
                        class="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]"
                    >
                        {totalUnread > 99 ? "99+" : totalUnread}
                    </Badge>
                {/if}
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="left">
            <p>{isOpen ? "Đóng chat" : "Chat với các nhóm"}</p>
        </Tooltip.Content>
    </Tooltip.Root>
</div>

<style>
    .chat-widget {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.75rem;
    }

    .chat-box-wrapper {
        width: 380px;
        height: 560px;
        border-radius: 16px;
        overflow: hidden;
        border: 0.5px solid var(--color-border-tertiary);
        box-shadow:
            0 4px 6px -1px rgb(0 0 0 / 0.1),
            0 20px 40px -8px rgb(0 0 0 / 0.2);
        background: var(--color-background-primary);
    }

    :global(.chat-toggle-btn) {
        width: 52px !important;
        height: 52px !important;
        border-radius: 9999px !important;
        transition:
            transform 150ms ease,
            box-shadow 150ms ease !important;
    }

    :global(.chat-toggle-btn:hover) {
        transform: scale(1.08) !important;
    }

    :global(.chat-toggle-btn:active) {
        transform: scale(0.95) !important;
    }

    @media (max-width: 480px) {
        .chat-box-wrapper {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
        }
    }
</style>