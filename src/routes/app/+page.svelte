<script lang="ts">
    import type { LayoutData } from "../$types";
    import { error } from "@sveltejs/kit";

    export type NavigationItem = {
        name: string;
        url: string;
    };

    export type NavigationGroup = {
        groupLabel: string;
        items: NavigationItem[];
    };

    const studentClassGroup: NavigationGroup = {
        groupLabel: "Class",
        items: [
            { name: "View Groups In Class", url: "/app/student/groups" },
            {
                name: "Assignment / Checkpoint",
                url: "/app/student/assignment-checkpoint",
            },
            { name: "View Students In Class", url: "/app/student/students" },
            { name: "Mentor", url: "/app/student/mentor" },
        ],
    };

    const studentLeaderProjectGroup: NavigationGroup = {
        groupLabel: "Project",
        items: [
            { name: "Manage Group Project", url: "/app/student/group-project" },
            {
                name: "Register Project Topic",
                url: "/app/student/register-topic",
            },
            {
                name: "Create Topic Change Request",
                url: "/app/student/topic-change",
            },
        ],
    };

    const studentLeaderGroup: NavigationGroup = {
        groupLabel: "Group (Leader)",
        items: [
            {
                name: "Edit My Group Information",
                url: "/app/student/edit-my-group",
            },
            { name: "Manage My Group", url: "/app/student/my-group" },
            { name: "Invite Member", url: "/app/student/invite-member" },
            {
                name: "My Sent Invitations",
                url: "/app/student/my-sent-invitations",
            },
            {
                name: "Review Join Requests",
                url: "/app/student/review-join-requests",
            },
        ],
    };

    const studentMemberGroup: NavigationGroup = {
        groupLabel: "Group",
        items: [
            {
                name: "Group Invitations",
                url: "/app/student/group-invitations",
            },
            { name: "View My Group", url: "/app/student/my-group" },
        ],
    };

    const studentMemberProject: NavigationGroup = {
        groupLabel: "Project",
        items: [
            { name: "View Group Project", url: "/app/student/group-project" },
        ],
    };

    // ___________________Mentor__________________________
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

    // ___________________Staff__________________________
    const staffClassNav: NavigationGroup = {
        groupLabel: "Class",
        items: [
            {
                name: "Manage Classes",
                url: "/app/academic-staff/manage-classes",
            },
        ],
    };
    const staffGroupNav: NavigationGroup = {
        groupLabel: "Group",
        items: [
            {
                name: "Manage Groups",
                url: "/app/academic-staff/manage-groups",
            },
        ],
    };
    const staffAcademicDataNav: NavigationGroup = {
        groupLabel: "Academic Data",
        items: [
            {
                name: "Manage Academic Data",
                url: "/app/academic-staff/manage-academic-data",
            },
            {
                name: "Manage Mentor Data",
                url: "/app/academic-staff/manage-students",
            },
            {
                name: "Manage Lecturers",
                url: "/app/academic-staff/manage-lecturers",
            },
        ],
    };
    const staffOtherNav: NavigationGroup = {
        groupLabel: "Others",
        items: [
            {
                name: "Manage Semesters",
                url: "/app/academic-staff/manage-semester",
            },
            {
                name: "Manage Courses",
                url: "/app/academic-staff/manage-courses",
            },
            {
                name: "Manage Campuses",
                url: "/app/academic-staff/manage-campuses",
            },
        ],
    };

    // ___________________Admin__________________________
    const adminSystemNav: NavigationGroup = {
        groupLabel: "System",
        items: [
            {
                name: "Monitor System Changes (Audit Log)",
                url: "/app/admin/monitor-system",
            },
            {
                name: "Config System Rules",
                url: "/app/admin/config-rules",
            },
            {
                name: "Manage Roles",
                url: "/app/admin/manage-roles",
            },
        ],
    };

    let { data } = $props<{ data: LayoutData }>();
    const user = data.user;
    let roleLabel = [] as string[];

    let finalNavGroups = [] as NavigationGroup[];

    if (user.roles.includes("Student")) {
        roleLabel.push("Student");
        finalNavGroups.push(studentClassGroup);
        if (user.student?.group?.isLeader === true) {
            finalNavGroups.push(studentLeaderGroup);
            finalNavGroups.push(studentLeaderProjectGroup);
        } else {
            finalNavGroups.push(studentMemberGroup);
            finalNavGroups.push(studentMemberProject);
        }
    }

    if (user.roles.includes("Lecturer")) {
        throw error(404, "Not Found!");
    }

    if (user.roles.includes("Mentor")) {
        roleLabel.push("Mentor");
        finalNavGroups.push(mentorGroupNav);
        finalNavGroups.push(mentorProjectNav);
        finalNavGroups.push(mentorAssignmentNav);
    }

    if (user.roles.includes("AcademicStaff")) {
        roleLabel.push("Academic Staff");
        finalNavGroups.push(staffClassNav);
        finalNavGroups.push(staffGroupNav);
        finalNavGroups.push(staffAcademicDataNav);
        finalNavGroups.push(staffOtherNav);
    }

    if (user.roles.includes("Admin")) {
        roleLabel.push("Admin");
        finalNavGroups.push(adminSystemNav);
    }

    const displayLabel =
        roleLabel.length > 1 ? roleLabel.join(" & ") : (roleLabel[0] ?? "");
</script>

<div class="pt-15 bg-white z-100">
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
