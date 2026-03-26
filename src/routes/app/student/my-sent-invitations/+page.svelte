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
        UserIcon,
        InboxIcon,
        ArrowLeftIcon,
    } from "lucide-svelte";

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
    };
</script>

<div class="px-4 py-10 pt-20 w-full min-h-screen">
    <a
        class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <div class="max-w-[600px] mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-zinc-900">Sent Invitations</h1>
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
                    <Card.Root
                        class="border-zinc-200 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <Card.Content class="p-5">
                            <div class="flex items-start gap-4">
                                <!-- Avatar -->
                                <Avatar class="size-11 shrink-0">
                                    <AvatarImage
                                        src={inv.student.avatarUrl ?? ""}
                                    />
                                    <AvatarFallback
                                        class="bg-orange-100 text-orange-600 font-semibold text-sm"
                                    >
                                        {getInitials(inv.student.fullName)}
                                    </AvatarFallback>
                                </Avatar>

                                <!-- Info -->
                                <div class="flex-1 min-w-0">
                                    <div
                                        class="flex items-center justify-between gap-2 flex-wrap"
                                    >
                                        <div>
                                            <p
                                                class="font-semibold text-zinc-900 truncate"
                                            >
                                                {inv.student.fullName}
                                            </p>
                                            <p
                                                class="text-xs text-zinc-500 font-mono"
                                            >
                                                {inv.student.studentCode}
                                            </p>
                                        </div>

                                        <!-- Status badge -->
                                        <span
                                            class={[
                                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                                statusConfig[inv.status]
                                                    ?.class ??
                                                    "bg-zinc-100 text-zinc-600 border-zinc-300",
                                            ].join(" ")}
                                        >
                                            {statusConfig[inv.status]?.label ??
                                                inv.status}
                                        </span>
                                    </div>

                                    <!-- Email -->
                                    <div
                                        class="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"
                                    >
                                        <MailIcon class="size-3.5 shrink-0" />
                                        <span class="truncate"
                                            >{inv.student.email}</span
                                        >
                                    </div>

                                    <!-- Requested at -->
                                    <div
                                        class="mt-1 flex items-center gap-1.5 text-xs text-zinc-400"
                                    >
                                        <ClockIcon class="size-3.5 shrink-0" />
                                        <span
                                            >Sent {formatDate(
                                                inv.requestedAt,
                                            )}</span
                                        >
                                    </div>

                                    <!-- Message -->
                                    {#if inv.message}
                                        <div
                                            class="mt-3 rounded-md bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-600 italic"
                                        >
                                            "{inv.message}"
                                        </div>
                                    {/if}

                                    <!-- Response message -->
                                    {#if inv.responseMessage}
                                        <div
                                            class="mt-2 rounded-md bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-700"
                                        >
                                            <span
                                                class="font-semibold not-italic"
                                                >Response:
                                            </span>
                                            {inv.responseMessage}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </div>
</div>
