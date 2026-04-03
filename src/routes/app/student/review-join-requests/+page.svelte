<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll, goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { CheckIcon, XIcon, InboxIcon, ArrowLeftIcon } from "lucide-svelte";
    import type { PageData } from "./$types";

    let { data } = $props<{ data: PageData }>();
    const requests = $derived((data.requests as any[]) ?? []);

    let loadingMap = $state<Record<number, boolean>>({});
</script>

<div class="min-h-screen bg-white pt-10">
    <!-- Top Bar -->
    <div class="sticky top-0 z-10 backdrop-blur-sm px-6">
        <button
            type="button"
            onclick={() => goto("/app")}
            class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            Back to Home
        </button>
    </div>

    <div class="px-6 py-8">
        <!-- Page header -->
        <div class="mb-6">
            <h1 class="text-2xl font-extrabold text-zinc-900">Join Requests</h1>
            <p class="mt-1 text-sm text-zinc-400">
                Review and respond to students who want to join your group.
            </p>
        </div>

        <!-- Empty state -->
        {#if requests.length === 0}
            <div
                class="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-24 gap-3"
            >
                <span
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100"
                >
                    <InboxIcon class="h-7 w-7 text-zinc-400" />
                </span>
                <p class="font-semibold text-zinc-600">No pending requests</p>
                <p class="text-sm text-zinc-400">
                    When students request to join, they'll appear here.
                </p>
            </div>
        {:else}
            <!-- Request list — full width, card per row -->
            <div class="space-y-3">
                {#each requests as req (req.requestId)}
                    <div
                        class="flex items-center gap-5 rounded-xl border border-zinc-200 bg-white px-6 py-5 shadow-sm hover:border-zinc-300 hover:shadow transition-all"
                    >
                        <!-- Avatar -->
                        <span
                            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-700"
                        >
                            {req.user?.fullName?.charAt(0) ?? "?"}
                        </span>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-zinc-900 text-base">
                                {req.user?.fullName}
                            </p>
                            <p class="text-sm text-zinc-400 mt-0.5">
                                {req.user?.major}
                            </p>
                            {#if req.message}
                                <p
                                    class="mt-2 text-sm text-zinc-500 italic bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 leading-relaxed"
                                >
                                    "{req.message}"
                                </p>
                            {/if}
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2 shrink-0">
                            <!-- Approve -->
                            <form
                                method="POST"
                                action="?/ReviewJoinRequest"
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
                                    class="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <CheckIcon class="h-4 w-4" />
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
                                    name="groupId"
                                    value={data.groupId}
                                />
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
                                    class="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <XIcon class="h-4 w-4" />
                                    Reject
                                </button>
                            </form>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Footer count -->
            <p class="mt-4 text-xs text-zinc-400 text-right">
                {requests.length} pending request{requests.length !== 1
                    ? "s"
                    : ""}
            </p>
        {/if}
    </div>
</div>
