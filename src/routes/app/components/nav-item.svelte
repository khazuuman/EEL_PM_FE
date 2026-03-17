<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  let {
    projects,
    isRoot = false,
  }: {
    projects: {
      name: string;
      url: string;
      icon: any;
    }[];
    isRoot?: boolean;
  } = $props();
</script>

<Sidebar.Group class={isRoot ? "w-full max-w-sm flex flex-col justify-center items-center gap-10 mb-20" : ""}>
  <Sidebar.GroupLabel class={isRoot ? "text-center mb-2 font-bold text-3xl" : ""}>Menu</Sidebar.GroupLabel>
  <Sidebar.Menu class={isRoot ? "flex flex-col justify-center items-center gap-5" : ""}>
    {#each projects as item (item.name)}
    {@const Icon = item.icon}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class={isRoot ? "flex h-10 items-center gap-4 px-6 py-3 text-base rounded-xl hover:bg-accent" : ""}>
          {#snippet child({ props })}
            <a href={item.url} {...props}>
              <Icon class={isRoot ? "shrink-0" : "shrink-0"}
                    style={isRoot ? "width: 28px; height: 28px;" : "width: 16px; height: 16px;"} />
              <span class={isRoot ? "text-2xl" : "group-data-[collapsible=icon]:hidden"}>
                {item.name}
              </span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
