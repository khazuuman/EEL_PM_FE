<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";
    import ImportMentorDialog from "../components/ImportMentorDialog.svelte";

    const { data } = $props();
    let mentors = $derived(data?.mentors || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "staff-mentor-management";

    let filters = $derived([
        // {
        //     title: "Majors",
        //     key: "majorId",
        //     data: majors,
        // },
        // {
        //     title: "Campuses",
        //     key: "campusId",
        //     data: campuses,
        // },
        // {
        //     title: "Classes",
        //     key: "classId",
        //     data: classes,
        // },
    ]);
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
</script>

<div
    class="bg-white w-full px-10 rounded-md pt-30 h-fit overflow-x-hidden pb-10 z-10 select-none"
>
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <DataTable
        showAction={true}
        showAddButton={true}
        showImport={true}
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
        {#snippet importDialog({ open, setOpen })}
            <ImportMentorDialog
                {open}
                onOpenChange={setOpen}
                onImport={async ({ file }) => {
                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch("?/importMentorData", {
                        method: "POST",
                        body: formData,
                    });

                    const result = await res.json();

                    if (result?.type === "failure") {
                        toast.error(result?.data?.message ?? "Import failed!");
                        throw new Error(result?.data?.message);
                    }

                    toast.success("Import successfully!");
                    await invalidateAll();
                    setOpen(false);
                }}
            />
        {/snippet}
    </DataTable>
</div>
