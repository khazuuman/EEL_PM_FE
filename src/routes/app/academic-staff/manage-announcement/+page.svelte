<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, BellIcon } from "lucide-svelte";

    const { data } = $props();
    // let announcements = $derived(data?.announcements || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "campus-management";
    let announcements = $derived(
        (data?.announcements || []).map((item: any) => ({
            ...item,
            targets:
                item.targets?.map((t: any) => t.roleName).join(", ") ?? "—",
        })),
    );
    const ActiveStatus = [
        {
            label: "Active",
            value: "true",
            variant: "active",
        },
        {
            label: "Inactive",
            value: "false",
            variant: "destructive",
        },
    ];

    let filters = $derived([
        {
            title: "Status",
            key: "isActive",
            data: ActiveStatus,
        },
    ]);
    let defaultHeaders = $state(["title", "content", "targets", "isActive"]);
    let headerValues = $state({
        title: "Title",
        content: "Content",
        targets: "Notification To",
        isActive: "Active",
    });
</script>

<div class="bg-white w-full px-10 rounded-md pt-5 overflow-x-hidden pb-10 z-10">
    <div class="flex items-center h-12">
        <Button
            variant="ghost"
            onclick={() => goto(`/app`)}
            class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer -ml-3"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            Back
        </Button>
    </div>
    <!-- Page Title -->
    <div class="flex items-center justify-between mb-6 mt-2 px-1">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"
            >
                <BellIcon class="w-5 h-5 text-amber-500" />
            </div>
            <div>
                <p
                    class="text-[11px] font-semibold text-amber-500 uppercase tracking-widest leading-none mb-0.5"
                >
                    Management
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    Announcement List
                </h1>
            </div>
        </div>
        <div
            class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-100"
        >
            <span class="text-sm text-stone-400 font-medium">Total</span>
            <span class="text-sm font-extrabold text-stone-800"
                >{totalCount}</span
            >
            <span class="text-sm text-stone-400">announcements</span>
        </div>
    </div>
    <DataTable
        showAction={true}
        actions={["view", "update", "delete"]}
        showAddButton={true}
        statuses={[]}
        keyId={"announcementId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Announcement"}
        {defaultHeaders}
        items={announcements}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["title"]}
        {filters}
    />
</div>
