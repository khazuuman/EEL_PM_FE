<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, ImportIcon, UsersIcon } from "lucide-svelte";
    import ImportMentorDialog from "../components/ImportMentorDialog.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { goto } from "$app/navigation";

    const { data } = $props();
    let mentors = $derived(data?.mentors || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "staff-mentor-management";

    let filters = $derived([]);
    let defaultHeaders = $state([
        "mentorCode",
        "fullName",
        "email",
        "phoneNumber",
        "fieldOfWork",
        // "biography",
        // "isActive",
    ]);
    let headerValues = $state({
        mentorCode: "Mentor Code",
        fullName: "Full Name",
        email: "Email",
        phoneNumber: "Phone Number",
        fieldOfWork: "Field Of Work",
        // biography: "Biography",
        // isActive: "Status",
    });

    let importOpen = $state(false);
</script>

<div
    class="bg-white w-full min-h-screen px-10 rounded-md pt-5 h-fit overflow-x-hidden pb-10 z-10 select-none"
>
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
    <!-- Page Title -->
    <div class="flex items-center justify-between mb-6 mt-2 px-1">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"
            >
                <UsersIcon class="w-5 h-5 text-amber-500" />
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
                    Mentor List
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
            <span class="text-sm text-stone-400">mentors</span>
        </div>
    </div>

    <DataTable
        showAction={true}
        showAddButton={false}
        actions={['view']}
        statuses={[]}
        keyId={"mentorId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Mentor"}
        {defaultHeaders}
        items={mentors}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["mentorName", "mentorCode"]}
        {filters}
    >
        <!-- {#snippet headerActions()}
            <Button class="gap-2 flex justify-center items-center px-3 py-4 rounded-sm cursor-pointer" onclick={() => (importOpen = true)}>
                <ImportIcon />Import mentor
            </Button>

            <ImportMentorDialog
                open={importOpen}
                onOpenChange={(v) => (importOpen = v)}
            />
            <ImportMentorDialog open={importOpen}
                onOpenChange={(v) => (importOpen = v)} />
        {/snippet} -->
    </DataTable>
</div>
