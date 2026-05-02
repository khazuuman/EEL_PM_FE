<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, BookAIcon } from "lucide-svelte";
    import { onMount } from "svelte";

    const { data } = $props();
    let topics = $derived(data?.topics || []);
    let totalCount = $derived(data?.totalCount || 0);
    let classes = $derived(data?.classes || []);
    let semesters = $derived(data?.semesters || []);
    let courses = $derived(data?.courses || []);

    const ReviewStatus = [
        {
            label: "Approved",
            value: "Approved",
            variant: "active",
        },
        {
            label: "Rejected",
            value: "Rejected",
            variant: "destructive",
        },
        {
            label: "Pending",
            value: "Pending",
            variant: "default",
        },
    ];

    const cacheKeyName = "topic-management";
    let filters = $derived([
        {
            title: "Status",
            key: "status",
            data: ReviewStatus,
        },
        { title: "Classes", key: "classId", data: classes },
        { title: "Semesters", key: "semesterId", data: semesters },
        { title: "Courses", key: "courseId", data: courses },
    ]);
    let defaultHeaders = $state(["title", "status", "groupName", "classCode"]);
    let headerValues = $state({
        title: "Title",
        status: "Status",
        groupName: "Group",
        classCode: "Class",
    });

    // onMount(() => {
    //     const currentUrl = new URL(window.location.href);
    //     if (
    //         !currentUrl.searchParams.has("semesterId") &&
    //         data?.currentSemesterId
    //     ) {
    //         currentUrl.searchParams.set("semesterId", data.currentSemesterId);
    //         goto(currentUrl.toString(), {
    //             replaceState: true,
    //             noScroll: true,
    //             keepFocus: true,
    //         });
    //     }
    // });
</script>

<div class="bg-white w-full pt-5 px-5 rounded-md h-screen overflow-hidden">
    <div class="flex items-center">
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
                <BookAIcon class="w-5 h-5 text-amber-500" />
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
                    Topic List
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
            <span class="text-sm text-stone-400">topics</span>
        </div>
    </div>
    <DataTable
        showAction={true}
        showAddButton={false}
        actions={["view"]}
        statuses={ReviewStatus}
        keyId={"topicId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Course"}
        {defaultHeaders}
        items={topics}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["title"]}
        {filters}
    />
</div>
