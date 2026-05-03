<script lang="ts">
    import { RefreshCwIcon } from "lucide-svelte";
    import type { LayoutData } from "../$types";
    import Button from "$lib/components/ui/button/button.svelte";
    import SyncDataDialog from "./components/SyncDataDialog.svelte";

    export type NavigationItem = {
        name: string;
        url: string;
    };

    export type NavigationGroup = {
        groupLabel: string;
        items: NavigationItem[];
    };

    const staffAcademicDataNav: NavigationGroup = {
        groupLabel: "Academic Data",
        items: [
            {
                name: "View Student",
                url: "/app/academic-staff/manage-academic-data",
            },
            {
                name: "View Lecturer",
                url: "/app/academic-staff/manage-lecturers",
            },
            {
                name: "View Mentor",
                url: "/app/academic-staff/manage-mentors",
            },
            {
                name: "View Topics",
                url: "/app/academic-staff/manage-topic",
            },
            {
                name: "View Groups",
                url: "/app/academic-staff/manage-groups",
            },
            {
                name: "View Report",
                url: "/app/academic-staff/view-report",
            },
        ],
    };
    const staffOtherNav: NavigationGroup = {
        groupLabel: "Others",
        items: [
            {
                name: "Manage Courses",
                url: "/app/academic-staff/manage-courses",
            },
            {
                name: "Manage Annoucement",
                url: "/app/academic-staff/manage-announcement",
            },
        ],
    };

    let { data } = $props<{ data: LayoutData }>();
    const user = data.user;
    let roleLabel = [] as string[];
    let syncOpen = $state(false);

    let finalNavGroups = [] as NavigationGroup[];

    if (user.roles.includes("AcademicStaff")) {
        roleLabel.push("Academic Staff");
        finalNavGroups.push(staffAcademicDataNav);
        finalNavGroups.push(staffOtherNav);
    }

    const displayLabel =
        roleLabel.length > 1 ? roleLabel.join(" & ") : (roleLabel[0] ?? "");
</script>

<div class="pt-10 bg-white z-100">
    <!-- Header row -->
    <div class="flex items-center justify-center gap-4 pt-10 relative">
        <h1 class="text-3xl font-bold text-amber-900">
            {displayLabel} Home Page
        </h1>
        <!-- <div class="absolute right-20">
            <Button
                class="gap-2 px-3 py-2 rounded-sm cursor-pointer text-sm"
                onclick={() => (syncOpen = true)}
            >
                <RefreshCwIcon size={16} />
                Sync Data
            </Button>
        </div> -->
    </div>

    <div class="w-full p-20 flex flex-col gap-10">
        <!-- Quick Actions Section -->
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
                <span
                    class="text-sm font-semibold uppercase tracking-widest text-amber-700"
                >
                    Quick Actions
                </span>
                <div class="flex-1 h-px bg-amber-200"></div>
            </div>
            <div class="flex gap-3">
                <Button
                    class="gap-2 px-4 py-2 rounded-md cursor-pointer
                       bg-orange-100 text-orange-700 text-sm font-medium
                       border border-orange-200 hover:bg-gray-100 hover:text-gray-800
                       hover:border-gray-200 transition-all duration-200"
                    onclick={() => (syncOpen = true)}
                >
                    <RefreshCwIcon size={16} />
                    Sync Data From FAP
                </Button>
            </div>
        </div>
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
<SyncDataDialog open={syncOpen} onOpenChange={(v: any) => (syncOpen = v)} />
