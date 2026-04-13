<!-- layout.svelte (lecturer/class/[id]) -->
<script lang="ts">
    import type { LayoutData } from "./$types";
    import { page } from "$app/stores";
    import ChatWidget from "$lib/components/chat/ChatWidget.svelte";

    let { data, children } = $props<{ data: LayoutData; children: any }>();

    const user = $page.data.user;
    const token = $page.data.accessToken;
</script>

<div>
    {@render children()}
</div>


{#if user && data.groups && data.groups.length > 0}
    <ChatWidget
        groupId={user.student.group.groupId}
        {token}
        userId={user.userId}
        {user}
    />
{/if}
