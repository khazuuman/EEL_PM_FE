<script lang="ts">
    import { ArrowLeftIcon } from "lucide-svelte";
    import type { PageData } from "../$types";
    import type { NavigationGroup } from "../../../+page.svelte";
    let { data } = $props<{ data: PageData }>();
    const classId = data.classDetails?.classId;

    const lecturerGroupManage: NavigationGroup = {
        groupLabel: "Student Group",
        items: [
            {
                name: "Manage Group",
                url: `/app/lecturer/class/${classId}/manage-groups`,
            },
            {
                name: "Group Approval",
                url: `/app/lecturer/class/${classId}/group-approval`,
            },
            {
                name: "Assign Mentor to Group",
                url: `/app/lecturer/class/${classId}/assign-mentor`,
            },
        ],
    };
    const lecturerStudentManage: NavigationGroup = {
        groupLabel: "Student Management",
        items: [
            {
                name: "View Student List",
                url: `/app/lecturer/class/${classId}/student-list`,
            },
        ],
    };
    const lecturerProjectManage: NavigationGroup = {
        groupLabel: "Student Project",
        items: [
            {
                name: "View Topic List",
                url: `/app/lecturer/class/${classId}/topic-list`,
            },
            {
                name: "Review Group Topic Registration",
                url: `/app/lecturer/class/${classId}/topic-registration`,
            },
            {
                name: "View Group Topic Change History",
                url: `/app/lecturer/class/${classId}/topic-history`,
            },
            {
                name: "View project documents",
                url: `/app/lecturer/class/${classId}/project-documents`,
            },
        ],
    };
    const lecturerAssignmentManage: NavigationGroup = {
        groupLabel: "Assignment / Checkpoint Management",
        items: [
            {
                name: "Checkpoints Management",
                url: `/app/lecturer/class/${classId}/checkpoints-management`,
            },
            {
                name: "Assignment Management",
                url: `/app/lecturer/class/${classId}/assignments-management`,
            },
        ],
    };
    let finalNavGroups = [] as NavigationGroup[];
    finalNavGroups.push(lecturerStudentManage);
    finalNavGroups.push(lecturerGroupManage);
    finalNavGroups.push(lecturerProjectManage);
    finalNavGroups.push(lecturerAssignmentManage);
</script>

<div class="pt-15">
    <a
        class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
        href="/app/lecturer/class"><ArrowLeftIcon />Back to Classes</a
    >
    <h1 class="w-full text-center pt-10 text-3xl font-bold text-amber-900">
        Lecturer Home Page
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
</div>
