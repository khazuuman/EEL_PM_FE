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
    console.log("user in gorup page: ", user);
    const groups = $derived(data.groups as any[]);
    const totalItems = $derived(data.totalItems as any);
    let searchQuery = $state(page.url.searchParams.get("search") ?? "");
    // Thêm vào phần script
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
            label: "TOTAL GROUPS",
            value: totalItems,
            icon: Layers2Icon,
        },
        // {
        //     label: "TOTAL MEMBERS",
        //     value: "58/60",
        //     icon: Layers2Icon,
        // },
        // {
        //     label: "FULL GROUPS",
        //     value: "8",
        //     icon: Layers2Icon,
        // },
    ]);

    const statusClass: Record<string, string> = {
        Draft: "bg-gray-200 text-gray-600",
        Pending: "bg-gray-200 text-gray-600",
        Approved: "bg-green-200 text-green-600",
        Active: "bg-green-200 text-green-600",
        Rejected: "bg-red-200 text-red-600",
        Completed: "bg-blue-200 text-blue-600",
    };

    // Debounce để tránh gọi quá nhiều khi gõ
    let debounceTimer: ReturnType<typeof setTimeout>;

    function updateURL() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const params = new URLSearchParams();
            if (searchQuery) params.set("Keyword", searchQuery);
            goto(`?${params.toString()}`, {
                replaceState: true, // không tạo history entry mới mỗi lần gõ
                keepFocus: true,
                noScroll: true,
            });
        }, 300);
    }

    // Tự động update URL khi state thay đổi
    $effect(() => {
        searchQuery;
        updateURL();
    });

    let detailOpen = $state(false);
    let selectedGroup = $state<any>(null);

    // trong enhance callback của form getGroupDetail:
    const handleEnhance: SubmitFunction = () => {
        return async ({ result }) => {
            if (result.type === "success" && result.data?.group) {
                selectedGroup = result.data.group;
                detailOpen = true;
            }
        };
    };
</script>

{#snippet overviewCard(o: (typeof overviewData)[number])}
    {@const Icon = o.icon}
    <div
        class="flex w-fit px-8 py-4 rounded-4xl bg-white gap-4 justify-center items-center"
    >
        <span
            class="bg-amber-100 rounded-full p-2 w-10 h-10 flex justify-center items-center"
        >
            <Icon class="w-5 h-5 text-amber-600" />
        </span>
        <span
            class="text-[14px] text-stone-400 font-bold flex flex-col items-start"
        >
            {o.label}
            <span class="text-[18px] font-bold text-black">{o.value}</span>
        </span>
    </div>
{/snippet}
<div class="pt-20">
    <div class="w-full flex items-center">
        <Button
            variant="ghost"
            onclick={() => goto(`/app`)}
            class="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-6 transition-all cursor-pointer"
        >
            <ArrowLeftIcon class="w-5 h-5" />
            <span class="text-base font-semibold">Home</span>
        </Button>
    </div>
    <div class="p-6 bg-stone-100 w-full h-full">
        <h1 class="text-3xl font-extrabold mb-2">Groups</h1>
        <div class="flex flex-col lg:flex-row justify-between items-center">
            <p class="text-[16px] text-stone-500">
                View all groups in this class
            </p>
            <div class="flex flex-col lg:flex-row gap-4">
                <div class="relative w-70">
                    <Input
                        id="search"
                        placeholder="Search group name..."
                        class="ps-8"
                        bind:value={searchQuery}
                    />
                    <SearchIcon
                        class="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 opacity-50 select-none"
                    />
                </div>
            </div>
        </div>
        <div class="flex flex-wrap gap-5 mt-10">
            {#each overviewData as cardInfo}
                {@render overviewCard(cardInfo)}
            {/each}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {#each groups as group}
                <div class="card rounded-md p-4 bg-white">
                    <span
                        class="w-full flex justify-between font-bold text-xl items-center mb-3"
                        >{group.name}
                        <Badge
                            class={statusClass[group.status] ??
                                "bg-stone-200 text-stone-600"}
                        >
                            {group.status}
                        </Badge></span
                    >
                    <span
                        class="flex gap-2 text-stone-600 text-[16px] items-center mb-1 font-bold"
                        ><UserStarIcon
                            class="w-5 h-5 text-amber-700"
                        />{group.leaderName}
                        <span class="text-red-700 font-bold text-[14px]"
                            >(Leader)</span
                        ></span
                    >
                    <span
                        class="flex gap-2 text-stone-600 text-[16px] items-center"
                        ><UsersIcon
                            class="w-5 h-5"
                        />{group.memberCount}/{group.maxMember} Members</span
                    >
                    <Progress
                        value={group.memberCount}
                        max={group.maxMember}
                        class="w-full my-5 [&>div]:bg-amber-600"
                    />
                    <form
                        method="POST"
                        action="?/getGroupDetail"
                        use:enhance={handleEnhance}
                    >
                        <input type="hidden" name="groupId" value={group.id} />
                        <div class="flex gap-2">
                            <Button
                                type="submit"
                                class="flex-1 bg-amber-600 cursor-pointer"
                            >
                                <EyeIcon />View Detail
                            </Button>
                            {#if !user?.student?.group && (group.status === "Rejected" || group.status === "Draft")}
                                <Button
                                    type="button"
                                    variant="outline"
                                    class="flex-1 cursor-pointer border-amber-600 text-amber-600 hover:bg-amber-50"
                                    onclick={() => openJoinDialog(group)}
                                >
                                    <UsersIcon class="w-4 h-4" />Join
                                </Button>
                            {/if}
                        </div>
                    </form>
                </div>
            {/each}
        </div>
    </div>
    <GroupDetail
        open={detailOpen}
        onOpenChange={(v) => (detailOpen = v)}
        group={selectedGroup}
    />
</div>
<Dialog.Root bind:open={joinDialogOpen}>
    <Dialog.Content class="max-w-xl">
        <Dialog.Header class="space-y-2">
            <Dialog.Title class="text-xl font-bold text-zinc-900">
                Join Group
            </Dialog.Title>
            <Dialog.Description class="text-sm text-zinc-500">
                Send a join request to
                <span class="font-semibold text-zinc-900">
                    {selectedJoinGroup?.name}
                </span>
            </Dialog.Description>
        </Dialog.Header>

        <form
            method="POST"
            action="?/joinRequest"
            use:enhance={handleJoinEnhance}
        >
            <input type="hidden" name="groupId" value={selectedJoinGroup?.id} />

            <div class="flex flex-col gap-2.5 my-6">
                <Label
                    for="join-message"
                    class="text-sm font-semibold text-zinc-700"
                >
                    Message <span class="text-red-500">*</span>
                </Label>
                <Textarea
                    id="join-message"
                    name="message"
                    bind:value={joinMessage}
                    rows={6}
                    placeholder="Nhập lý do bạn muốn tham gia nhóm này..."
                    class="resize-none text-sm"
                    required
                />
                <p class="text-xs text-zinc-400">
                    Hãy giới thiệu bản thân và lý do bạn muốn tham gia nhóm này.
                </p>
            </div>

            <Dialog.Footer class="gap-2">
                <Button
                    type="button"
                    variant="outline"
                    class="cursor-pointer"
                    onclick={() => (joinDialogOpen = false)}
                    disabled={joinLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    class="bg-amber-600 hover:bg-amber-700 cursor-pointer"
                    disabled={joinLoading || !joinMessage.trim()}
                >
                    {joinLoading ? "Sending..." : "Send Request"}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
