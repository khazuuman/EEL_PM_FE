<script lang="ts" module>
  import AudioWaveformIcon from "@lucide/svelte/icons/audio-waveform";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import BotIcon from "@lucide/svelte/icons/bot";
  import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
  import CommandIcon from "@lucide/svelte/icons/command";
  import FrameIcon from "@lucide/svelte/icons/frame";
  import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
  import MapIcon from "@lucide/svelte/icons/map";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";
  import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";
  // This is sample data.
  const studentData = {
    navMain: [
      {
        title: "Playground",
        url: "#",
        icon: SquareTerminalIcon,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        icon: BotIcon,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpenIcon,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2Icon,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Dashboard",
        url: "/app/student/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        name: "Group",
        url: "#",
        icon: UsersIcon,
      },
      {
        name: "Project",
        url: "#",
        icon: FolderIcon,
      },
      {
        name: "Assignment",
        url: "#",
        icon: ListTodoIcon,
      },
      {
        name: "Mentor",
        url: "#",
        icon: FolderIcon,
      },
      {
        name: "News",
        url: "#",
        icon: NewspaperIcon,
      },
    ],
  };
</script>

<script lang="ts">
  import NavMain from "./nav-main.svelte";
  import NavProjects from "./nav-projects.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import type { UserProfileDto } from "$lib/types/user";
    import { FolderIcon, LayoutDashboardIcon, ListTodoIcon, NewspaperIcon, UsersIcon } from "lucide-svelte";
  let {
    ref = $bindable(null),
    collapsible = "icon",
    user,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & { user: UserProfileDto } = $props();

</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <NavUser {user} />
    <!-- <NavUser {user} /> -->
  </Sidebar.Header>
  <Sidebar.Content>
    <!-- <NavMain items={data.navMain} /> -->
    <NavProjects projects={studentData.projects} />
  </Sidebar.Content>
  <!-- <Sidebar.Footer>
    <NavUser user={data.user} />
  </Sidebar.Footer>
  <Sidebar.Rail /> -->
</Sidebar.Root>
