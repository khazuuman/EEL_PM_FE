<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, ImportIcon } from "lucide-svelte";
    import ImportMentorDialog from "../components/ImportMentorDialog.svelte";
    import Button from "$lib/components/ui/button/button.svelte";

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
        "biography",
        "isActive",
    ]);
    let headerValues = $state({
        mentorCode: "Mentor Code",
        fullName: "Full Name",
        email: "Email",
        phoneNumber: "Phone Number",
        fieldOfWork: "Field Of Work",
        biography: "Biography",
        isActive: "Status",
    });

    let importOpen = $state(false);
</script>

<div
    class="bg-white w-full min-h-screen px-10 rounded-md pt-30 h-fit overflow-x-hidden pb-10 z-10 select-none"
>
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app"
    >
        <ArrowLeftIcon />Back to Dashboard
    </a>

    <DataTable
        showAction={true}
        showAddButton={true}
        showView={false}
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
    {#snippet actions()}
            <Button class="gap-2 flex justify-center items-center px-3 py-4 rounded-sm cursor-pointer" onclick={() => (importOpen = true)}>
                <ImportIcon />Import mentor
            </Button>

            <ImportMentorDialog
                open={importOpen}
                onOpenChange={(v) => (importOpen = v)}
            />
            <ImportMentorDialog open={importOpen}
                onOpenChange={(v) => (importOpen = v)} />
        {/snippet}
    </DataTable>
</div>
