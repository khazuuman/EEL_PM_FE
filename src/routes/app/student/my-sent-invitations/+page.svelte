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
        MailIcon,
        InboxIcon,
        ArrowLeftIcon,
        IdCardIcon,
        SendIcon,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";
    import { setActions } from "$lib/stores/actions";

    const { data } = $props();
    let invitations = $derived(data?.invitations ?? []);

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
        Accepted: {
            label: "Accepted",
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
    <div
        class="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-3"
    >
        <Button
            variant="ghost"
            href="/app"
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
            <ArrowLeftIcon class="h-4 w-4" />
            <span class="text-sm font-semibold">Back to Home</span>
        </Button>
    </div>

    <!-- ── Main Content ─────────────────────────────────────────── -->
    <div class="px-6 py-5 space-y-8 max-w-[1600px] mx-auto">
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
            {#if invitations.length > 0}
                <div class="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                    <SendIcon class="h-4 w-4" />
                    <span class="text-sm font-bold">{invitations.length} Sent</span>
                </div>
            {/if}
        </div>

        <!-- Empty State -->
        {#if invitations.length === 0}
            <div class="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <InboxIcon class="h-8 w-8 text-gray-400" />
                </div>
                <p class="text-lg font-bold text-gray-900">No invitations sent yet</p>
                <p class="mt-1 text-base text-gray-500">
                    Invite students to join your group.
                </p>
            </div>
        {:else}
            <!-- Grid Layout Full Width -->
            <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {#each invitations as inv (inv.requestId)}
                    <div class="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md">
                        <!-- Top Info -->
                        <div class="p-6">
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex items-center gap-4">
                                    <Avatar class="h-14 w-14 border border-gray-100 shadow-sm shrink-0">
                                        <AvatarImage src={inv.student.avatarUrl ?? ""} />
                                        <AvatarFallback class="bg-orange-100 text-lg font-bold text-orange-800">
                                            {getInitials(inv.student.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div class="min-w-0">
                                        <p class="truncate text-lg font-bold text-gray-900 leading-tight">
                                            {inv.student.fullName}
                                        </p>
                                        <div class="mt-1 flex items-center gap-3">
                                            <p class="flex items-center gap-1.5 font-mono text-sm text-gray-500">
                                                <IdCardIcon class="h-3.5 w-3.5" />
                                                {inv.student.studentCode}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Badge
                                    class={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase shrink-0 ${
                                        statusConfig[inv.status]?.class ?? "bg-gray-100 border-gray-300 text-gray-600"
                                    }`}
                                >
                                    {statusConfig[inv.status]?.label ?? inv.status}
                                </Badge>
                            </div>

                            <div class="mt-4 flex items-center gap-1.5 text-sm text-gray-500">
                                <MailIcon class="h-4 w-4 shrink-0 text-gray-400" />
                                <span class="truncate">{inv.student.email}</span>
                            </div>

                            <div class="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                                <ClockIcon class="h-4 w-4 shrink-0 text-gray-400" />
                                <span>Sent {formatDate(inv.requestedAt)}</span>
                            </div>

                            <!-- Initial Message -->
                            <div class="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                    Your Message
                                </p>
                                {#if inv.message}
                                    <p class="text-sm italic text-gray-700 leading-relaxed">
                                        "{inv.message}"
                                    </p>
                                {:else}
                                    <p class="text-sm italic text-gray-400">
                                        No message provided
                                    </p>
                                {/if}
                            </div>

                            <!-- Response Message -->
                            {#if inv.responseMessage}
                                <div class="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                                    <p class="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1">
                                        Response Message
                                    </p>
                                    <p class="text-sm text-orange-800 leading-relaxed">
                                        {inv.responseMessage}
                                    </p>
                                </div>
                            {/if}
                        </div>

                        <!-- Footer Action -->
                        <div class="border-t border-gray-100 bg-gray-50/60 p-4 flex justify-end">
                            <Button
                                variant="outline"
                                class="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm cursor-pointer"
                                onclick={() => handleCancelRequest(inv.requestId)}
                                disabled={inv.status !== "Pending"}
                            >
                                Cancel Invitation
                            </Button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>