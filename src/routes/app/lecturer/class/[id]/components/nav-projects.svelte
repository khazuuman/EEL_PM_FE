<script lang="ts">
  import { page } from "$app/state";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  let {
    projects,
  }: {
    projects: {
      name: string;
      url: string;
      // This should be `Component` after @lucide/svelte updates types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon: any;
    }[];
  } = $props();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.GroupLabel>Menu</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each projects as item (item.name)}
      {@const segment = item.url.split("/").pop()}
      {@const isActive = page.url.pathname.endsWith(segment ?? "")}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton {isActive}>
          {#snippet child({ props })}
            <a
              href={isActive ? undefined : item.url}
              aria-disabled={isActive}
              aria-current={isActive ? "page" : undefined}
              {...props}
            >
              <item.icon />
              <span>{item.name}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
