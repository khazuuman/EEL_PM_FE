<script lang="ts">
    import type { PageData } from "./$types";
    import { toast } from "svelte-sonner";
    import * as Avatar from "$lib/components/ui/avatar/index";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Separator } from "$lib/components/ui/separator/index";
    import { Users, Clock } from "@lucide/svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { ArrowLeftIcon, UsersIcon } from "lucide-svelte";
    import { setActions } from "$lib/stores/actions";
    import { invalidateAll, goto } from "$app/navigation";

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
            headers: { "x-sveltekit-action": "true" }, // ← bắt buộc để SvelteKit nhận đây là action call
        });

        submittingId = null;

        const json = await response.json().catch(() => ({}));

        // SvelteKit action trả về dạng { type: "success"|"failure", data: {...} }
        if (json.type === "success") {
            toast.success(
                status === "Approved"
                    ? "Invitation accepted!"
                    : "Invitation declined.",
            );
            invalidateAll();
        } else if (json.type === "failure") {
            toast.error(json.data?.message ?? "Action failed.");
        } else {
            // Fallback nếu response.ok nhưng format lạ
            if (response.ok) {
                toast.success(
                    status === "Approved"
                        ? "Invitation accepted!"
                        : "Invitation declined.",
                );
                invalidateAll();
            } else {
                toast.error("Action failed.");
            }
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

<div class="min-h-screen bg-white pt-10">
    <!-- Top Bar -->
    <div
        class="sticky top-0 z-10 border-b border-zinc-100 bg-white/95 backdrop-blur-sm px-6"
    >
        <button
            type="button"
            onclick={() => goto("/app")}
            class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            Home
        </button>
    </div>

    <div class="px-6 py-8">
        <!-- Page header -->
        <div class="mb-6">
            <h1 class="text-2xl font-extrabold text-zinc-900">
                Pending Invitations
            </h1>
            <p class="mt-1 text-sm text-zinc-400">
                Review and manage your group project invitations.
            </p>
        </div>

        <!-- Empty state -->
        {#if invitations.length === 0}
            <div
                class="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-24 text-center gap-3"
            >
                <span
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100"
                >
                    <Users class="h-7 w-7 text-zinc-400" />
                </span>
                <p class="font-semibold text-zinc-600">
                    No pending invitations
                </p>
                <p class="text-sm text-zinc-400">
                    You're all caught up! Check back later.
                </p>
            </div>
        {:else}
            <div class="space-y-4">
                {#each invitations as inv (inv.requestId)}
                    <div
                        class="rounded-xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow transition-all overflow-hidden"
                    >
                        <!-- Card body -->
                        <div class="px-6 py-5 space-y-4">
                            <!-- Row 1: Inviter + timestamp -->
                            <div
                                class="flex items-center justify-between gap-4"
                            >
                                <div class="flex items-center gap-3 min-w-0">
                                    <Avatar.Root class="h-11 w-11 shrink-0">
                                        <Avatar.Image
                                            src={inv.invitedBy?.avatarUrl ?? ""}
                                            alt={inv.invitedBy?.fullName}
                                        />
                                        <Avatar.Fallback
                                            class="bg-zinc-700 text-sm font-bold text-white"
                                        >
                                            {getInitials(
                                                inv.invitedBy?.fullName ?? "?",
                                            )}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                    <div class="min-w-0">
                                        <p
                                            class="text-base font-bold text-zinc-900 truncate"
                                        >
                                            {inv.invitedBy?.fullName ??
                                                "Unknown"}
                                        </p>
                                        <p class="text-sm text-zinc-400">
                                            {inv.invitedBy?.studentCode ?? "—"}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    class="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0"
                                >
                                    <Clock class="h-3.5 w-3.5" />
                                    <span>{timeAgo(inv.requestedAt)}</span>
                                </div>
                            </div>

                            <Separator class="bg-amber-500/30" />

                            <!-- Row 2: Group info -->
                            <div class="space-y-2">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span
                                        class="text-lg font-bold text-zinc-900"
                                    >
                                        {inv.group?.groupName ?? "—"}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        class="rounded-full bg-zinc-100 text-zinc-600 text-xs px-2.5 py-0.5"
                                    >
                                        {inv.group?.status ?? "—"}
                                    </Badge>
                                    <Badge
                                        class="ml-auto rounded-full bg-amber-500 text-white text-xs font-semibold px-3 py-0.5"
                                    >
                                        {inv.status}
                                    </Badge>
                                </div>

                                {#if inv.group?.className}
                                    <p class="text-sm text-zinc-500">
                                        Class: {inv.group.className}
                                    </p>
                                {/if}

                                <div
                                    class="flex items-center gap-1.5 text-sm text-zinc-500 bg-zinc-100 rounded-full w-fit px-3 py-1"
                                >
                                    <UsersIcon class="h-4 w-4 text-zinc-400" />
                                    <span class="font-medium">
                                        {inv.group?.memberCount} / {inv.group
                                            ?.maxMembers} members
                                    </span>
                                </div>
                            </div>

                            <!-- Row 3: Message -->
                            {#if inv.message}
                                <blockquote
                                    class="rounded-lg border-l-4 border-amber-300 bg-amber-50/60 px-4 py-3 text-sm text-zinc-600 italic leading-relaxed"
                                >
                                    "{inv.message}"
                                </blockquote>
                            {:else}
                                <p class="text-xs text-zinc-400 italic">
                                    No message provided.
                                </p>
                            {/if}
                        </div>

                        <!-- Footer actions -->
                        <div
                            class="flex items-center justify-end gap-2 px-6 py-3 border-t border-zinc-100 bg-zinc-50/40"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                disabled={submittingId === inv.requestId}
                                class="cursor-pointer border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-sm"
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
                                class="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white text-sm disabled:opacity-60"
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
                    </div>
                {/each}
            </div>

            <!-- Footer count -->
            <p class="mt-4 text-xs text-zinc-400 text-right">
                {invitations.length} pending invitation{invitations.length !== 1
                    ? "s"
                    : ""}
            </p>
        {/if}
    </div>
</div>
