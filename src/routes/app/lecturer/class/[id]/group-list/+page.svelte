<script lang="ts">
    import { Badge } from "$lib/components/ui/badge";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Progress from "$lib/components/ui/progress/progress.svelte";
    import {
        EyeIcon,
        Layers2Icon,
        LockKeyholeIcon,
        PlusIcon,
        SearchIcon,
        SettingsIcon,
        UsersIcon,
        UserStarIcon,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

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
        {
            label: "TOTAL MEMBERS",
            value: "58/60",
            icon: Layers2Icon,
        },
        {
            label: "FULL GROUPS",
            value: "8",
            icon: Layers2Icon,
        },
    ]);

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
<div class="p-5">
    <h1 class="text-3xl font-extrabold mb-2">Groups</h1>
    <div class="flex flex-col lg:flex-row justify-between items-center">
        <p class="text-[16px] text-stone-500">
            Manage and view all groups in this class
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
            <Button
                onclick={() => goto("./group-management/create")}
                class="bg-amber-600 cursor-pointer"
                ><PlusIcon class="w-5 h-5" />Create Group</Button
            >
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
                    >{group.name}<Badge class="bg-green-100 text-green-600"
                        >{group.status}</Badge
                    ></span
                >
                <span
                    class="flex gap-2 text-stone-600 text-[16px] items-center mb-1"
                    ><UserStarIcon
                        class="w-5 h-5 text-amber-700"
                    />{group.leaderName}</span
                >
                <span class="flex gap-2 text-stone-600 text-[16px] items-center"
                    ><UsersIcon
                        class="w-5 h-5"
                    />{group.memberCount}/{group.maxMember} Memebers</span
                >
                <Progress
                    value={group.memberCount}
                    max={group.maxMember}
                    class="w-full my-5 [&>div]:bg-amber-600"
                />
                <div class="flex gap-2">
                    <Button class="flex-1 bg-amber-600 cursor-pointer"
                        ><EyeIcon />View Detail</Button
                    >
                    <Button variant="default" class="cursor-pointer"
                        ><SettingsIcon /></Button
                    >
                </div>
            </div>
        {/each}
    </div>
</div>
