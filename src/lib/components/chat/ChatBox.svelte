<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { ScrollArea } from "../ui/scroll-area";
    import * as Avatar from "$lib/components/ui/avatar";
    import * as Separator from "$lib/components/ui/separator";
    import ChatMessage from "./ChatMessage.svelte";
    import {
        chatState,
        joinGroup,
        leaveGroup,
        sendMessage,
        uploadFile,
        loadHistory,
        setOnNewMessage,
        setCurrentUser,
        type Attachment,
    } from "$lib/chat/chatStore.svelte";
    import Paperclip from "@lucide/svelte/icons/paperclip";
    import Send from "@lucide/svelte/icons/send";
    import Users from "@lucide/svelte/icons/users";
    import Loader2 from "@lucide/svelte/icons/loader-2";
    import ChevronUp from "@lucide/svelte/icons/chevron-up";

    let {
        groupId,
        token,
        unreadCount = $bindable(0),
        userId,
        user,
    }: {
        groupId: string;
        token: string;
        unreadCount: number;
        userId: string;
        user: any;
    } = $props();

    let inputText = $state("");
    let fileInput: HTMLInputElement;
    let isUploading = $state(false);
    let showMembers = $state(false);

    onMount(async () => {
        // ✅ Đăng ký callback trước khi join
        // Chỉ chạy khi có tin nhắn MỚI đến (ReceiveMessage), không chạy khi load history
        setCurrentUser(
            userId,
            user.fullName ?? user.userName ?? "Bạn",
            user.avatarUrl ?? "",
        );
        setOnNewMessage(() => {
            scrollToBottom();
            unreadCount++;
        });

        await joinGroup(groupId, token);
        scrollToBottom(); // scroll sau khi load history xong
    });

    onDestroy(() => {
        setOnNewMessage(null); // ✅ cleanup callback
        leaveGroup(groupId);
    });

    // ❌ Bỏ $effect cũ gây vòng lặp vô hạn

    function scrollToBottom() {
        setTimeout(() => {
            const viewport = document.querySelector(
                '[data-slot="scroll-area-viewport"]',
            );
            if (viewport) viewport.scrollTop = viewport.scrollHeight;
        }, 50);
    }

    async function handleSend() {
        const text = inputText.trim();
        const hasFile = pendingAttachments.length > 0;

        // ✅ Cho phép gửi khi có text, có file, hoặc cả hai
        if ((!text && !hasFile) || !chatState.isConnected) return;

        inputText = "";
        const attachmentsToSend = [...pendingAttachments];
        pendingAttachments = []; // clear trước khi await

        await sendMessage(groupId, text, attachmentsToSend);
        scrollToBottom();
    }

    function removePendingAttachment(index: number) {
        pendingAttachments = pendingAttachments.filter((_, i) => i !== index);
    }

    // Cho phép đính kèm file + nhập text cùng lúc
    let pendingAttachments = $state<Attachment[]>([]);

    async function handleFile(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        isUploading = true;
        try {
            const attachment = await uploadFile(groupId, file);
            pendingAttachments = [...pendingAttachments, attachment];
        } catch (err) {
            console.error("❌ Upload lỗi:", err);
        } finally {
            isUploading = false;
            // Reset input để có thể chọn lại cùng file
            if (fileInput) fileInput.value = "";
        }
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    async function handleLoadMore() {
        const oldest = chatState.messages[0];
        if (!oldest) return;
        // ✅ Truyền đúng tham số: before = thời gian tin cũ nhất
        await loadHistory(groupId, oldest.sendAt?.toString() ?? "", 20);
    }
</script>

<div class="flex h-full flex-col overflow-hidden">
    <Card.Root
        class="flex h-full flex-col overflow-hidden rounded-none border-0 shadow-none"
    >
        <!-- Header -->
        <Card.Header class="shrink-0 border-b px-4 py-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <!-- Status dot -->
                    <span
                        class="h-2 w-2 rounded-full transition-colors duration-300"
                        class:bg-green-500={chatState.isConnected}
                        class:bg-muted-foreground={!chatState.isConnected}
                    ></span>
                    <Card.Title class="text-sm font-semibold"
                        >Group Chat</Card.Title
                    >
                </div>

                <!-- Members toggle -->
                <Button
                    variant="ghost"
                    size="sm"
                    class="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                    onclick={() => (showMembers = !showMembers)}
                >
                    <Users size={13} />
                    {chatState.members.length}
                </Button>
            </div>

            <!-- Members list (collapsible) -->
            {#if showMembers && chatState.members.length > 0}
                <div class="mt-2 flex flex-wrap gap-1.5">
                    {#each chatState.members as member}
                        <div
                            class="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                        >
                            <Avatar.Root class="h-4 w-4">
                                <Avatar.Image
                                    src={member.avatarUrl}
                                    alt={member.fullName}
                                />
                                <Avatar.Fallback class="text-[8px]">
                                    {member.fullName?.charAt(0) ?? "?"}
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <span>{member.fullName}</span>
                        </div>
                    {/each}
                </div>
            {/if}
        </Card.Header>

        <!-- Messages -->
        <ScrollArea class="min-h-0 flex-1 px-3">
            <div class="flex flex-col gap-2 py-3">
                {#if chatState.isLoadingHistory}
                    <div
                        class="flex items-center justify-center py-2 text-xs text-muted-foreground"
                    >
                        <Loader2 size={12} class="mr-1 animate-spin" /> Đang tải...
                    </div>
                {:else}
                    <Button
                        variant="ghost"
                        size="sm"
                        class="mx-auto h-6 gap-1 text-xs text-muted-foreground"
                        onclick={handleLoadMore}
                    >
                        <ChevronUp size={12} /> Tải thêm lịch sử
                    </Button>
                {/if}

                {#each chatState.messages as msg (msg.messageId)}
                    <ChatMessage {msg} />
                {/each}
            </div>
        </ScrollArea>

        <!-- <Separator.Root class="shrink-0" /> -->

        {#if pendingAttachments.length > 0}
            <div
                class="shrink-0 flex flex-wrap gap-1.5 border-t px-3 pt-2 pb-1"
            >
                {#each pendingAttachments as att, i}
                    <div
                        class="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs"
                    >
                        <Paperclip size={11} class="text-muted-foreground" />
                        <span class="max-w-[120px] truncate"
                            >{att.fileName}</span
                        >
                        <span class="text-muted-foreground">
                            ({(att.fileSize / 1024).toFixed(0)}KB)
                        </span>
                        <button
                            class="ml-0.5 text-muted-foreground hover:text-destructive"
                            onclick={() => removePendingAttachment(i)}
                            aria-label="Xóa file">✕</button
                        >
                    </div>
                {/each}
            </div>
        {/if}

        <!-- Input area -->
        <Card.Footer class="shrink-0 gap-2 px-3 py-2.5">
            <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                onclick={() => fileInput.click()}
                disabled={isUploading}
                aria-label="Đính kèm file"
            >
                {#if isUploading}
                    <Loader2 size={16} class="animate-spin" />
                {:else}
                    <Paperclip size={16} />
                {/if}
            </Button>

            <input
                type="file"
                bind:this={fileInput}
                onchange={handleFile}
                class="sr-only"
            />

            <textarea
                bind:value={inputText}
                onkeydown={onKeydown}
                placeholder={chatState.isConnected
                    ? "Nhập tin nhắn..."
                    : "Đang kết nối..."}
                rows={1}
                disabled={!chatState.isConnected}
                class="flex-1 resize-none rounded-md border border-input bg-background px-3 py-1.5
             text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1
             focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50
             max-h-24 leading-relaxed"
            ></textarea>

            <Button
                size="icon"
                class="h-8 w-8 shrink-0"
                onclick={handleSend}
                disabled={(!inputText.trim() &&
                    pendingAttachments.length === 0) ||
                    !chatState.isConnected}
                aria-label="Gửi"
            >
                <Send size={15} />
            </Button>
        </Card.Footer>
    </Card.Root>
</div>

<style>
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
    }
</style>
