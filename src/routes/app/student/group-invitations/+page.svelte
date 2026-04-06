<script lang="ts">
    import type { PageData } from "./$types";
    import { toast } from "svelte-sonner";
    import * as Avatar from "$lib/components/ui/avatar/index";
    import Button from "$lib/components/ui/button/button.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import {
        ArrowLeftIcon,
        UsersIcon,
        RefreshCwIcon,
        ClockIcon,
        InboxIcon,
        IdCardIcon,
        MessageSquareIcon,
        ChevronDownIcon,
        ChevronUpIcon,
    } from "lucide-svelte";
    import { setActions } from "$lib/stores/actions";
    import { invalidateAll, goto } from "$app/navigation";

    let { data }: { data: PageData } = $props();
    let invitations = $derived(data?.invitations ?? []);

    let pendingList = $derived(
        [...invitations]
            .filter((inv) => inv.status === "Pending")
            .sort(
                (a, b) =>
                    new Date(b.requestedAt).getTime() -
                    new Date(a.requestedAt).getTime(),
            ),
    );

    let resolvedList = $derived(
        [...invitations]
            .filter((inv) => inv.status !== "Pending")
            .sort(
                (a, b) =>
                    new Date(b.requestedAt).getTime() -
                    new Date(a.requestedAt).getTime(),
            ),
    );

    let refreshing = $state(false);
    let resolvedExpanded = $state(false);
    let submittingId = $state<number | null>(null);

    async function handleRefresh() {
        refreshing = true;
        await invalidateAll();
        refreshing = false;
    }

    function formatDate(dateStr: string) {
        if (!dateStr) return "—";
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateStr));
    }

    function getInitials(name: string): string {
        return (name ?? "?")
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    }

    const statusConfig: Record<string, { label: string; class: string }> = {
        Pending: {
            label: "Pending",
            class: "bg-amber-100 text-amber-700 border-amber-300",
        },
        Approved: {
            label: "Accepted",
            class: "bg-green-100 text-green-700 border-green-300",
        },
        Rejected: {
            label: "Declined",
            class: "bg-red-100 text-red-700 border-red-300",
        },
    };

    async function submitAction(requestId: number, status: "Approved" | "Rejected") {
        submittingId = requestId;
        const formData = new FormData();
        formData.set("reqId", String(requestId));
        formData.set("status", status);

        const response = await fetch("?/reviewInviteGroupRequest", {
            method: "POST",
            body: formData,
            headers: { "x-sveltekit-action": "true" },
        });

        submittingId = null;
        const json = await response.json().catch(() => ({}));

        if (json.type === "success") {
            toast.success(status === "Approved" ? "Invitation accepted!" : "Invitation declined.");
            await invalidateAll();
        } else if (json.type === "failure") {
            toast.error(json.data?.message ?? "Action failed.");
        } else {
            if (response.ok) {
                toast.success(status === "Approved" ? "Invitation accepted!" : "Invitation declined.");
                await invalidateAll();
            } else {
                toast.error("Action failed.");
            }
        }
    }

    function confirmAction(requestId: number, status: "Approved" | "Rejected", groupName: string) {
        setActions({
            active: true,
            description:
                status === "Approved"
                    ? `You are about to join group "${groupName}". This action cannot be undone.`
                    : `You are about to decline the invitation to "${groupName}". Are you sure?`,
            cb: () => submitAction(requestId, status),
        });
    }
</script>

