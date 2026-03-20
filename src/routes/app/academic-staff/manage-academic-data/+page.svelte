<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon } from "lucide-svelte";
    import ImportStudentDialog from "../components/ImportStudentDialog.svelte";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";

    const { data } = $props();
    let students = $derived(data?.students || []);
    let majors = $derived(data?.majors || []);
    let campuses = $derived(data?.campuses || []);
    let classes = $derived(data?.classes || []);
    let semesters = $derived(data?.semesters || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "staff-student-management";

    let filters = $derived([
        {
            title: "Majors",
            key: "majorId",
            data: majors,
        },
        {
            title: "Campuses",
            key: "campusId",
            data: campuses,
        },
        {
            title: "Classes",
            key: "classId",
            data: classes,
        },
    ]);
    let defaultHeaders = $state([
        "studentCode",
        "fullName",
        "email",
        "majorCode",
        "classCode",
        "campusName",
    ]);
    let headerValues = $state({
        studentCode: "Student Code",
        fullName: "Full Name",
        email: "Email",
        majorCode: "Major Code",
        classCode: "Class Code",
        campusName: "Campus Name",
    });
</script>

<div
    class="bg-white w-full px-10 rounded-md pt-30 h-fit overflow-x-hidden pb-10 z-10"
>
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <DataTable
        showImport={true}
        showView={false}
        statuses={[]}
        keyId={"studentId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Student"}
        {defaultHeaders}
        items={students}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["studentName", "studentCode"]}
        {filters}
    >
        {#snippet importDialog({ open, setOpen })}
            <ImportStudentDialog
                {open}
                onOpenChange={setOpen}
                {semesters}
                {campuses}
                onImport={async ({ semesterId, campusId, file }) => {
                    const formData = new FormData();
                    formData.append("semesterId", semesterId);
                    formData.append("campusId", campusId);
                    formData.append("file", file);

                    const res = await fetch("?/importAcademicData", {
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
