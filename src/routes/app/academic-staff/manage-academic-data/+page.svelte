<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, RefreshCwIcon, UsersIcon } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import SyncDataDialog from "../components/SyncDataDialog.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    const { data } = $props();
    let students = $derived(data?.students || []);
    let majors = $derived(data?.majors || []);
    let classes = $derived(data?.classes || []);
    let totalCount = $derived(data?.totalCount || 0);
    const cacheKeyName = "staff-student-management";

    // let syncOpen = $state(false);

    let filters = $derived([
        { title: "Majors", key: "majorId", data: majors },
        { title: "Classes", key: "classId", data: classes },
    ]);
    let defaultHeaders = $state([
        "studentCode",
        "fullName",
        "email",
        "majorCode",
        "classCode",
        // "campusName",
    ]);
    let headerValues = $state({
        studentCode: "Student Code",
        fullName: "Full Name",
        email: "Email",
        majorCode: "Major Code",
        classCode: "Class Code",
        // campusName: "Campus Name",
    });

    onMount(() => {
        const currentUrl = new URL(window.location.href);
        if (
            !currentUrl.searchParams.has("semesterId") &&
            data?.currentSemesterId
        ) {
            currentUrl.searchParams.set("semesterId", data.currentSemesterId);
            goto(currentUrl.toString(), {
                replaceState: true,
                noScroll: true,
                keepFocus: true,
            });
        }
    });
</script>

<div
    class="bg-white w-full px-10 rounded-md pt-5 overflow-x-hidden pb-10 z-10"
>
    <div class="flex items-center h-12">
        <Button
            variant="ghost"
            onclick={() => goto(`/app/academic-staff`)}
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
                    Student List
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
            <span class="text-sm text-stone-400">students</span>
        </div>
    </div>
    <DataTable
        showAction={true}
        showAddButton={false}
        statuses={[]}
        actions={['view']}
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
        <!-- {#snippet headerActions()}
            <Button
                class="gap-2 px-3 py-4 rounded-sm cursor-pointer"
                onclick={() => (syncOpen = true)}
            >
                <RefreshCwIcon size={16} />
                Sync Data
            </Button>

            <SyncDataDialog
                open={syncOpen}
                onOpenChange={(v: any) => (syncOpen = v)}
            />
        {/snippet} -->
    </DataTable>
</div>
