<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { CheckIcon, XIcon, UserIcon, InboxIcon, ArrowLeftIcon } from "lucide-svelte";
    import type { PageData } from "./$types";

    let { data } = $props<{ data: PageData }>();
    const requests = $derived((data.requests as any[]) ?? []);

    let loadingMap = $state<Record<number, boolean>>({});
</script>

<div class="min-h-screen bg-stone-50 px-6 pt-15">
    <a
        class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <div class="mx-auto max-w-2xl space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-2xl font-extrabold text-stone-900">
                Join Requests
            </h1>
            <p class="mt-1 text-sm text-stone-400">
                Review and respond to students who want to join your group.
            </p>
        </div>

        <!-- Empty state -->
        {#if requests.length === 0}
            <div
                class="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 gap-3"
            >
                <span
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100"
                >
                    <InboxIcon class="h-7 w-7 text-stone-400" />
                </span>
                <p class="font-semibold text-stone-600">No pending requests</p>
                <p class="text-sm text-stone-400">
                    When students request to join, they'll appear here.
                </p>
            </div>
        {:else}
            <div class="space-y-3">
                {#each requests as req (req.requestId)}
                    <div
                        class="flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm"
                    >
                        <!-- Avatar -->
                        <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700"
                        >
                            {req.user?.fullName?.charAt(0) ?? "?"}
                        </span>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-stone-900 truncate">
                                {req.user?.fullName}
                            </p>
                            <p class="text-xs text-stone-400 truncate">
                                {req.user?.major}
                            </p>
                            {#if req.message}
                                <p
                                    class="mt-1 text-sm text-stone-500 italic truncate"
                                >
                                    "{req.message}"
                                </p>
                            {/if}
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2 shrink-0">
                            <!-- Approve -->
                            <form
                                method="POST"
                                action="?/InviteMember"
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
                                    value="Approved"
                                />
                                <button
                                    type="submit"
                                    disabled={loadingMap[req.requestId]}
                                    class="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckIcon class="h-4 w-4" />
                                    Approve
                                </button>
                            </form>

                            <!-- Reject -->
                            <form
                                method="POST"
                                action="?/InviteMember"
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
                                    class="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XIcon class="h-4 w-4" />
                                    Reject
                                </button>
                            </form>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
