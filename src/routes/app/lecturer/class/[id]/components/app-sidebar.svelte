<script lang="ts">
  import NavProjects from "./nav-projects.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import type { UserProfileDto } from "$lib/types/user";
  import {
    BookUserIcon,
    FolderIcon,
    ListTodoIcon,
    MessageCircleQuestionMarkIcon,
    UserCogIcon,
    UsersIcon,
  } from "lucide-svelte";
  let {
    ref = $bindable(null),
    collapsible = "icon",
    user,
    classId,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: UserProfileDto;
    classId: string;
  } = $props();

  const lecturerNav = $derived({
    projects: [
      {
        name: "Student",
        url: `/app/lecturer/class/${classId}/student-management`,
        icon: BookUserIcon,
      },
      {
        name: "Group",
        url: `/app/lecturer/class/${classId}/group-management`,
        icon: UsersIcon,
      },
      {
        name: "Topic",
        url: `/app/lecturer/class/${classId}/topic-management`,
        icon: FolderIcon,
      },
      {
        name: "Assignment/Checkpoint",
        url: `/app/lecturer/class/${classId}/assignment-checkpoint-management`,
        icon: ListTodoIcon,
      },
      {
        name: "Request",
        url: `/app/lecturer/class/${classId}/request-management`,
        icon: MessageCircleQuestionMarkIcon,
      },
      {
        name: "Mentor",
        url: `/app/lecturer/class/${classId}/mentor-management`,
        icon: UserCogIcon,
      },
    ],
  });
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <NavUser {user} />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavProjects projects={lecturerNav.projects} />
  </Sidebar.Content>
</Sidebar.Root>
