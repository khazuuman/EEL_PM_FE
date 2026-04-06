<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll, goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import {
        CheckIcon,
        XIcon,
        InboxIcon,
        ArrowLeftIcon,
        RefreshCwIcon,
        UsersIcon,
        ClockIcon,
        IdCardIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import { Badge } from "$lib/components/ui/badge";
    import {
        Avatar,
        AvatarFallback,
        AvatarImage,
    } from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";

    let { data } = $props<{ data: PageData }>();
    const requests = $derived((data.requests as any[]) ?? []);
    const sortedRequests = $derived(
        [...requests].sort(
            (a, b) =>
                new Date(b.requestedAt ?? b.createdAt ?? 0).getTime() -
                new Date(a.requestedAt ?? a.createdAt ?? 0).getTime(),
        ),
    );

    let loadingMap = $state<Record<number, boolean>>({});
    let refreshing = $state(false);

    async function handleRefresh() {
        refreshing = true;
        await invalidateAll();
        refreshing = false;
    }

    function getInitials(name: string = "") {
        return name
            .split(" ")
            .slice(-2)
            .map((n) => n[0])
            .join("")
            .toUpperCase();
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
            <span class="text-sm font-semibold">Back to Home</span>
        </Button>
    </div>

    <!-- ── Main Content ───────────────────────────────────────── -->
    <div class="px-6 py-5 space-y-8 max-w-[1600px] mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">
                    Join Requests
                </h1>
                <p class="mt-1 text-base text-gray-500">
                    Review and respond to students who want to join your group.
                </p>
            </div>
            <div class="flex items-center gap-3">
                {#if requests.length > 0}
                    <div class="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                        <UsersIcon class="h-4 w-4" />
                        <span class="text-sm font-bold">{requests.length} Pending</span>
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
        {#if requests.length === 0}
            <div class="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <InboxIcon class="h-8 w-8 text-gray-400" />
                </div>
                <p class="text-lg font-bold text-gray-900">No pending requests</p>
                <p class="mt-1 text-base text-gray-500">
                    When students request to join, they'll appear here.
                </p>
            </div>
        {:else}
            <!-- Section Label -->
            <div class="flex items-center gap-3">
                <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400">
                    Awaiting Review
                </h2>
                <span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    {requests.length}
                </span>
            </div>

            <!-- Table -->
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <!-- Table Header -->
                <div class="grid grid-cols-[2fr_1.2fr_1.5fr_1fr_auto] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Student</span>
                    <span>Major</span>
                    <span>Message</span>
                    <span>Requested At</span>
                    <span class="w-44 text-right">Actions</span>
                </div>

                <!-- Rows -->
                {#each sortedRequests as req (req.requestId)}
                    <div class="grid grid-cols-[2fr_1.2fr_1.5fr_1fr_auto] gap-4 items-center border-b border-gray-50 px-5 py-4 last:border-0 hover:bg-amber-50/30 transition-colors">
                        <!-- Student -->
                        <div class="flex items-center gap-3 min-w-0">
                            <Avatar class="h-9 w-9 shrink-0 border border-gray-100">
                                <AvatarImage src={req.user?.avatarUrl ?? ""} />
                                <AvatarFallback class="bg-orange-100 text-sm font-bold text-orange-800">
                                    {getInitials(req.user?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div class="min-w-0">
                                <p class="truncate text-sm font-semibold text-gray-900">
                                    {req.user?.fullName ?? "—"}
                                </p>
                                <p class="flex items-center gap-1 font-mono text-xs text-gray-400 mt-0.5">
                                    <IdCardIcon class="h-3 w-3" />
                                    {req.user?.studentCode ?? "—"}
                                </p>
                            </div>
                        </div>

                        <!-- Major -->
                        <div class="min-w-0">
                            <p class="truncate text-sm text-gray-500">
                                {req.user?.major ?? "—"}
                            </p>
                        </div>

                        <!-- Message -->
                        <div class="min-w-0">
                            {#if req.message}
                                <p class="truncate text-sm italic text-gray-500">
                                    "{req.message}"
                                </p>
                            {:else}
                                <span class="text-xs italic text-gray-300">No message</span>
                            {/if}
                        </div>

                        <!-- Requested At -->
                        <div class="flex items-center gap-1.5 text-xs text-gray-400">
                            <ClockIcon class="h-3.5 w-3.5 shrink-0" />
                            <span>{formatDate(req.requestedAt ?? req.createdAt)}</span>
                        </div>

                        <!-- Actions -->
                        <div class="w-44 flex items-center justify-end gap-2">
                            <!-- Approve -->
                            <form
                                method="POST"
                                action="?/ReviewJoinRequest"
                                use:enhance={() => {
                                    loadingMap[req.requestId] = true;
                                    return async ({ result }) => {
                                        loadingMap[req.requestId] = false;
                                        if (result.type === "success") {
                                            toast.success(`Approved ${req.user?.fullName}`);
                                            await invalidateAll();
                                        } else if (result.type === "failure") {
                                            toast.error((result.data as any)?.message ?? "Failed to approve");
                                        }
                                    };
                                }}
                            >
                                <input type="hidden" name="reqId" value={req.requestId} />
                                <input type="hidden" name="status" value="Approved" />
                                <button
                                    type="submit"
                                    disabled={loadingMap[req.requestId]}
                                    class="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <CheckIcon class="h-3.5 w-3.5" />
                                    Approve
                                </button>
                            </form>

                            <!-- Reject -->
                            <form
                                method="POST"
                                action="?/ReviewJoinRequest"
                                use:enhance={() => {
                                    loadingMap[req.requestId] = true;
                                    return async ({ result }) => {
                                        loadingMap[req.requestId] = false;
                                        if (result.type === "success") {
                                            toast.success(`Rejected ${req.user?.fullName}`);
                                            await invalidateAll();
                                        } else if (result.type === "failure") {
                                            toast.error((result.data as any)?.message ?? "Failed to reject");
                                        }
                                    };
                                }}
                            >
                                <input type="hidden" name="groupId" value={data.groupId} />
                                <input type="hidden" name="reqId" value={req.requestId} />
                                <input type="hidden" name="status" value="Rejected" />
                                <button
                                    type="submit"
                                    disabled={loadingMap[req.requestId]}
                                    class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <XIcon class="h-3.5 w-3.5" />
                                    Reject
                                </button>
                            </form>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Footer count -->
            <p class="text-xs text-gray-400 text-right">
                {requests.length} pending request{requests.length !== 1 ? "s" : ""}
            </p>
        {/if}
    </div>
</div>