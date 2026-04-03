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

    const overviewData = $derived([
        {
            label: "Total Groups",
            value: totalItems,
            icon: Layers2Icon,
        },
    ]);

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
            if (searchQuery) params.set("Keyword", searchQuery);
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
    <div class="bg-white sticky top-14 z-40">
        <div class="mx-auto px-4 sm:px-6">
            <div class="flex items-center h-12">
                <Button
                    variant="ghost"
                    onclick={() => goto(`/app`)}
                    class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer -ml-3"
                >
                    <ArrowLeftIcon class="w-4 h-4" />
                    Back to Home
                </Button>
            </div>
        </div>
    </div>

    <div class="mx-auto px-4 sm:px-6 py-8">
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

        <!-- Stats Row -->
        <div class="flex flex-wrap gap-3 mb-8">
            {#each overviewData as stat}
                {@const Icon = stat.icon}
                <div
                    class="flex items-center gap-3 px-5 py-3 rounded-xl bg-stone-50 border border-stone-100"
                >
                    <div
                        class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0"
                    >
                        <Icon class="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <p
                            class="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-0.5"
                        >
                            {stat.label}
                        </p>
                        <p
                            class="text-lg font-extrabold text-stone-800 leading-none"
                        >
                            {stat.value}
                        </p>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Groups Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each groups as group}
                {@const cfg = statusConfig[group.status] ?? {
                    class: "bg-stone-100 text-stone-500 border border-stone-200",
                    dot: "bg-stone-400",
                }}
                {@const fillPct = Math.round(
                    (group.memberCount / group.maxMember) * 100,
                )}
                {@const isFull = group.memberCount >= group.maxMember}

                <div
                    class="group/card relative flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-amber-300 hover:shadow-md transition-all duration-200"
                >
                    <!-- Card top accent stripe -->
                    <div
                        class="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
                    ></div>

                    <div class="p-5 flex flex-col flex-1">
                        <!-- Header -->
                        <div
                            class="flex items-start justify-between gap-2 mb-4"
                        >
                            <h3
                                class="font-bold text-stone-900 text-base leading-snug line-clamp-2"
                            >
                                {group.name}
                            </h3>
                            <span
                                class="inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold {cfg.class}"
                            >
                                <span class="w-1.5 h-1.5 rounded-full {cfg.dot}"
                                ></span>
                                {group.status}
                            </span>
                        </div>

                        <!-- Leader -->
                        <div class="flex items-center gap-2 mb-3">
                            <div
                                class="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0"
                            >
                                <UserStarIcon
                                    class="w-3.5 h-3.5 text-amber-600"
                                />
                            </div>
                            <div class="min-w-0">
                                <p
                                    class="text-xs text-stone-400 leading-none mb-0.5"
                                >
                                    Leader
                                </p>
                                <p
                                    class="text-sm font-semibold text-stone-700 truncate"
                                >
                                    {group.leaderName}
                                </p>
                            </div>
                        </div>

                        <!-- Members -->
                        <div class="mt-auto pt-3 border-t border-stone-100">
                            <div class="flex items-center justify-between mb-2">
                                <div
                                    class="flex items-center gap-1.5 text-xs text-stone-500"
                                >
                                    <UsersIcon class="w-3.5 h-3.5" />
                                    <span class="font-medium"
                                        >{group.memberCount}<span
                                            class="text-stone-300 mx-0.5"
                                            >/</span
                                        >{group.maxMember} members</span
                                    >
                                </div>
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

                        <!-- Actions -->
                        <form
                            method="POST"
                            action="?/getGroupDetail"
                            use:enhance={handleEnhance}
                            class="mt-4"
                        >
                            <input
                                type="hidden"
                                name="groupId"
                                value={group.id}
                            />
                            <div class="flex gap-2">
                                <Button
                                    type="submit"
                                    class="flex-1 h-9 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg cursor-pointer shadow-sm"
                                >
                                    <EyeIcon class="w-3.5 h-3.5 mr-1.5" />
                                    View Detail
                                </Button>
                                {#if !user?.student?.group && (group.status === "Rejected" || group.status === "Draft")}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        class="flex-1 h-9 text-sm cursor-pointer border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 rounded-lg"
                                        onclick={() => openJoinDialog(group)}
                                    >
                                        <UsersIcon class="w-3.5 h-3.5 mr-1.5" />
                                        Join
                                    </Button>
                                {/if}
                            </div>
                        </form>
                    </div>
                </div>
            {/each}
        </div>
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
                    placeholder="Giới thiệu bản thân và lý do bạn muốn tham gia nhóm này..."
                    class="resize-none text-sm bg-stone-50 border-stone-200 focus:bg-white focus:border-amber-400 transition-colors rounded-lg"
                    required
                />
                <p class="text-xs text-stone-400">
                    Leader sẽ xem xét yêu cầu của bạn trước khi chấp nhận.
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
