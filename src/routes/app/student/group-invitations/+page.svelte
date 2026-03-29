<script lang="ts">
    import type { PageData } from "./$types";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import * as Card from "$lib/components/ui/card/index";
    import * as Avatar from "$lib/components/ui/avatar/index";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Separator } from "$lib/components/ui/separator/index";
    import { Users, Clock } from "@lucide/svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { ArrowLeftIcon, UsersIcon } from "lucide-svelte";
    import { setActions } from "$lib/stores/actions";
    import { invalidateAll } from "$app/navigation";

    let { data }: { data: PageData } = $props();
    const invitations = data?.invitations ?? [];

    function timeAgo(dateStr: string): string {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        if (minutes > 0)
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        return "Just now";
    }

    function getInitials(name: string): string {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    }

    let submittingId = $state<number | null>(null);

    async function submitAction(
        requestId: number,
        status: "Approved" | "Rejected",
    ) {
        submittingId = requestId;
        const formData = new FormData();
        formData.set("reqId", String(requestId));
        formData.set("status", status);

        const response = await fetch("?/reviewInviteGroupRequest", {
            method: "POST",
            body: formData,
        });

        submittingId = null;

        if (response.ok) {
            toast.success(
                status === "Approved"
                    ? "Invitation accepted!"
                    : "Invitation declined.",
            );
            // Reload lại data
            invalidateAll();
        } else {
            const json = await response.json().catch(() => ({}));
            toast.error(json?.data?.message ?? "Action failed.");
        }
    }

    function confirmAction(
        requestId: number,
        status: "Approved" | "Rejected",
        groupName: string,
    ) {
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

<div class="min-h-screen bg-gray-50 px-4 py-10 pt-15">
    <a
        class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <div class="mx-auto max-w-2xl">
        <!-- Page Header -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-stone-900">
                Pending Invitations
            </h1>
            <p class="mt-1 text-sm text-stone-500">
                Review and manage your group project requests.
            </p>
        </div>

        <!-- Empty state -->
        {#if invitations.length === 0}
            <div
                class="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center"
            >
                <Users class="mb-3 h-10 w-10 text-stone-300" />
                <p class="font-medium text-stone-500">No pending invitations</p>
                <p class="mt-1 text-sm text-stone-400">
                    You're all caught up! Check back later.
                </p>
            </div>
        {/if}

        <!-- Invitation Cards -->
        <div class="flex flex-col gap-4">
            {#each invitations as inv (inv.requestId)}
                <Card.Root
                    class="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
                >
                    <Card.Content class="p-0">
                        <!-- Header: Inviter Info -->
                        <div class="flex items-start justify-between px-5 pt-3">
                            <div class="flex items-center gap-3">
                                <div class="relative">
                                    <Avatar.Root class="h-12 w-12">
                                        <Avatar.Image
                                            src={inv.invitedBy?.avatarUrl ?? ""}
                                            alt={inv.invitedBy?.fullName}
                                        />
                                        <Avatar.Fallback
                                            class="bg-stone-700 text-md font-semibold text-white"
                                        >
                                            {getInitials(
                                                inv.invitedBy?.fullName ?? "?",
                                            )}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                </div>
                                <div>
                                    <p
                                        class="text-[16px] font-bold text-stone-800"
                                    >
                                        {inv.invitedBy?.fullName ?? "Unknown"}
                                    </p>
                                    <p class="text-[14px] text-stone-600">
                                        Student Code: {inv.invitedBy
                                            ?.studentCode ?? "—"}
                                    </p>
                                </div>
                            </div>
                            <!-- Timestamp -->
                            <div
                                class="flex items-center gap-1 text-[13px] text-stone-400"
                            >
                                <Clock class="h-3.5 w-3.5" />
                                <span>{timeAgo(inv.requestedAt)}</span>
                            </div>
                        </div>
                        <Separator class="mt-5 bg-amber-600" />
                        <!-- Body: Group Details -->
                        <div class="mt-5 px-5">
                            <div class="flex items-center gap-2">
                                <span
                                    class="text-[18px] font-bold text-stone-900"
                                >
                                    {inv.group?.groupName ?? "—"}
                                </span>
                                <Badge
                                    variant="secondary"
                                    class="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                                >
                                    {inv.group?.status ?? "—"}
                                </Badge>
                                <!-- Request status badge -->
                                <Badge
                                    class="ml-auto rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white"
                                >
                                    {inv.status}
                                </Badge>
                            </div>

                            {#if inv.group?.className}
                                <p class="mt-1 text-sm text-stone-500">
                                    Class: {inv.group.className}
                                </p>
                            {/if}

                            <!-- Member count -->
                            <div
                                class="mt-3 flex items-center gap-1.5 text-sm text-stone-500 bg-stone-100 rounded-full w-fit px-3 py-1"
                            >
                                <UsersIcon class="h-4 w-4 text-stone-400" />
                                <span class="font-medium text-stone-600">
                                    {inv.group?.memberCount} / {inv.group
                                        ?.maxMembers} members
                                </span>
                            </div>

                            <!-- Optional message -->
                            {#if inv.message}
                                <blockquote
                                    class="mt-4 rounded-lg border-l-4 border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 italic"
                                >
                                    "{inv.message}"
                                </blockquote>
                            {:else}
                                <p
                                    class="mt-4 flex items-center gap-1.5 text-xs text-stone-400 italic"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-3.5 w-3.5 shrink-0"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    No message provided.
                                </p>
                            {/if}
                        </div>
                    </Card.Content>

                    <!-- Footer Actions -->
                    <Separator class="bg-stone-100" />
                    <div class="flex items-center justify-end gap-3 px-5 py-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={submittingId === inv.requestId}
                            class="cursor-pointer border-stone-300 text-stone-700 hover:bg-stone-50"
                            onclick={() =>
                                confirmAction(
                                    inv.requestId,
                                    "Rejected",
                                    inv.group?.groupName,
                                )}
                        >
                            Decline
                        </Button>

                        <Button
                            type="button"
                            disabled={submittingId === inv.requestId}
                            class="cursor-pointer bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
                            onclick={() =>
                                confirmAction(
                                    inv.requestId,
                                    "Approved",
                                    inv.group?.groupName,
                                )}
                        >
                            {#if submittingId === inv.requestId}
                                <span
                                    class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                                ></span>
                            {/if}
                            Accept Invitation
                        </Button>
                    </div>
                </Card.Root>
            {/each}
        </div>
    </div>
</div>
