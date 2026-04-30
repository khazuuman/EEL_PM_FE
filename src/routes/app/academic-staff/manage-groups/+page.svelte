<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import { ArrowLeftIcon, DownloadIcon, LayersIcon } from "lucide-svelte";
    import { GroupStatusTable } from "$lib/enums/group.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    const { data } = $props();
    let groups = $derived(data?.groups || []);
    let classes = $derived(data?.classes || []);
    let semesters = $derived(data?.semesters || []);
    let totalCount = $derived(data?.totalCount || 0);

    // let searchTerm = $state(data.filters?.searchTerm ?? "");
    // let classId = $state(data.filters?.classId ?? "");
    // let semesterId = $state(data.filters?.semesterId ?? "");
    const cacheKeyName = "staff-group-management";

    let exporting = $state(false);

    //export
    async function handleExport() {
        exporting = true;
        try {
            const currentParams = new URL(window.location.href).searchParams;

            const params = new URLSearchParams();
            const searchTerm = currentParams.get("searchTerm");
            const classId = currentParams.get("classId");
            const semesterId = currentParams.get("semesterId");

            if (searchTerm) params.set("searchTerm", searchTerm);
            if (classId) params.set("classId", classId);
            if (semesterId) params.set("semesterId", semesterId);

            const res = await fetch(`/api/export/groups?${params.toString()}`);
            if (!res.ok) {
                toast.error("Failed to export groups.");
                return;
            }

            const disposition = res.headers.get("content-disposition") ?? "";
            const filenameMatch =
                disposition.match(/filename\*=UTF-8''([^;\n]+)/i) ??
                disposition.match(/filename="?([^";\n]+)"?/i);
            const filename = filenameMatch
                ? decodeURIComponent(filenameMatch[1])
                : `top_tier_groups.xlsx`;

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Groups exported successfully.");
        } catch {
            toast.error("Failed to export groups.");
        } finally {
            exporting = false;
        }
    }

    let filters = $derived([
        {
            title: "Class",
            key: "classId",
            data: classes,
        },
        {
            title: "Semester",
            key: "semesterId",
            data: semesters,
        },
    ]);
    let defaultHeaders = $state([
        "name",
        "memberCount",
        "maxMember",
        "status",
        "leaderName",
        "classCode",
        "semesterCode",
    ]);
    let headerValues = $state({
        name: "Group Name",
        memberCount: "Member Count",
        maxMember: "Max Member",
        status: "Status",
        leaderName: "Leader",
        classCode: "Class",
        semesterCode: "Semester",
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

<div class="bg-white w-full px-10 rounded-md pt-5 overflow-x-hidden pb-10 z-10">
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
                <LayersIcon class="w-5 h-5 text-amber-500" />
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
                    Group List
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
            <span class="text-sm text-stone-400">groups</span>
        </div>
    </div>
    <DataTable
        showAction={true}
        actions={["view"]}
        showAddButton={false}
        statuses={GroupStatusTable}
        keyId={"id"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Group"}
        {defaultHeaders}
        items={groups}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["name"]}
        {filters}
    >
        {#snippet headerActions()}
            <Button
                class="gap-2 px-3 py-4 rounded-sm cursor-pointer"
                onclick={handleExport}
                disabled={exporting}
            >
                {#if exporting}
                    <div
                        class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-400 border-t-transparent"
                    ></div>
                    Exporting...
                {:else}
                    <DownloadIcon class="h-3.5 w-3.5" />
                    Export Groups
                {/if}
            </Button>
        {/snippet}
    </DataTable>
</div>