<div class="min-h-screen bg-white pt-5 font-sans">
    <!-- ── Sticky Top Bar ─────────────────────────────────────── -->
    <div class="sticky top-0 z-10 flex items-center gap-3 px-6 py-3">
        <Button
            variant="ghost"
            onclick={() => goto("/app")}
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Home</span>
        </Button>
    </div>

    <!-- ── Main Content ───────────────────────────────────────── -->
    <div class="px-6 py-5 space-y-8 max-w-[1600px] mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">
                    Pending Invitations
                </h1>
                <p class="mt-1 text-base text-gray-500">
                    Review and manage your group project invitations.
                </p>
            </div>
            <div class="flex items-center gap-3">
                {#if pendingList.length > 0}
                    <div class="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                        <UsersIcon class="h-4 w-4" />
                        <span class="text-sm font-bold">{pendingList.length} Pending</span>
                    </div>
                {/if}
                <Button
                    variant="outline"
                    onclick={handleRefresh}
                    disabled={refreshing}
                    class="flex items-center gap-2 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-60"
                >
                    <RefreshCwIcon class="h-4 w-4 {refreshing ? 'animate-spin' : ''}" />
                    <span class="text-sm font-semibold">
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </span>
                </Button>
            </div>
        </div>

        <!-- Empty State -->
        {#if invitations.length === 0}
            <div class="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <InboxIcon class="h-8 w-8 text-gray-400" />
                </div>
                <p class="text-lg font-bold text-gray-900">No pending invitations</p>
                <p class="mt-1 text-base text-gray-500">You're all caught up! Check back later.</p>
            </div>
        {:else}
            <!-- ── PENDING SECTION ──────────────────────────────── -->
            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400">
                        Awaiting Response
                    </h2>
                    <span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                        {pendingList.length}
                    </span>
                </div>

                {#if pendingList.length === 0}
                    <div class="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-4 text-sm text-gray-400">
                        <InboxIcon class="h-4 w-4 shrink-0" />
                        No pending invitations
                    </div>
                {:else}
                    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <!-- Table Header -->
                        <div class="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_auto] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <span>Invited By</span>
                            <span>Group</span>
                            <span>Message</span>
                            <span>Received</span>
                            <span class="w-48 text-right">Actions</span>
                        </div>

                        {#each pendingList as inv (inv.requestId)}
                            <div class="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_auto] gap-4 items-center border-b border-gray-50 px-5 py-4 last:border-0 hover:bg-amber-50/30 transition-colors">
                                <!-- Invited By -->
                                <div class="flex items-center gap-3 min-w-0">
                                    <Avatar.Root class="h-9 w-9 shrink-0">
                                        <Avatar.Image src={inv.invitedBy?.avatarUrl ?? ""} alt={inv.invitedBy?.fullName} />
                                        <Avatar.Fallback class="bg-orange-100 text-sm font-bold text-orange-800">
                                            {getInitials(inv.invitedBy?.fullName ?? "?")}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-gray-900">
                                            {inv.invitedBy?.fullName ?? "Unknown"}
                                        </p>
                                        <p class="flex items-center gap-1 font-mono text-xs text-gray-400 mt-0.5">
                                            <IdCardIcon class="h-3 w-3" />
                                            {inv.invitedBy?.studentCode ?? "—"}
                                        </p>
                                    </div>
                                </div>

                                <!-- Group -->
                                <div class="min-w-0 space-y-1">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <p class="truncate text-sm font-semibold text-gray-800">
                                            {inv.group?.groupName ?? "—"}
                                        </p>
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
                                        <span class="text-xs italic text-gray-300">No message</span>
                                    {/if}
                                </div>

                                <!-- Received At -->
                                <div class="flex items-center gap-1.5 text-xs text-gray-400">
                                    <ClockIcon class="h-3.5 w-3.5 shrink-0" />
                                    <span>{formatDate(inv.requestedAt)}</span>
                                </div>

                                <!-- Actions -->
                                <div class="w-48 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={submittingId === inv.requestId}
                                        onclick={() => confirmAction(inv.requestId, "Rejected", inv.group?.groupName)}
                                        class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        type="button"
                                        disabled={submittingId === inv.requestId}
                                        onclick={() => confirmAction(inv.requestId, "Approved", inv.group?.groupName)}
                                        class="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {#if submittingId === inv.requestId}
                                            <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                        {/if}
                                        Accept
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- ── RESOLVED SECTION ────────────────────────────── -->
            {#if resolvedList.length > 0}
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400">
                                Resolved
                            </h2>
                            <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">
                                {resolvedList.length}
                            </span>
                        </div>
                        <button
                            type="button"
                            onclick={() => (resolvedExpanded = !resolvedExpanded)}
                            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            {#if resolvedExpanded}
                                <ChevronUpIcon class="h-4 w-4" />
                                Collapse
                            {:else}
                                <ChevronDownIcon class="h-4 w-4" />
                                Show all
                            {/if}
                        </button>
                    </div>

                    {#if resolvedExpanded}
                        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <!-- Table Header -->
                            <div class="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span>Invited By</span>
                                <span>Group</span>
                                <span>Message</span>
                                <span>Received</span>
                                <span>Status</span>
                            </div>

                            {#each resolvedList as inv (inv.requestId)}
                                <div class="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr] gap-4 items-center border-b border-gray-50 px-5 py-4 last:border-0 hover:bg-gray-50/60 transition-colors opacity-75">
                                    <!-- Invited By -->
                                    <div class="flex items-center gap-3 min-w-0">
                                        <Avatar.Root class="h-9 w-9 shrink-0">
                                            <Avatar.Image src={inv.invitedBy?.avatarUrl ?? ""} alt={inv.invitedBy?.fullName} />
                                            <Avatar.Fallback class="bg-gray-100 text-sm font-bold text-gray-500">
                                                {getInitials(inv.invitedBy?.fullName ?? "?")}
                                            </Avatar.Fallback>
                                        </Avatar.Root>
                                        <div class="min-w-0">
                                            <p class="truncate text-sm font-semibold text-gray-700">
                                                {inv.invitedBy?.fullName ?? "Unknown"}
                                            </p>
                                            <p class="flex items-center gap-1 font-mono text-xs text-gray-400 mt-0.5">
                                                <IdCardIcon class="h-3 w-3" />
                                                {inv.invitedBy?.studentCode ?? "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Group -->
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-gray-600">
                                            {inv.group?.groupName ?? "—"}
                                        </p>
                                        {#if inv.group?.className}
                                            <p class="truncate text-xs text-gray-400">{inv.group.className}</p>
                                        {/if}
                                    </div>

                                    <!-- Message -->
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

                                    <!-- Received At -->
                                    <div class="flex items-center gap-1.5 text-xs text-gray-400">
                                        <ClockIcon class="h-3.5 w-3.5 shrink-0" />
                                        <span>{formatDate(inv.requestedAt)}</span>
                                    </div>

                                    <!-- Status -->
                                    <div>
                                        <Badge
                                            class={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase pointer-events-none ${statusConfig[inv.status]?.class ?? "bg-gray-100 border-gray-300 text-gray-600"}`}
                                        >
                                            {statusConfig[inv.status]?.label ?? inv.status}
                                        </Badge>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <!-- Collapsed preview -->
                        <div class="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            {#each resolvedList.slice(0, 2) as inv (inv.requestId)}
                                <div class="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-4 items-center border-b border-gray-50 px-5 py-3.5 last:border-0 opacity-50">
                                    <div class="flex items-center gap-3 min-w-0">
                                        <Avatar.Root class="h-8 w-8 shrink-0">
                                            <Avatar.Image src={inv.invitedBy?.avatarUrl ?? ""} />
                                            <Avatar.Fallback class="bg-gray-100 text-xs font-bold text-gray-500">
                                                {getInitials(inv.invitedBy?.fullName ?? "?")}
                                            </Avatar.Fallback>
                                        </Avatar.Root>
                                        <p class="truncate text-sm font-semibold text-gray-600">
                                            {inv.invitedBy?.fullName ?? "Unknown"}
                                        </p>
                                    </div>
                                    <p class="truncate text-sm text-gray-500">{inv.group?.groupName ?? "—"}</p>
                                    <div class="text-xs text-gray-400">{formatDate(inv.requestedAt)}</div>
                                    <Badge
                                        class={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase pointer-events-none ${statusConfig[inv.status]?.class ?? "bg-gray-100 border-gray-300 text-gray-600"}`}
                                    >
                                        {statusConfig[inv.status]?.label ?? inv.status}
                                    </Badge>
                                </div>
                            {/each}
                            <div class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        </div>
                    {/if}
                </div>
            {/if}
        {/if}
    </div>
</div>