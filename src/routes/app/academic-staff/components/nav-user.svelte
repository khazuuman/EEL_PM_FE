<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import type { UserProfileDto } from "$lib/types/user";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import { CircleUserRoundIcon } from "lucide-svelte";
  let { user }: { user: UserProfileDto } = $props();
  const sidebar = useSidebar();

  let dropdownMenu = $derived([
    {
      label: "My Profile",
      path: "/app/student/my-profile",
      icon: CircleUserRoundIcon,
    },
    {
      label: "Logout",
      path: "/auth/logout",
      icon: LogOutIcon,
    },
  ]);
</script>

{#snippet dropdownItem(o: (typeof dropdownMenu)[number])}
  {@const Icon = o.icon}
  <DropdownMenu.Item onclick={() => goto(o.path)}>
    <Icon />
    {o.label}
  </DropdownMenu.Item>
{/snippet}

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            {...props}
          >
            <Avatar.Root class="size-8 rounded-lg">
              <Avatar.Image
                src={user.avatarUrl ?? undefined}
                alt={user.fullName}
              />
              <Avatar.Fallback
                class="rounded-lg bg-amber-400 text-black font-bold"
              >
                {user.fullName?.charAt(0).toUpperCase() ?? "U"}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.fullName}</span>
              <span class="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon class="ms-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        side={sidebar.isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <Avatar.Root class="size-8 rounded-lg">
              <Avatar.Image
                src={user.avatarUrl ?? undefined}
                alt={user.fullName}
              />
              <Avatar.Fallback
                class="rounded-lg bg-amber-400 text-black font-bold"
              >
                {user.fullName?.charAt(0).toUpperCase() ?? "U"}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.fullName}</span>
              <span class="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        {#each dropdownMenu as item}
          {@render dropdownItem(item)}
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
