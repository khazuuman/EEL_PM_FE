<script lang="ts" module>
  // This is sample data.
  const studentNavData = [
    {
      name: "Groups",
      url: "#",
      icon: ComponentIcon,
    },
    {
      name: "My Group",
      url: "#",
      icon: DiamondIcon,
    },
    {
      name: "Project/Topic",
      url: "#",
      icon: FolderIcon,
    },
    {
      name: "Request",
      url: "#",
      icon: ListTodoIcon,
    },
    {
      name: "Assignment/Checkpoint",
      url: "#",
      icon: NotebookPenIcon,
    },
    {
      name: "Students",
      url: "#",
      icon: UsersIcon,
    },
    {
      name: "Mentor",
      url: "#",
      icon: UserCheckIcon,
    },
    {
      name: "News",
      url: "#",
      icon: NewspaperIcon,
    },
  ];
</script>

<script lang="ts">
  import NavProjects from "./nav-item.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import type { UserProfileDto } from "$lib/types/user";
  import {
    ComponentIcon,
    DiamondIcon,
    FolderIcon,
    GraduationCapIcon,
    ListTodoIcon,
    NewspaperIcon,
    NotebookPenIcon,
    UserCheckIcon,
    UsersIcon,
  } from "lucide-svelte";
  let {
    ref = $bindable(null),
    collapsible = "icon",
    isRoot = false,
    user,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: UserProfileDto;
    isRoot?: boolean;
  } = $props();
</script>

<Sidebar.Root
  {collapsible}
  {...restProps}
  class={isRoot
    ? "w-screen! max-w-none! border-none flex flex-col justify-center items-center"
    : ""}
>
  <Sidebar.Header>
    <div
      class="flex flex-row w-full justify-between items-center gap-10 bg-white"
    >
      <header class="w-full bg-white">
        <div class="flex gap-5">
          <GraduationCapIcon color="#f2a20d" class="w-8 h-8" />
          <div class="text-lg font-bold flex justify-center items-center">
            <h1>EXE</h1>
            <span class="mx-2 h-0.75 w-2.5 bg-black"></span>
            <h1>FPT University Portal</h1>
          </div>
        </div>
      </header>
      <div class="flex flex-row w-120">
        <NavUser {user} />
        {#if isRoot}
          <span class="w-60 flex flex-row justify-center items-center text-xl text-stone-700 font-bold"
            >Class: {user.student?.classCode
              ? user.student?.classCode
              : "SE1820"}</span
          >
        {/if}
      </div>
    </div>
  </Sidebar.Header>
  <Sidebar.Content
    class={isRoot ? "flex flex-col justify-center items-center" : ""}
  >
    <NavProjects projects={studentNavData} {isRoot} />
  </Sidebar.Content>
</Sidebar.Root>
