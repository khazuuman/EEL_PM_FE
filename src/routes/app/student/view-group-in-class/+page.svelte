<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Progress from "$lib/components/ui/progress/progress.svelte";
    import {
        ArrowLeftIcon,
        EyeIcon,
        Layers2Icon,
        SearchIcon,
        UsersIcon,
        UserStarIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { enhance } from "$app/forms";
    import GroupDetail from "./components/GroupDetail.svelte";
    import type { SubmitFunction } from "@sveltejs/kit";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import Label from "$lib/components/ui/label/label.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props<{ data: PageData }>();
    const user = data.user;
    const groups = $derived(data.groups as any[]);
    const totalItems = $derived(data.totalItems as any);
    let searchQuery = $state(page.url.searchParams.get("search") ?? "");
    let joinDialogOpen = $state(false);
    let selectedJoinGroup = $state<any>(null);
    let joinMessage = $state("");
    let joinLoading = $state(false);

    const handleJoinEnhance: SubmitFunction = () => {
        joinLoading = true;
        return async ({ result, update }) => {
            joinLoading = false;
            if (result.type === "success") {
                joinDialogOpen = false;
                joinMessage = "";
                selectedJoinGroup = null;
                toast.success("Join request sent successfully!");
            } else if (result.type === "failure") {
                toast.error(
                    result.data?.message ?? "Failed to send join request.",
                );
            } else {
                toast.error("Something went wrong. Please try again.");
            }
            await update();
        };
    };

    function openJoinDialog(group: any) {
        selectedJoinGroup = group;
        joinMessage = "";
        joinDialogOpen = true;
    }

    const statusConfig: Record<string, { class: string; dot: string }> = {
        Draft: {
            class: "bg-stone-100 text-stone-500 border border-stone-200",
            dot: "bg-stone-400",
        },
        Pending: {
            class: "bg-amber-50 text-amber-600 border border-amber-200",
            dot: "bg-amber-400",
        },
        Approved: {
            class: "bg-emerald-50 text-emerald-600 border border-emerald-200",
            dot: "bg-emerald-400",
        },
        Active: {
            class: "bg-emerald-50 text-emerald-600 border border-emerald-200",
            dot: "bg-emerald-400",
        },
        Rejected: {
            class: "bg-red-50 text-red-500 border border-red-200",
            dot: "bg-red-400",
        },
        Completed: {
            class: "bg-blue-50 text-blue-600 border border-blue-200",
            dot: "bg-blue-400",
        },
    };

    let debounceTimer: ReturnType<typeof setTimeout>;

    function updateURL() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const params = new URLSearchParams();
            if (searchQuery) params.set("searchTerm", searchQuery);
            goto(`?${params.toString()}`, {
                replaceState: true,
                keepFocus: true,
                noScroll: true,
            });
        }, 300);
    }

    $effect(() => {
        searchQuery;
        updateURL();
    });

    let detailOpen = $state(false);
    let selectedGroup = $state<any>(null);

    const handleEnhance: SubmitFunction = () => {
        return async ({ result }) => {
            if (result.type === "success" && result.data?.group) {
                selectedGroup = result.data.group;
                detailOpen = true;
            }
        };
    };
</script>

