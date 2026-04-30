<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import {
        Avatar,
        AvatarFallback,
        AvatarImage,
    } from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";
    import {
        ClockIcon,
        InboxIcon,
        ArrowLeftIcon,
        IdCardIcon,
        SendIcon,
        RefreshCwIcon,
        ChevronDownIcon,
        ChevronUpIcon,
        MessageSquareIcon,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";
    import { setActions } from "$lib/stores/actions";

    const { data } = $props();
    let invitations = $derived(data?.invitations ?? []);
    let refreshing = $state(false);
    let resolvedExpanded = $state(false);

    // Phân nhóm + sort theo thời gian mới nhất
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

    async function handleRefresh() {
        refreshing = true;
        await invalidateAll();
        refreshing = false;
    }

    function formatDate(dateStr: string) {
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateStr));
    }

    function getInitials(name: string) {
        return name
            .split(" ")
            .slice(-2)
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    }

    const statusConfig: Record<string, { label: string; class: string }> = {
        Pending: {
            label: "Pending",
            class: "bg-amber-100 text-amber-700 border-amber-300",
        },
        Approved: {
            label: "Approved",
            class: "bg-green-100 text-green-700 border-green-300",
        },
        Rejected: {
            label: "Rejected",
            class: "bg-red-100 text-red-700 border-red-300",
        },
        Cancelled: {
            label: "Cancelled",
            class: "bg-gray-100 text-gray-500 border-gray-300",
        },
    };

    async function handleCancelRequest(requestId: string) {
        setActions({
            active: true,
            description:
                "Are you sure you want to cancel this invitation? This action cannot be undone.",
            cb: async () => {
                const formData = new FormData();
                formData.set("reqId", requestId);
                formData.set("status", "Cancelled");

                const res = await fetch("?/ReviewJoinRequest", {
                    method: "POST",
                    body: formData,
                });

                const result = await res.json();

                if (!res.ok || result?.type === "failure") {
                    toast.error(
                        result?.data?.message ?? "Failed to cancel invitation.",
                    );
                    return;
                }

                toast.success("Invitation cancelled successfully.");
                await invalidateAll();
            },
        });
    }
</script>

