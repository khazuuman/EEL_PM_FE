<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import {
        Avatar,
        AvatarFallback,
        AvatarImage,
    } from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import {
        ClockIcon,
        MailIcon,
        InboxIcon,
        ArrowLeftIcon,
        IdCardIcon,
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
            class: "bg-zinc-100 text-zinc-500 border-zinc-300",
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

<div class="px-4 py-10 pt-20 w-full min-h-screen">
    <a
        class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <div class="max-w-[800px] mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-zinc-900">
                My Sent Invitations
            </h1>
            <p class="mt-1 text-sm text-zinc-500">
                Track the status of invitations you have sent to other students.
            </p>
        </div>

        <!-- Empty state -->
        {#if invitations.length === 0}
            <div
                class="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 text-center"
            >
                <InboxIcon class="mb-3 size-10 text-zinc-300" />
                <p class="font-medium text-zinc-500">No invitations sent yet</p>
                <p class="mt-1 text-sm text-zinc-400">
                    Invite students to join your group.
                </p>
            </div>
        {:else}
            <div class="flex flex-col gap-4">
                {#each invitations as inv (inv.requestId)}
                    <Card.Root class="bg-white rounded-md">
                        <Card.Content class="py-5 px-10">
                            <div class="flex items-center gap-4">
                                <!-- Cột 1: Avatar -->
                                <Avatar class="size-15 shrink-0">
                                    <AvatarImage
                                        src={inv.student.avatarUrl ?? ""}
                                    />
                                    <AvatarFallback
                                        class="bg-orange-100 text-orange-800 font-bold text-xl"
                                    >
                                        {getInitials(inv.student.fullName)}
                                    </AvatarFallback>
                                </Avatar>

                                <!-- Cột 2: Tên, mã SV, email -->
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="font-bold text-[18px] text-zinc-900 truncate"
                                    >
                                        {inv.student.fullName}
                                    </p>
                                    <p
                                        class="text-zinc-500 text-[15px] font-mono flex gap-2 items-center"
                                    >
                                        <IdCardIcon
                                            class="size-4 shrink-0"
                                        />{inv.student.studentCode}
                                    </p>
                                    <div
                                        class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1"
                                    >
                                        <MailIcon class="size-3.5 shrink-0" />
                                        <span class="truncate"
                                            >{inv.student.email}</span
                                        >
                                    </div>
                                </div>

                                <!-- Cột 3: Status, message, date -->
                                <div class="flex-1 flex flex-col gap-1.5">
                                    <!-- Status badge -->
                                    <span
                                        class={[
                                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit",
                                            statusConfig[inv.status]?.class ??
                                                "bg-zinc-100 text-zinc-600 border-zinc-300",
                                        ].join(" ")}
                                    >
                                        {statusConfig[inv.status]?.label ??
                                            inv.status}
                                    </span>

                                    <!-- Date -->
                                    <div
                                        class="flex items-center gap-1.5 text-xs text-zinc-400"
                                    >
                                        <ClockIcon class="size-3.5 shrink-0" />
                                        <span
                                            >Sent {formatDate(
                                                inv.requestedAt,
                                            )}</span
                                        >
                                    </div>

                                    <!-- Message: luôn hiển thị -->
                                    <div
                                        class="rounded-md bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-600"
                                    >
                                        {#if inv.message}
                                            <span class="italic"
                                                >"{inv.message}"</span
                                            >
                                        {:else}
                                            <span class="text-zinc-400 italic"
                                                >No message</span
                                            >
                                        {/if}
                                    </div>

                                    <!-- Response message -->
                                    {#if inv.responseMessage}
                                        <div
                                            class="rounded-md bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-700"
                                        >
                                            <span
                                                class="font-semibold not-italic"
                                                >Response:
                                            </span>
                                            {inv.responseMessage}
                                        </div>
                                    {/if}
                                </div>

                                <!-- Cột 4: Button cancel -->
                                <div class="flex-1 flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        class="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onclick={() =>
                                            handleCancelRequest(inv.requestId)}
                                        disabled={inv.status !== "Pending"}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div></Card.Content
                        >
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </div>
</div>