<div class="min-h-screen bg-white px-8">
    <!-- Page Header -->
    <div class="bg-white z-40">
        <div class="mx-auto px-4 sm:px-6">
            <div class="flex items-center h-12">
                <Button
                    variant="ghost"
                    onclick={() => goto(`/app/student`)}
                    class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer -ml-3"
                >
                    <ArrowLeftIcon class="w-4 h-4" />
                    Back
                </Button>
            </div>
        </div>
    </div>

    <div class="mx-auto px-4 sm:px-6">
        <!-- Title Row -->
        <div
            class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
            <div>
                <p
                    class="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1"
                >
                    Overview
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    Groups
                </h1>
                <p class="text-sm text-stone-400 mt-0.5">
                    Browse and join groups in your class
                </p>
            </div>

            <!-- Search -->
            <div class="relative w-full sm:w-72">
                <SearchIcon
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                />
                <Input
                    id="search"
                    placeholder="Search group name..."
                    class="pl-9 bg-stone-50 border-stone-200 focus:bg-white focus:border-amber-400 transition-colors text-sm rounded-lg"
                    bind:value={searchQuery}
                />
            </div>
        </div>

        <!-- Groups Table -->
        <div class="rounded-xl border border-stone-200 overflow-hidden">
            <!-- Table Header -->
            <div
                class="grid grid-cols-4 gap-4 border-b border-stone-100 bg-stone-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-stone-400"
            >
                <span>Group</span>
                <span>Leader</span>
                <span>Members</span>
                <span>Status</span>
            </div>

            <!-- Rows -->
            {#if groups.length === 0}
                <div
                    class="flex flex-col items-center justify-center py-16 gap-2 text-stone-300"
                >
                    <UsersIcon class="w-10 h-10" />
                    <p class="text-md font-semibold text-stone-400">
                        No groups found
                    </p>
                </div>
            {:else}
                {#each groups as group}
                    {@const cfg = statusConfig[group.status] ?? {
                        class: "bg-stone-100 text-stone-500 border border-stone-200",
                        dot: "bg-stone-400",
                    }}
                    {@const fillPct = Math.round(
                        (group.memberCount / group.maxMember) * 100,
                    )}
                    {@const isFull = group.memberCount >= group.maxMember}

                    <form
                        method="POST"
                        action="?/getGroupDetail"
                        use:enhance={handleEnhance}
                        class="grid grid-cols-4 gap-4 items-center border-b border-stone-50 px-5 py-4 last:border-0 hover:bg-amber-50/40 transition-colors group/row"
                    >
                        <input type="hidden" name="groupId" value={group.id} />

                        <!-- Group Name -->
                        <button type="submit" class="min-w-0 text-left cursor-pointer">
                            <p
                                class="font-bold text-sm text-stone-900 truncate group-hover/row:text-amber-600 transition-colors underline-offset-2 group-hover/row:underline"
                            >
                                {group.name}
                            </p>
                        </button>

                        <!-- Leader -->
                        <div class="flex items-center gap-2 min-w-0">
                            <div
                                class="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0"
                            >
                                <UserStarIcon
                                    class="w-3.5 h-3.5 text-amber-600"
                                />
                            </div>
                            <p
                                class="text-sm text-stone-700 font-medium truncate"
                            >
                                {group.leaderName}
                            </p>
                        </div>

                        <!-- Members -->
                        <div class="min-w-0">
                            <div class="flex items-center justify-between mb-1">
                                <span
                                    class="text-sm text-stone-600 font-medium"
                                >
                                    {group.memberCount}<span
                                        class="text-stone-300 mx-0.5">/</span
                                    >{group.maxMember}
                                </span>
                                <span
                                    class="text-xs font-bold {isFull
                                        ? 'text-red-500'
                                        : 'text-stone-400'}"
                                >
                                    {isFull ? "Full" : `${fillPct}%`}
                                </span>
                            </div>
                            <div
                                class="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden"
                            >
                                <div
                                    class="h-full rounded-full transition-all duration-500 {isFull
                                        ? 'bg-red-400'
                                        : 'bg-amber-400'}"
                                    style="width: {fillPct}%"
                                ></div>
                            </div>
                        </div>

                        <!-- Status -->
                        <div class="flex items-center justify-between">
                            <span
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold {cfg.class}"
                            >
                                <span class="w-1.5 h-1.5 rounded-full {cfg.dot}"
                                ></span>
                                {group.status}
                            </span>

                            {#if !user?.student?.group && (group.status === "Rejected" || group.status === "Draft")}
                                <Button
                                    type="button"
                                    variant="outline"
                                    class="h-8 px-3 text-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        openJoinDialog(group);
                                    }}
                                >
                                    <UsersIcon class="w-3.5 h-3.5 mr-1.5" />
                                    Join
                                </Button>
                            {/if}
                        </div>
                    </form>
                {/each}
            {/if}
        </div>

        <!-- Footer count -->
        <p class="text-md text-stone-400 text-right mt-2">
            {groups.length} group{groups.length !== 1 ? "s" : ""} found
        </p>
    </div>
</div>

<!-- Group Detail -->
<GroupDetail
    open={detailOpen}
    onOpenChange={(v) => (detailOpen = v)}
    group={selectedGroup}
/>

<!-- Join Dialog -->
<Dialog.Root bind:open={joinDialogOpen}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header class="space-y-1.5">
            <Dialog.Title class="text-lg font-bold text-stone-900">
                Request to Join
            </Dialog.Title>
            <Dialog.Description class="text-sm text-stone-500">
                Sending request to
                <span class="font-semibold text-stone-800"
                    >{selectedJoinGroup?.name}</span
                >
            </Dialog.Description>
        </Dialog.Header>

        <form
            method="POST"
            action="?/joinRequest"
            use:enhance={handleJoinEnhance}
        >
            <input type="hidden" name="groupId" value={selectedJoinGroup?.id} />

            <div class="flex flex-col gap-2 my-5">
                <Label
                    for="join-message"
                    class="text-sm font-semibold text-stone-700"
                >
                    Message <span class="text-red-500">*</span>
                </Label>
                <Textarea
                    id="join-message"
                    name="message"
                    bind:value={joinMessage}
                    rows={5}
                    placeholder="Introduce yourself and explain why you want to join this group..."
                    class="resize-none text-sm bg-stone-50 border-stone-200 focus:bg-white focus:border-amber-400 transition-colors rounded-lg"
                    required
                />
                <p class="text-xs text-stone-400">
                    The leader will review your request before accepting it.
                </p>
            </div>

            <Dialog.Footer class="gap-2">
                <Button
                    type="button"
                    variant="outline"
                    class="cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg"
                    onclick={() => (joinDialogOpen = false)}
                    disabled={joinLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    class="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer rounded-lg shadow-sm"
                    disabled={joinLoading || !joinMessage.trim()}
                >
                    {joinLoading ? "Sending..." : "Send Request"}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