<div class="min-h-screen bg-white pt-5 font-sans">
    <!-- ── Sticky Top Bar ───────────────────────────────────────── -->
    <div class="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-3">
        <Button
            variant="ghost"
            href="/app/student"
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Back</span>
        </Button>
    </div>

    <!-- ── Main Content ─────────────────────────────────────────── -->
    <div class="px-6 py-5 space-y-8 max-w-400 mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">
                    My Sent Invitations
                </h1>
                <p class="mt-1 text-base text-gray-500">
                    Track the status of invitations you have sent to other students.
                </p>
            </div>
            <div class="flex items-center gap-3">
                {#if invitations.length > 0}
                    <div class="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                        <SendIcon class="h-4 w-4" />
                        <span class="text-sm font-bold">{invitations.length} Sent</span>
                    </div>
                {/if}
                <Button
                    variant="outline"
                    onclick={handleRefresh}
                    disabled={refreshing}
                    class="flex items-center gap-2 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-60"
                >
                    <RefreshCwIcon class="h-4 w-4 {refreshing ? 'animate-spin' : ''}" />
                    <span class="text-sm font-semibold">{refreshing ? "Refreshing..." : "Refresh"}</span>
                </Button>
            </div>
        </div>

        <!-- Empty State -->
        {#if invitations.length === 0}
            <div class="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <InboxIcon class="h-8 w-8 text-gray-400" />
                </div>
                <p class="text-lg font-bold text-gray-900">No invitations sent yet</p>
                <p class="mt-1 text-base text-gray-500">Invite students to join your group.</p>
            </div>
        {:else}
            <!-- ── PENDING SECTION ──────────────────────────────── -->
            <div class="space-y-3">
                <!-- Section Label -->
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
                    <!-- Table -->
                    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <!-- Table Header -->
                        <div class="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <span>Student</span>
                            <span>Sent At</span>
                            <span>Status</span>
                            <span class="w-32 text-right">Action</span>
                        </div>

                        <!-- Rows -->
                        {#each pendingList as inv (inv.requestId)}
                            <div class="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 items-center border-b border-gray-50 px-5 py-4 last:border-0 hover:bg-amber-50/30 transition-colors">
                                <!-- Student -->
                                <div class="flex items-center gap-3 min-w-0">
                                    <Avatar class="h-9 w-9 shrink-0 border border-gray-100">
                                        <AvatarImage src={inv.student.avatarUrl ?? ""} />
                                        <AvatarFallback class="bg-orange-100 text-sm font-bold text-orange-800">
                                            {getInitials(inv.student.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-gray-900">
                                            {inv.student.fullName}
                                        </p>
                                        <p class="flex items-center gap-1 font-mono text-xs text-gray-400 mt-0.5">
                                            <IdCardIcon class="h-3 w-3" />
                                            {inv.student.studentCode}
                                        </p>
                                    </div>
                                </div>

                                <!-- Sent At -->
                                <div class="flex items-center gap-1.5 text-xs text-gray-400">
                                    <ClockIcon class="h-3.5 w-3.5 shrink-0" />
                                    <span>{formatDate(inv.requestedAt)}</span>
                                </div>

                                <!-- Status -->
                                <div>
                                    <Badge
                                        class={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase ${statusConfig[inv.status]?.class ?? "bg-gray-100 border-gray-300 text-gray-600"}`}
                                    >
                                        {statusConfig[inv.status]?.label ?? inv.status}
                                    </Badge>
                                </div>

                                <!-- Action -->
                                <div class="w-32 flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        class="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 text-xs cursor-pointer"
                                        onclick={() => handleCancelRequest(inv.requestId)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- ── RESOLVED SECTION ────────────────────────────── -->
            {#if resolvedList.length > 0}
                <div class="space-y-3">
                    <!-- Section Label + Toggle -->
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
                            <div class="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span>Student</span>
                                <span>Sent At</span>
                                <span>Status</span>
                            </div>

                            {#each resolvedList as inv (inv.requestId)}
                                <div class="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr] gap-4 items-center border-b border-gray-50 px-5 py-4 last:border-0 hover:bg-gray-50/60 transition-colors opacity-80">
                                    <!-- Student -->
                                    <div class="flex items-center gap-3 min-w-0">
                                        <Avatar class="h-9 w-9 shrink-0 border border-gray-100">
                                            <AvatarImage src={inv.student.avatarUrl ?? ""} />
                                            <AvatarFallback class="bg-gray-100 text-sm font-bold text-gray-500">
                                                {getInitials(inv.student.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div class="min-w-0">
                                            <p class="truncate text-sm font-semibold text-gray-700">
                                                {inv.student.fullName}
                                            </p>
                                            <p class="flex items-center gap-1 font-mono text-xs text-gray-400 mt-0.5">
                                                <IdCardIcon class="h-3 w-3" />
                                                {inv.student.studentCode}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Sent At -->
                                    <div class="flex items-center gap-1.5 text-xs text-gray-400">
                                        <ClockIcon class="h-3.5 w-3.5 shrink-0" />
                                        <span>{formatDate(inv.requestedAt)}</span>
                                    </div>

                                    <!-- Status -->
                                    <div>
                                        <Badge
                                            class={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase ${statusConfig[inv.status]?.class ?? "bg-gray-100 border-gray-300 text-gray-600"}`}
                                        >
                                            {statusConfig[inv.status]?.label ?? inv.status}
                                        </Badge>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <!-- Collapsed preview — hiển thị 2 row đầu mờ dần -->
                        <div class="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            {#each resolvedList.slice(0, 2) as inv (inv.requestId)}
                                <div class="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-4 items-center border-b border-gray-50 px-5 py-3.5 last:border-0 opacity-50">
                                    <div class="flex items-center gap-3 min-w-0">
                                        <Avatar class="h-8 w-8 shrink-0">
                                            <AvatarImage src={inv.student.avatarUrl ?? ""} />
                                            <AvatarFallback class="bg-gray-100 text-xs font-bold text-gray-500">
                                                {getInitials(inv.student.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p class="truncate text-sm font-semibold text-gray-600">
                                            {inv.student.fullName}
                                        </p>
                                    </div>
                                    <div></div>
                                    <div class="text-xs text-gray-400">{formatDate(inv.requestedAt)}</div>
                                    <Badge
                                        class={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase ${statusConfig[inv.status]?.class ?? "bg-gray-100 border-gray-300 text-gray-600"}`}
                                    >
                                        {statusConfig[inv.status]?.label ?? inv.status}
                                    </Badge>
                                </div>
                            {/each}
                            <!-- Fade overlay -->
                            <div class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        </div>
                    {/if}
                </div>
            {/if}
        {/if}
    </div>
</div>