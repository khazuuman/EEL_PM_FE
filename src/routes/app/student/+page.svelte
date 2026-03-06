<script lang="ts">
    const studentNavData = [
        {
            name: "Groups",
            url: "#",
            //   icon: ComponentIcon,
        },
        {
            name: "My Group",
            url: "/app/student/my-group",
            //   icon: DiamondIcon,
        },
        {
            name: "Project/Topic",
            url: "#",
            //   icon: FolderIcon,
        },
        {
            name: "Request",
            url: "#",
            //   icon: ListTodoIcon,
        },
        {
            name: "Assignment/Checkpoint",
            url: "#",
            //   icon: NotebookPenIcon,
        },
        {
            name: "Students",
            url: "#",
            //   icon: UsersIcon,
        },
        {
            name: "Mentor",
            url: "#",
            //   icon: UserCheckIcon,
        },
        {
            name: "News",
            url: "#",
            //   icon: NewspaperIcon,
        },
    ];
</script>

{#snippet navItem(o: (typeof studentNavData)[number])}
    <!-- {@const Icon = o.icon} -->
    <a
        href={o.url}
        class="
    inline-flex items-center gap-2
    px-4 py-2 rounded-md
    bg-orange-50 text-orange-700
    text-sm font-medium
    border border-orange-200
    transition-all duration-200 ease-in-out
    hover:bg-gray-100 hover:text-gray-800 hover:border-gray-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
        {o.name}
    </a>
{/snippet}
<h1 class="w-full text-center pt-10 text-3xl font-bold text-amber-900">Menu Items</h1>
<div class="w-full h-full p-20 grid grid-cols-2 gap-4">
    {#each studentNavData as item}
        {@render navItem(item)}
    {/each}
</div>
