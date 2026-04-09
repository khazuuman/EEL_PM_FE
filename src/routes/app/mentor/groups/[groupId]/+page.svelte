<!-- page.svelte (lecturer/class/[id]) -->
<script lang="ts">
    import { ArrowLeftIcon } from "lucide-svelte";
    import type { PageData } from "../$types";
    import type { NavigationGroup } from "../../../+page.svelte";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import { getHeaderCtx } from "$lib/contexts/header.context.svelte";
    import { onDestroy } from "svelte";
    let { data } = $props<{ data: PageData }>();
    const classId = data.classDetails?.classId;

    const mentorGroupNav: NavigationGroup = {
        groupLabel: "Group",
        items: [
            {
                name: "Manage Meeting Schedule",
                url: "/app/mentor/manage-schedule",
            },
        ],
    };

    const mentorProjectNav: NavigationGroup = {
        groupLabel: "Project",
        items: [
            { name: "View Group Project", url: "/app/mentor/group-project" },
            {
                name: "View Project Documents",
                url: "/app/mentor/project-documents",
            },
        ],
    };

    const mentorAssignmentNav: NavigationGroup = {
        groupLabel: "Assignment / Checkpoint",
        items: [
            {
                name: "View Checkpoint/Assignment",
                url: "/app/mentor/assignment-checkpoint",
            },
        ],
    };
    let finalNavGroups = [] as NavigationGroup[];
    finalNavGroups.push(mentorGroupNav);
    finalNavGroups.push(mentorProjectNav);
    finalNavGroups.push(mentorAssignmentNav);

    const headerCtx = getHeaderCtx();

    // Set subtitle khi vào trang
    $effect(() => {
        headerCtx.setSubtitle(data.groupDetails.groupName ?? null);
    });

    // Xóa khi rời trang
    onDestroy(() => {
        headerCtx.setSubtitle(null);
    });
</script>

<div class="w-full flex items-center pt-5 pl-10">
    <Button
        variant="ghost"
        onclick={() => goto(`/app/mentor/groups`)}
        class="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-6 transition-all cursor-pointer"
    >
        <ArrowLeftIcon class="w-5 h-5" />
        <span class="text-base font-semibold">Back to Group List</span>
    </Button>
</div>
<h1 class="w-full text-center pt-10 text-3xl font-bold text-amber-900">
    Mentor Home Page
</h1>

<div class="w-full p-20 flex flex-col gap-10">
    {#each finalNavGroups as group}
        <div class="flex flex-col gap-3">
            <!-- Group Label -->
            <div class="flex items-center gap-3">
                <span
                    class="text-sm font-semibold uppercase tracking-widest text-amber-700"
                >
                    {group.groupLabel}
                </span>
                <div class="flex-1 h-px bg-amber-200"></div>
            </div>

            <!-- Items -->
            <div class="grid grid-cols-2 gap-3">
                {#each group.items as item}
                    <a
                        href={item.url}
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-md
              bg-orange-100 text-orange-700 text-sm font-medium
              border border-orange-200 transition-all duration-200
              hover:bg-gray-100 hover:text-gray-800 hover:border-gray-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    >
                        {item.name}
                    </a>
                {/each}
            </div>
        </div>
    {/each}
</div>
