<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import {
        CheckIcon,
        XIcon,
        InboxIcon,
        ClockIcon,
        IdCardIcon,
        Loader2Icon,
    } from "lucide-svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {
        Avatar,
        AvatarFallback,
        AvatarImage,
    } from "$lib/components/ui/avatar";

    let {
        open = $bindable(false),
        joinRequests = [],
        onSuccess,
    }: {
        open: boolean;
        joinRequests: any[];
        onSuccess?: () => void;
    } = $props();

    let loadingMap = $state<Record<number, boolean>>({});

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

    const sortedRequests = $derived(
        [...joinRequests].sort(
            (a, b) =>
                new Date(b.requestedAt ?? b.createdAt ?? 0).getTime() -
                new Date(a.requestedAt ?? a.createdAt ?? 0).getTime(),
        ),
    );
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="p-0 gap-0 !max-w-[1100px] w-[90vw] overflow-hidden">
        <!-- Header -->
        <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
        >
            <div>
                <h2
                    class="text-lg font-bold text-gray-900 flex items-center gap-2"
                >
                    <InboxIcon class="h-4 w-4 text-violet-500" />
                    Join Requests
                </h2>
                <p class="text-sm text-gray-400 mt-0.5">
                    Review and respond to students who want to join your group.
                </p>
            </div>
            {#if joinRequests.length > 0}
                <div
                    class="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-700"
                >
                    <span class="text-xs font-bold"
                        >{joinRequests.length} Pending</span
                    >
                </div>
            {/if}
        </div>

        <!-- Body -->
        <div class="max-h-[500px] overflow-y-auto">
            {#if sortedRequests.length === 0}
                <!-- Empty state -->
                <div
                    class="flex flex-col items-center justify-center py-16 gap-3 text-center"
                >
                    <div
                        class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100"
                    >
                        <InboxIcon class="h-7 w-7 text-gray-300" />
                    </div>
                    <p class="text-sm font-bold text-gray-700">
                        No pending requests
                    </p>
                    <p class="text-xs text-gray-400">
                        When students request to join, they'll appear here.
                    </p>
                </div>
            {:else}
                <!-- Table header -->
                <div
                    class="grid grid-cols-[1fr_auto_1fr_1fr_auto] gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500"
                >
                    <span>Student</span>
                    <span class="w-36">Major</span>
                    <span>Message</span>
                    <span>Requested At</span>
                    <span class="w-44 text-right">Actions</span>
                </div>

                <!-- Rows -->
                {#each sortedRequests as req (req.requestId)}
                    <div
                        class="grid grid-cols-[1fr_auto_1fr_1fr_auto] gap-3 items-center border-b border-gray-100 px-5 py-4 last:border-0 hover:bg-violet-50/30 transition-colors"
                    >
                        <!-- Student -->
                        <div class="flex items-center gap-3 min-w-0">
                            <Avatar
                                class="h-10 w-10 shrink-0 border border-gray-100"
                            >
                                <AvatarImage src={req.user?.avatarUrl ?? ""} />
                                <AvatarFallback
                                    class="bg-orange-100 text-sm font-bold text-orange-800"
                                >
                                    {getInitials(req.user?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div class="min-w-0">
                                <p
                                    class="truncate text-sm font-bold text-gray-900"
                                >
                                    {req.user?.fullName ?? "—"}
                                </p>
                                <p
                                    class="flex items-center gap-1 font-mono text-xs text-gray-400 mt-0.5"
                                >
                                    <IdCardIcon class="h-3 w-3" />
                                    {req.user?.studentCode ?? "—"}
                                </p>
                            </div>
                        </div>

                        <!-- Major -->
                        <div class="w-36 min-w-0">
                            <p class="truncate text-sm text-gray-600">
                                {req.user?.major ?? "—"}
                            </p>
                        </div>

                        <!-- Message -->
                        <div class="min-w-0">
                            {#if req.message}
                                <p
                                    class="truncate text-sm italic text-gray-500"
                                >
                                    "{req.message}"
                                </p>
                            {:else}
                                <span class="text-sm italic text-gray-300"
                                    >No message</span
                                >
                            {/if}
                        </div>

                        <!-- Date -->
                        <div
                            class="flex items-center gap-1.5 text-sm text-gray-500"
                        >
                            <ClockIcon class="h-3.5 w-3.5 shrink-0" />
                            <span
                                >{formatDate(
                                    req.requestedAt ?? req.createdAt,
                                )}</span
                            >
                        </div>

                        <!-- Actions -->
                        <div class="w-44 flex items-center justify-end gap-2">
                            <!-- Approve -->
                            <form
                                method="POST"
                                action="?/reviewJoinRequest"
                                use:enhance={() => {
                                    loadingMap[req.requestId] = true;
                                    return async ({ result }) => {
                                        loadingMap[req.requestId] = false;
                                        if (result.type === "success") {
                                            toast.success(
                                                `Approved ${req.user?.fullName}`,
                                            );
                                            await invalidateAll();
                                        } else if (result.type === "failure") {
                                            toast.error(
                                                (result.data as any)?.message ??
                                                    "Failed to approve",
                                            );
                                        }
                                    };
                                }}
                            >
                                <input
                                    type="hidden"
                                    name="reqId"
                                    value={req.requestId}
                                />
                                <input
                                    type="hidden"
                                    name="status"
                                    value="Approved"
                                />
                                <button
                                    type="submit"
                                    disabled={loadingMap[req.requestId]}
                                    class="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {#if loadingMap[req.requestId]}
                                        <Loader2Icon
                                            class="h-4 w-4 animate-spin"
                                        />
                                    {:else}
                                        <CheckIcon class="h-4 w-4" />
                                    {/if}
                                    Approve
                                </button>
                            </form>

                            <!-- Reject -->
                            <form
                                method="POST"
                                action="?/reviewJoinRequest"
                                use:enhance={() => {
                                    loadingMap[req.requestId] = true;
                                    return async ({ result }) => {
                                        loadingMap[req.requestId] = false;
                                        if (result.type === "success") {
                                            toast.success(
                                                `Rejected ${req.user?.fullName}`,
                                            );
                                            await invalidateAll();
                                        } else if (result.type === "failure") {
                                            toast.error(
                                                (result.data as any)?.message ??
                                                    "Failed to reject",
                                            );
                                        }
                                    };
                                }}
                            >
                                <input
                                    type="hidden"
                                    name="reqId"
                                    value={req.requestId}
                                />
                                <input
                                    type="hidden"
                                    name="status"
                                    value="Rejected"
                                />
                                <button
                                    type="submit"
                                    disabled={loadingMap[req.requestId]}
                                    class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {#if loadingMap[req.requestId]}
                                        <Loader2Icon
                                            class="h-4 w-4 animate-spin"
                                        />
                                    {:else}
                                        <XIcon class="h-4 w-4" />
                                    {/if}
                                    Reject
                                </button>
                            </form>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

        <!-- Footer -->
        {#if sortedRequests.length > 0}
            <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <p class="text-xs text-gray-400">
                    {sortedRequests.length} pending request{sortedRequests.length !==
                    1
                        ? "s"
                        : ""}
                </p>
            </div>
        {/if}
    </Dialog.Content>
</Dialog.Root>
