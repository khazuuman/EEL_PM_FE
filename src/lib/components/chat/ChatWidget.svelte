<script lang="ts">
    import { fly, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import ChatBox from "./ChatBox.svelte";
    import MessageCircle from "@lucide/svelte/icons/message-circle";
    import X from "@lucide/svelte/icons/x";

    let {
        groupId,
        token,
        userId,
        user
    }: { groupId: string; token: string; userId: string; user: any } = $props();

    let isOpen = $state(false);
    let unreadCount = $state(0);

    function toggle() {
        isOpen = !isOpen;
        if (isOpen) unreadCount = 0;
    }
</script>

<div class="chat-widget">
    {#if isOpen}
        <div
            class="chat-box-wrapper"
            role="dialog"
            aria-label="Chat"
            transition:fly={{ y: 16, duration: 220, easing: cubicOut }}
        >
            <ChatBox {groupId} {token} bind:unreadCount {userId} user={user} />
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

                {#if unreadCount > 0 && !isOpen}
                    <Badge
                        variant="destructive"
                        class="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]"
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                {/if}
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="left">
            <p>{isOpen ? "Đóng chat" : "Mở chat"}</p>
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
        box-shadow:
            0 4px 6px -1px rgb(0 0 0 / 0.1),
            0 20px 40px -8px rgb(0 0 0 / 0.2);
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
