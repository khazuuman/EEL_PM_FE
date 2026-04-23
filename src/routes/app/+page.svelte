<script lang="ts">
    import ROLE from "$lib/enums/role";
    import type { LayoutData } from "../$types";
    import { error, redirect } from "@sveltejs/kit";

    export type NavigationItem = {
        name: string;
        url: string;
    };

    export type NavigationGroup = {
        groupLabel: string;
        items: NavigationItem[];
    };

    // ___________________Admin__________________________
    const adminSystemNav: NavigationGroup = {
        groupLabel: "System",
        items: [
            {
                name: "Manage Staff",
                url: "/app/admin/manage-staff",
            },
            {
                name: "Setting System Email",
                url: "/app/admin/config-email",
            },
        ],
    };

    let { data } = $props<{ data: LayoutData }>();
    const user = data.user;
    let roleLabel = [] as string[];

    let finalNavGroups = [] as NavigationGroup[];

    if (user.roles.includes(ROLE.STUDENT)) {
        throw redirect(302, "/app/student");
    }

    if (user.roles.includes(ROLE.LECTURER)) {
        throw redirect(302, "/app/lecturer/class");
    }

    if (
        [ROLE.LECTURER, ROLE.MENTOR, ROLE.STUDENT, ROLE.ACADEMICSTAFF].some((role) =>
            user.roles.includes(role),
        )
    ) {
        throw error(404, "Not Found!");
    }

    if (user.roles.includes("Admin")) {
        roleLabel.push("Admin");
        finalNavGroups.push(adminSystemNav);
    }

    const displayLabel =
        roleLabel.length > 1 ? roleLabel.join(" & ") : (roleLabel[0] ?? "");
</script>

<div class="pt-10 bg-white z-100">
    <h1 class="w-full text-center pt-10 text-3xl font-bold text-amber-900">
        {displayLabel} Home Page
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
