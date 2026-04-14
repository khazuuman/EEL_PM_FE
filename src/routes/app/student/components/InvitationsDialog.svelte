<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import {
        InboxIcon,
        ClockIcon,
        IdCardIcon,
        UsersIcon,
        MessageSquareIcon,
        ChevronDownIcon,
        ChevronUpIcon,
        CheckIcon,
        XIcon,
        Loader2Icon,
        RefreshCwIcon,
    } from "lucide-svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    let {
        open = $bindable(false),
        invitations = [],
    }: {
        open: boolean;
        invitations: any[];
    } = $props();

    let loadingMap = $state<Record<number, boolean>>({});
    let resolvedExpanded = $state(false);
    let refreshing = $state(false);

    let pendingList = $derived(
        [...invitations]
            .filter((inv) => inv.status === "Pending")
            .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()),
    );

    let resolvedList = $derived(
        [...invitations]
            .filter((inv) => inv.status !== "Pending")
            .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()),
    );

    function getInitials(name: string = "") {
        return name.split(" ").slice(-2).map((n) => n[0]).join("").toUpperCase();
    }

    function formatDate(dateStr: string) {
        if (!dateStr) return "—";
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        }).format(new Date(dateStr));
    }

    async function handleRefresh() {
        refreshing = true;
        await invalidateAll();
        refreshing = false;
    }

    const statusConfig: Record<string, { label: string; class: string }> = {
        Pending:  { label: "Pending",  class: "bg-amber-100 text-amber-700 border-amber-300" },
        Approved: { label: "Accepted", class: "bg-green-100 text-green-700 border-green-300" },
        Rejected: { label: "Declined", class: "bg-red-100 text-red-700 border-red-300" },
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="p-0 gap-0 !max-w-[1100px] w-[90vw] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
                <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <InboxIcon class="h-4 w-4 text-amber-500" />
                    Pending Invitations
                </h2>
                <p class="text-sm text-gray-400 mt-0.5">
                    Review and manage your group project invitations.
                </p>
            </div>
            <div class="flex items-center gap-2">
                {#if pendingList.length > 0}
                    <div class="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-700">
                        <UsersIcon class="h-3.5 w-3.5" />
                        <span class="text-xs font-bold">{pendingList.length} Pending</span>
                    </div>
                {/if}
                <Button
                    variant="outline"
                    onclick={handleRefresh}
                    disabled={refreshing}
                    class="flex items-center gap-2 rounded-lg text-gray-600 cursor-pointer disabled:opacity-60"
                >
                    <RefreshCwIcon class="h-4 w-4 {refreshing ? 'animate-spin' : ''}" />
                    <span class="text-sm font-semibold">{refreshing ? "Refreshing..." : "Refresh"}</span>
                </Button>
            </div>
        </div>

        <!-- Body -->
        <div class="max-h-[500px] overflow-y-auto">
            {#if invitations.length === 0}
                <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <InboxIcon class="h-7 w-7 text-gray-300" />
                    </div>
                    <p class="text-sm font-bold text-gray-700">No pending invitations</p>
                    <p class="text-xs text-gray-400">You're all caught up! Check back later.</p>
                </div>
            {:else}
                <!-- PENDING -->
                {#if pendingList.length > 0}
                    <div class="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_auto] gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                        <span>Invited By</span>
                        <span>Group</span>
                        <span>Message</span>
                        <span>Received</span>
                        <span class="w-44 text-right">Actions</span>
                    </div>

                    {#each pendingList as inv (inv.requestId)}
                        <div class="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_auto] gap-3 items-center border-b border-gray-100 px-5 py-4 last:border-0 hover:bg-amber-50/30 transition-colors">
                            <!-- Invited By -->
                            <div class="flex items-center gap-3 min-w-0">
                                <Avatar.Root class="h-10 w-10 shrink-0 border border-gray-100">
                                    <Avatar.Image src={inv.invitedBy?.avatarUrl ?? ""} alt={inv.invitedBy?.fullName} />
                                    <Avatar.Fallback class="bg-orange-100 text-sm font-bold text-orange-800">
                                        {getInitials(inv.invitedBy?.fullName)}
                                    </Avatar.Fallback>
                                </Avatar.Root>
                                <div class="min-w-0">
                                    <p class="truncate text-sm font-bold text-gray-900">{inv.invitedBy?.fullName ?? "Unknown"}</p>
                                    <p class="flex items-center gap-1 font-mono text-xs text-gray-400 mt-0.5">
                                        <IdCardIcon class="h-3 w-3" />
                                        {inv.invitedBy?.studentCode ?? "—"}
                                    </p>
                                </div>
                            </div>

                            <!-- Group -->
                            <div class="min-w-0 space-y-1">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <p class="truncate text-sm font-semibold text-gray-800">{inv.group?.groupName ?? "—"}</p>
                                    <Badge class="rounded-full bg-gray-100 text-gray-500 border-gray-200 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wide pointer-events-none">
                                        {inv.group?.status ?? "—"}
                                    </Badge>
                                </div>
                                <div class="flex items-center gap-1 text-xs text-gray-400">
                                    <UsersIcon class="h-3 w-3" />
                                    <span>{inv.group?.memberCount} / {inv.group?.maxMembers}</span>
                                    {#if inv.group?.className}
                                        <span class="mx-1 text-gray-300">·</span>
                                        <span class="truncate">{inv.group.className}</span>
                                    {/if}
                                </div>
                            </div>

                            <!-- Message -->
                            <div class="min-w-0">
                                {#if inv.message}
                                    <p class="truncate text-sm italic text-gray-500">"{inv.message}"</p>
                                {:else}
                                    <span class="text-sm italic text-gray-300">No message</span>
                                {/if}
                            </div>

                            <!-- Received At -->
                            <div class="flex items-center gap-1.5 text-sm text-gray-500">
                                <ClockIcon class="h-3.5 w-3.5 shrink-0" />
                                <span>{formatDate(inv.requestedAt)}</span>
                            </div>

                            <!-- Actions -->
                            <div class="w-44 flex items-center justify-end gap-2">
                                <!-- Accept -->
                                <form
                                    method="POST"
                                    action="?/reviewInviteGroupRequest"
                                    use:enhance={() => {
                                        loadingMap[inv.requestId] = true;
                                        return async ({ result }) => {
                                            loadingMap[inv.requestId] = false;
                                            if (result.type === "success") {
                                                toast.success("Invitation accepted!");
                                                await invalidateAll();
                                                open = false;
                                            } else if (result.type === "failure") {
                                                toast.error((result.data as any)?.message ?? "Failed to accept.");
                                            }
                                        };
                                    }}
                                >
                                    <input type="hidden" name="reqId" value={inv.requestId} />
                                    <input type="hidden" name="status" value="Approved" />
                                    <button
                                        type="submit"
                                        disabled={loadingMap[inv.requestId]}
                                        class="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {#if loadingMap[inv.requestId]}
                                            <Loader2Icon class="h-4 w-4 animate-spin" />
                                        {:else}
                                            <CheckIcon class="h-4 w-4" />
                                        {/if}
                                        Accept
                                    </button>
                                </form>

                                <!-- Decline -->
                                <form
                                    method="POST"
                                    action="?/reviewInviteGroupRequest"
                                    use:enhance={() => {
                                        loadingMap[inv.requestId] = true;
                                        return async ({ result }) => {
                                            loadingMap[inv.requestId] = false;
                                            if (result.type === "success") {
                                                toast.success("Invitation declined.");
                                                await invalidateAll();
                                            } else if (result.type === "failure") {
                                                toast.error((result.data as any)?.message ?? "Failed to decline.");
                                            }
                                        };
                                    }}
                                >
                                    <input type="hidden" name="reqId" value={inv.requestId} />
                                    <input type="hidden" name="status" value="Rejected" />
                                    <button
                                        type="submit"
                                        disabled={loadingMap[inv.requestId]}
                                        class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {#if loadingMap[inv.requestId]}
                                            <Loader2Icon class="h-4 w-4 animate-spin" />
                                        {:else}
                                            <XIcon class="h-4 w-4" />
                                        {/if}
                                        Decline
                                    </button>
                                </form>
                            </div>
                        </div>
                    {/each}
                {/if}

                <!-- RESOLVED -->
                {#if resolvedList.length > 0}
                    <div class="border-t border-gray-100">
                        <div class="flex items-center justify-between px-5 py-3 bg-gray-50">
                            <div class="flex items-center gap-3">
                                <span class="text-xs font-bold uppercase tracking-widest text-gray-400">Resolved</span>
                                <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">
                                    {resolvedList.length}
                                </span>
                            </div>
                            <button
                                type="button"
                                onclick={() => (resolvedExpanded = !resolvedExpanded)}
                                class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                {#if resolvedExpanded}
                                    <ChevronUpIcon class="h-4 w-4" /> Collapse
                                {:else}
                                    <ChevronDownIcon class="h-4 w-4" /> Show all
                                {/if}
                            </button>
                        </div>

                        {#if resolvedExpanded}
                            <div class="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr] gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                                <span>Invited By</span>
                                <span>Group</span>
                                <span>Message</span>
                                <span>Received</span>
                                <span>Status</span>
                            </div>
                            {#each resolvedList as inv (inv.requestId)}
                                <div class="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr] gap-3 items-center border-b border-gray-100 px-5 py-4 last:border-0 hover:bg-gray-50/60 transition-colors opacity-75">
                                    <div class="flex items-center gap-3 min-w-0">
                                        <Avatar.Root class="h-9 w-9 shrink-0">
                                            <Avatar.Image src={inv.invitedBy?.avatarUrl ?? ""} alt={inv.invitedBy?.fullName} />
                                            <Avatar.Fallback class="bg-gray-100 text-sm font-bold text-gray-500">
                                                {getInitials(inv.invitedBy?.fullName)}
                                            </Avatar.Fallback>
                                        </Avatar.Root>
                                        <div class="min-w-0">
                                            <p class="truncate text-sm font-semibold text-gray-700">{inv.invitedBy?.fullName ?? "Unknown"}</p>
                                            <p class="flex items-center gap-1 font-mono text-xs text-gray-400 mt-0.5">
                                                <IdCardIcon class="h-3 w-3" />
                                                {inv.invitedBy?.studentCode ?? "—"}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-gray-600">{inv.group?.groupName ?? "—"}</p>
                                        {#if inv.group?.className}
                                            <p class="truncate text-xs text-gray-400">{inv.group.className}</p>
                                        {/if}
                                    </div>
                                    <div class="min-w-0">
                                        {#if inv.message}
                                            <div class="flex items-start gap-1.5">
                                                <MessageSquareIcon class="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400" />
                                                <p class="truncate text-xs italic text-gray-500">"{inv.message}"</p>
                                            </div>
                                        {:else}
                                            <span class="text-xs italic text-gray-300">No message</span>
                                        {/if}
                                    </div>
                                    <div class="flex items-center gap-1.5 text-xs text-gray-400">
                                        <ClockIcon class="h-3.5 w-3.5 shrink-0" />
                                        <span>{formatDate(inv.requestedAt)}</span>
                                    </div>
                                    <div>
                                        <Badge class={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase pointer-events-none ${statusConfig[inv.status]?.class ?? "bg-gray-100 border-gray-300 text-gray-600"}`}>
                                            {statusConfig[inv.status]?.label ?? inv.status}
                                        </Badge>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                {/if}
            {/if}
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p class="text-xs text-gray-400">
                {pendingList.length} pending invitation{pendingList.length !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" onclick={() => (open = false)} class="cursor-pointer">
                Close
            </Button>
        </div>
    </Dialog.Content>
</Dialog.Root>