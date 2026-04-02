<script lang="ts">
    import type { Message } from "$lib/chat/chatStore.svelte";
    import { chatState } from "$lib/chat/chatStore.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import Paperclip from "@lucide/svelte/icons/paperclip";
    import FileText from "@lucide/svelte/icons/file-text";
    import Image from "@lucide/svelte/icons/image";

    let { msg }: { msg: Message } = $props();

    const isMine = $derived(msg.senderId === chatState.currentUserId);
    const hasText = $derived(!!msg.messageContent?.trim());
    const hasFiles = $derived((msg.attachment?.length ?? 0) > 0);

    function formatSize(bytes: number) {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }

    function getFileIcon(fileType: string) {
        if (fileType.startsWith("image/")) return "image";
        return "file";
    }

    function formatTime(sendAt: Date | string) {
        const d =
            typeof sendAt === "string" && !sendAt.endsWith("Z")
                ? new Date(sendAt + "Z")
                : new Date(sendAt);
        return d.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Ho_Chi_Minh",
        });
    }

    const time = formatTime(msg.sendAt);
</script>

<div class="flex items-end gap-2" class:flex-row-reverse={isMine}>
    {#if !isMine}
        <Avatar.Root class="h-7 w-7 shrink-0">
            <Avatar.Image src={msg.senderAvatar} alt={msg.senderName} />
            <Avatar.Fallback class="text-xs">
                {msg.senderName?.charAt(0) ?? "?"}
            </Avatar.Fallback>
        </Avatar.Root>
    {/if}

    <div
        class="flex max-w-[75%] flex-col gap-0.5"
        class:items-end={isMine}
        class:items-start={!isMine}
    >
        {#if !isMine}
            <span class="px-1 text-[11px] font-semibold text-muted-foreground">
                {msg.senderName}
            </span>
        {/if}

        <!-- Bubble -->
        <div
            class="flex flex-col gap-1.5 rounded-2xl px-3 py-2 text-sm"
            class:rounded-br-sm={isMine}
            class:rounded-bl-sm={!isMine}
            class:bg-primary={isMine}
            class:text-primary-foreground={isMine}
            class:bg-muted={!isMine}
        >
            <!-- Text content -->
            {#if hasText}
                <p class="m-0 break-words leading-relaxed">
                    {msg.messageContent}
                </p>
            {/if}

            <!-- Attachments -->
            {#if hasFiles}
                <div class="flex flex-col gap-1">
                    {#each msg.attachment ?? [] as att}
                        {#if att.fileType?.startsWith("image/")}
                            <!-- Preview ảnh -->
                            <a
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={att.fileUrl}
                                    alt={att.fileName}
                                    class="max-w-[180px] rounded-lg object-cover"
                                    loading="lazy"
                                />
                            </a>
                        {:else}
                            <!-- File thông thường -->
                            <a
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
                                class:bg-primary-foreground={isMine}
                                class:text-primary={isMine}
                                class:bg-background={!isMine}
                                class:text-foreground={!isMine}
                            >
                                <FileText size={14} class="shrink-0" />
                                <div class="flex flex-col min-w-0">
                                    <span
                                        class="truncate text-xs font-medium max-w-[140px]"
                                    >
                                        {att.fileName}
                                    </span>
                                    <span class="text-[10px] opacity-60">
                                        {formatSize(att.fileSize)}
                                    </span>
                                </div>
                            </a>
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>

        <span class="px-1 text-[10px] text-muted-foreground">{time}</span>
    </div>
</div>
