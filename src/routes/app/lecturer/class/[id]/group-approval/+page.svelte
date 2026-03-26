<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Progress from "$lib/components/ui/progress/progress.svelte";
    import {
        ArrowLeftIcon,
        CheckIcon,
        EyeIcon,
        Layers2Icon,
        LockKeyholeIcon,
        PlusIcon,
        SearchIcon,
        SettingsIcon,
        UsersIcon,
        UserStarIcon,
        XIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { enhance } from "$app/forms";
    import GroupDetail from "../../../../student/groups/components/GroupDetail.svelte";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";

    let { data } = $props<{ data: PageData }>();
    const groups = $derived(data.groups as any[]);
    const totalItems = $derived(data.totalItems as any);
    let searchQuery = $state(page.url.searchParams.get("search") ?? "");

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

    // Approve dialog state
    let approvalOpen = $state(false);
    let approvalAction = $state<"approve" | "reject" | null>(null);
    let approvalGroupId = $state<string | null>(null);
    let feedback = $state("");
    let isSubmitting = $state(false);

    function openApprovalDialog(groupId: string, action: "approve" | "reject") {
        approvalGroupId = groupId;
        approvalAction = action;
        feedback = "";
        approvalOpen = true;
    }

    const handleApproveEnhance: SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "success") {
                approvalOpen = false;
                toast.success(
                    approvalAction === "approve"
                        ? "Group approved successfully!"
                        : "Group rejected successfully!",
                );
                await update();
            } else if (result.type === "failure") {
                toast.error(result.data?.message ?? "Something went wrong");
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
<div class="px-5 pt-20">
    <a
        class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
        href={`/app/lecturer/class/${data.classId}`}
        ><ArrowLeftIcon />Back to Dashboard</a
    >
    <div class="p-10 bg-stone-100 w-full h-full">
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
            {#if groups.length === 0}
                <div
                    class="col-span-full flex flex-col items-center justify-center py-20 text-stone-400 gap-3"
                >
                    <UsersIcon class="w-16 h-16 text-stone-300" />
                    <p class="text-xl font-semibold">No groups found</p>
                    <p class="text-sm">
                        There are no pending groups in this class yet.
                    </p>
                </div>
            {:else}
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
                            <input
                                type="hidden"
                                name="groupId"
                                value={group.id}
                            />
                            <div class="flex gap-2">
                                <Button
                                    type="submit"
                                    class="flex-1 bg-amber-600 cursor-pointer"
                                >
                                    <EyeIcon />View Detail
                                </Button>
                                {#if group.status === "Pending"}
                                    <Button
                                        type="button"
                                        variant="default"
                                        class="cursor-pointer bg-green-600 hover:bg-green-700"
                                        onclick={() =>
                                            openApprovalDialog(
                                                group.id,
                                                "approve",
                                            )}
                                    >
                                        <CheckIcon />Approve
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="default"
                                        class="cursor-pointer bg-red-600 hover:bg-red-700"
                                        onclick={() =>
                                            openApprovalDialog(
                                                group.id,
                                                "reject",
                                            )}
                                    >
                                        <XIcon />Reject
                                    </Button>
                                {/if}
                            </div>
                        </form>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>
<GroupDetail
    open={detailOpen}
    onOpenChange={(v) => (detailOpen = v)}
    group={selectedGroup}
/>
<Dialog.Root bind:open={approvalOpen}>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>
                {approvalAction === "approve"
                    ? "Approve Group"
                    : "Reject Group"}
            </Dialog.Title>
            <Dialog.Description>
                {approvalAction === "approve"
                    ? "Are you sure you want to approve this group?"
                    : "Please provide a reason for rejecting this group."}
            </Dialog.Description>
        </Dialog.Header>

        <form
            method="POST"
            action="?/approveGroup"
            use:enhance={handleApproveEnhance}
        >
            <input type="hidden" name="groupId" value={approvalGroupId} />
            <input
                type="hidden"
                name="isApproved"
                value={approvalAction === "approve"}
            />

            <div class="py-4">
                <Textarea
                    name="feedback"
                    placeholder={approvalAction === "approve"
                        ? "Optional feedback..."
                        : "Reason for rejection..."}
                    bind:value={feedback}
                    class="resize-none"
                    rows={3}
                />
            </div>

            <Dialog.Footer class="gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (approvalOpen = false)}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    class={approvalAction === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"}
                >
                    {#if isSubmitting}
                        Processing...
                    {:else}
                        {approvalAction === "approve" ? "Approve" : "Reject"}
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
